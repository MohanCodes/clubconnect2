import './globals.css'
import type { Metadata } from "next";
import { Sora } from 'next/font/google'
import { AuthProvider } from '../firebase/context/AuthContext';
import Footer from '@/components/Footer';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "MNClubConnect - Connect with Your Club Community",
  description: "Join MNClubConnect to discover, communicate, and collaborate with student clubs.",
  keywords: "clubconnect, mnclubconnect, club, community, student, connect, MNClubConnect",
  openGraph: {
    title: "MNClubConnect - Connect with Your Club Community",
    description: "Join MNClubConnect to discover, communicate, and collaborate with student clubs.",
    url: "https://www.mnclubconnect.com",
    type: "website",
    images: [
      {
        url: "https://www.mnclubconnect.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MNClubConnect",
      },
    ],
    siteName: "MNClubConnect",
  },
  alternates: {
    canonical: "https://www.mnclubconnect.com",
  },
};

export const revalidate = 60;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={sora.variable}>
      <body>
        <AuthProvider>
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
