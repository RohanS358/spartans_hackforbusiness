import type React from "react"
export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="payment-section">{children}</div>
}
