'use client'
import React from 'react'
import { MainLayout } from '../components/Components'
import AuthProvider from '../components/AuthProvider'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <MainLayout padding={0}>{children}</MainLayout>
        </AuthProvider>
    )
}