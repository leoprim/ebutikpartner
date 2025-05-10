import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard", request.url))
} 