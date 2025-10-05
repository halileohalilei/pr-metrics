import type { Metadata } from 'next'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { QueryProvider } from '@/components/QueryProvider'
import '@mantine/core/styles.css'

export const metadata: Metadata = {
  title: 'PR Metrics',
  description: 'Analyze GitHub Pull Request review metrics for teams and individuals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider
          theme={{
            primaryColor: 'violet',
            colors: {
              violet: [
                '#f3f0ff',
                '#e5dbff',
                '#d0bfff',
                '#b197fc',
                '#9775fa',
                '#845ef7',
                '#7950f2',
                '#7048e8',
                '#6741d9',
                '#5f3dc4',
              ],
            },
          }}
        >
          <QueryProvider>{children}</QueryProvider>
        </MantineProvider>
      </body>
    </html>
  )
}

