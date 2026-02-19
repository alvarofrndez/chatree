import SigninClient from './Signin'

export const metadata = {
  title: 'Sign In',
  description: `Sign in to your ${process.env.NEXT_PUBLIC_APP_NAME} account.`,
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  alternates: {
    canonical: '/signin',
  },
}

export default function SigninPage() {
  return <SigninClient />
}