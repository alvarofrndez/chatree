import { Inter } from 'next/font/google'
import '@/styles/global.scss'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/auth'
import AuthLoadingWrapper from '@/components/AuthLoadingWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'ChatLinks',
  description: 'Share and discover AI conversations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthLoadingWrapper>
            <Header />
            {children}
            <Footer />
          </AuthLoadingWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}