import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Catch the Stuff - PromptConsulting',
  description: 'Attrapez les clients et évitez les distractions dans ce mini-jeu interactif',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon-16x16.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF6B35',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <script
          defer
          data-domain="qr.promptconsulting.fr"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
