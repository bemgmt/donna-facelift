import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DONNA Drive — Interactive Demo',
  description: 'Experience DONNA through a live commercial real estate transaction simulation. Get in the driver seat.',
}

export default function DriveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
