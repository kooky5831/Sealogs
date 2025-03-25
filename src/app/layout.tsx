import { ApolloWrapper } from './lib/ApolloWrapper'
import './globals.css'
import { ThemeProviders } from './providers'
import AuthProvider from './components/AuthProvider'
import { Metadata, Viewport } from 'next'
import DataFetcher from './offline/components/DataFetcher'
import DataSync from './offline/components/DataSync'

export const metadata: Metadata = {
    applicationName: 'SeaLogs',
    title: {
        default: 'SeaLogs',
        template: 'SeaLogs',
    },
    description: 'SeaLogs Application',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'SeaLogs',
    },
    formatDetection: {
        telephone: false,
    },
}

export const viewport: Viewport = {
    themeColor: '#FFFFFF',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                suppressHydrationWarning={true}
                className={`font-monasans tracking-normal`}>
                <AuthProvider>
                    <ApolloWrapper>
                        <ThemeProviders>
                            <div className="datafetch" hidden>
                                <DataFetcher />
                                <DataSync />
                            </div>
                            <div className="main">{children}</div>
                        </ThemeProviders>
                    </ApolloWrapper>
                </AuthProvider>
            </body>
        </html>
    )
}
