import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ErrorCapture } from '@/components/error-capture'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ChatLingo',
  description: 'Chat with anyone in any language. ChatLingo automatically translates your messages in real-time.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__CHATLINGO_ERRORS = [];
              window.addEventListener('error', function(e) {
                window.__CHATLINGO_ERRORS.push({
                  type: 'error',
                  message: e.message,
                  filename: e.filename,
                  lineno: e.lineno,
                  colno: e.colno,
                  stack: e.error ? e.error.stack : null
                });
              });
              window.addEventListener('unhandledrejection', function(e) {
                window.__CHATLINGO_ERRORS.push({
                  type: 'promise',
                  message: e.reason ? (e.reason.message || String(e.reason)) : 'Unknown promise rejection',
                  stack: e.reason ? e.reason.stack : null
                });
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
      >
        <ErrorCapture />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
