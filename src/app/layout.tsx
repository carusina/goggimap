import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Navbar from '@/components/Navbar'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})

export const metadata: Metadata = {
  title: '고기맵 - 콜키지 예약 서비스',
  description: '온라인에서 구입한 고기를 고깃집 빈 테이블에서 구워드세요. 부산 콜키지 예약 플랫폼.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={geistSans.variable}>
      <body className="antialiased font-sans bg-background text-foreground">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
