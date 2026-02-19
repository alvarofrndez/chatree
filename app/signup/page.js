import SignupClient from './Signup'

export const metadata = {
  title: 'Sign Up',
  description: `Create your free ${process.env.NEXT_PUBLIC_APP_NAME} account and start sharing your AI conversations.`,
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  alternates: {
    canonical: '/signup',
  },
}

export default function SignupPage() {
  return <SignupClient />
}