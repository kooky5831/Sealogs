import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.sealogs.app24',
    appName: 'SeaLogs',
    webDir: 'out',
    server: {
        androidScheme: 'https',
    },
    plugins: {
        Camera: {
            ios: {
                accessModes: ['camera'],
            },
            android: {
                accessModes: ['camera'],
            },
        },
    },
}

export default config
