import ForgotPasswordClient from './ForgotPassword'

export const metadata = {
  title: 'Forgot Password',
  description: 'Reset your password by entering your email address.',
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  alternates: {
    canonical: '/forgot-password',
  },
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}