import { Inter } from 'next/font/google'
import '@/styles/global.scss'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/auth'
import AuthLoadingWrapper from '@/components/AuthLoadingWrapper'
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Chatree',
  description: 'Share and discover AI conversations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthLoadingWrapper>
            <NextTopLoader 
              color="#19E6D5"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px #19E6D5,0 0 5px #19E6D5"
            />
            <Header />
            {children}
            <Footer />
          </AuthLoadingWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}