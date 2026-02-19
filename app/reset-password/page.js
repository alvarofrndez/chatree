import ResetPasswordClient from './ResetPassword'

export const metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your account.',
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  alternates: {
    canonical: '/reset-password',
  },
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}