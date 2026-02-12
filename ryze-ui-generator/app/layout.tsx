import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ryze UI Generator',
  description: 'AI-powered deterministic UI builder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
