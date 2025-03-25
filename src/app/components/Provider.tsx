'use client'
import React, { ReactNode } from 'react'
interface Props {
    children: ReactNode
}
const Provider = ({ children }: Props) => {
    return { children }
}

export default Provider
