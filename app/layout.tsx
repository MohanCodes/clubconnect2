import './globals.css'
import type { Metadata } from "next";
import { Sora } from 'next/font/google'
import { AuthProvider } from '../firebase/context/AuthContext';

export const metadata: Metadata = {
  title: "ClubConnect - Connect with Your Club Community",
  description: "Join ClubConnect to discover, communicate, and collaborate with student clubs.",
  keywords: "club, community, student, connect, ClubConnect",
  openGraph: {
    title: "ClubConnect - Connect with Your Club Community",
    description: "Join ClubConnect to discover, communicate, and collaborate with student clubs.",
    url: "https://www.clubconnect.xyz",
    type: "website",
    images: [
      {
        url: "https://www.clubconnect.xyz/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ClubConnect",
      },
    ],
  },
  alternates: {
    canonical: "https://www.clubconnect.xyz",
  },
};

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={sora.variable}>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}
