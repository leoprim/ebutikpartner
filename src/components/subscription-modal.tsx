"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog"

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">("monthly")

  const yearlyDiscount = 0.2 // 20% discount for yearly

  const plans = [
    {
      name: "Free",
      description: "Basic when you start out with StorePartner.",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Track your store order",
        "Access to Guides Library"],
    },
    {
      name: "Premium",
      description: "Perfect for those who want to grow their store to next level.",
      monthlyPrice: 49.95,
      yearlyPrice: Math.round(49.95 * 12 * (1 - yearlyDiscount)),
      features: [
        "Unlimited access to AI-tools",
        "Advanced Guides Library content",
        "Grow with the StorePartner Community",
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-3xl p-0 sm:max-w-[700px] sm:max-h-[750px]">
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6 text-center">
              <DialogTitle className="text-3xl font-medium text-center">Upgrade to Premium!</DialogTitle>
              <DialogDescription className="text-muted-foreground text-center">
                Select from best plans, ensuring a perfect match. Need more or less? Customize your subscription for a
                seamless fit!
              </DialogDescription>
            </DialogHeader>

            {/* Billing cycle toggle */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex rounded-full bg-white p-1 shadow-sm">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`rounded-full px-8 py-2 text-sm font-medium transition-colors ${
                    billingCycle === "monthly" ? "bg-primary text-white" : "bg-transparent text-muted-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`rounded-full px-8 py-2 text-sm font-medium transition-colors ${
                    billingCycle === "yearly" ? "bg-primary text-white" : "bg-transparent text-muted-foreground"
                  }`}
                >
                  Yearly (save 20%)
                </button>
              </div>
            </div>

            {/* Pricing cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`overflow-hidden bg-white shadow-sm ${plan.name === "Premium" ? "border-primary border-2" : ""}`}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-medium">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="mb-6 mt-4">
                      <h3 className="text-3xl font-bold text-foreground">
                        ${billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice}
                      </h3>
                      <p className="text-sm text-muted-foreground">{billingCycle === "yearly" ? "/year" : "/month"}</p>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${
                        plan.name === "Free" 
                          ? "bg-white text-primary border border-primary hover:bg-primary/5%" 
                          : "text-white hover:opacity-90"
                      }`}
                    >
                      {plan.name === "Free" ? "Get Started" : "Upgrade Now"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
