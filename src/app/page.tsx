'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const App = () => {
    const router = useRouter()
    useEffect(() => {
        router.push('/dashboard')
    }, [router])

    return <></>
}

export default App
