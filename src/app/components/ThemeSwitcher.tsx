'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'

export function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="text-white text-base">
            <button
                className={`${theme === 'light' ? 'hidden' : ''} flex`}
                onClick={() => setTheme('light')}>
                Light mode
            </button>
            <button
                className={`${theme === 'dark' ? 'hidden' : ''} flex`}
                onClick={() => setTheme('dark')}>
                Dark mode
            </button>
        </div>
    )
}
