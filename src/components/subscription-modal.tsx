"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
      description: "Perfect for individuals getting started with basic features.",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: ["3 projects", "Basic analytics", "1GB storage", "Community support", "24-hour response time"],
    },
    {
      name: "Premium",
      description: "Ideal for professionals who need advanced features and priority support.",
      monthlyPrice: 29,
      yearlyPrice: Math.round(29 * 12 * (1 - yearlyDiscount)),
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "50GB storage",
        "Priority support",
        "1-hour response time",
        "Custom domain",
        "API access",
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 sm:max-w-[700px]">
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-10" onClick={() => onOpenChange(false)}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>

        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6 text-center">
            <DialogTitle className="text-3xl font-bold">Choose your right plan!</DialogTitle>
            <DialogDescription className="text-muted-foreground">
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
                  <CardTitle className="text-xl font-bold bg-primary">{plan.name}</CardTitle>
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
                        <Check className="mr-2 h-5 w-5 shrink-0 text-[oklch(0.646_0.222_41.116)]" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.name === "Free" 
                        ? "bg-white text-[oklch(0.646_0.222_41.116)] border border-[oklch(0.646_0.222_41.116)] hover:bg-[oklch(0.646_0.222_41.116/5%)]" 
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
    </Dialog>
  )
}
