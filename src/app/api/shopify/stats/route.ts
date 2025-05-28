import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET(req: NextRequest) {
  // 1. Get user session
  const supabase = await createServerClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // 2. Get store credentials and status from store_orders
  const { data: storeOrder, error } = await supabase
    .from("store_orders")
    .select("shopify_domain, shopify_access_token, status")
    .eq("user_id", user.id)
    .single();

  if (error || !storeOrder) {
    return NextResponse.json({ error: "No connected Shopify store found" }, { status: 404 });
  }

  // If store is not delivered, return default values
  if (storeOrder.status !== "Levererad") {
    return NextResponse.json({
      omsattning: 0,
      prevOmsattning: 0,
      ordrar: 0,
      prevOrdrar: 0,
      kunder: 0,
      produkter: 0,
    });
  }

  const { shopify_domain, shopify_access_token } = storeOrder;

  // 3. Fetch stats from Shopify
  const shopUrl = `https://${shopify_domain}/admin/api/2023-04`;
  const headers = { "X-Shopify-Access-Token": shopify_access_token, "Content-Type": "application/json" };

  // Date ranges for current and previous month
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));

  // Helper to fetch orders in a date range
  async function fetchOrders(start: Date, end: Date): Promise<any[]> {
    const created_at_min = start.toISOString();
    const created_at_max = end.toISOString();
    const url = `${shopUrl}/orders.json?status=any&created_at_min=${created_at_min}&created_at_max=${created_at_max}`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    return data.orders || [];
  }

  // Fetch orders for current and previous month
  const [orders, prevOrders] = await Promise.all([
    fetchOrders(currentMonthStart, currentMonthEnd),
    fetchOrders(prevMonthStart, prevMonthEnd),
  ]);

  // Customers and products: Shopify only supports count, not by date, so just fetch total
  const customersRes = await fetch(`${shopUrl}/customers/count.json`, { headers });
  const customersData = await customersRes.json();
  const productsRes = await fetch(`${shopUrl}/products/count.json`, { headers });
  const productsData = await productsRes.json();

  // Calculate total sales (omsättning)
  const omsattning = orders.filter((o: any) => o.financial_status === "paid").reduce((sum: number, o: any) => sum + parseFloat(o.total_price), 0);
  const prevOmsattning = prevOrders.filter((o: any) => o.financial_status === "paid").reduce((sum: number, o: any) => sum + parseFloat(o.total_price), 0);

  return NextResponse.json({
    omsattning,
    prevOmsattning,
    ordrar: orders.length,
    prevOrdrar: prevOrders.length,
    kunder: customersData.count,
    produkter: productsData.count,
  });
} 