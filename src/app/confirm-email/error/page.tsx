"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ConfirmEmailErrorPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Invalid or Expired Link</h1>
          <p className="text-muted-foreground">
            The email confirmation link is invalid or has expired. Please request a new confirmation email.
          </p>
        </div>
        <div className="grid gap-4">
          <Button asChild className="w-full">
            <Link href="/sign-in">
              Back to Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/sign-up">Create New Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 