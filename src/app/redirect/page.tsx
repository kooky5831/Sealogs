'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import Loading from '../loading'
import { JwtPayload, jwtDecode } from 'jwt-decode'
import { useLazyQuery, useMutation } from '@apollo/client'
import { CREATE_TOKEN } from '../lib/graphQL/mutation'
import { useApolloClient } from '@apollo/client/react/hooks/useApolloClient'
import { useEffect, useState } from 'react'
import { isEmpty } from 'lodash'
import { READ_ONE_SEALOGS_MEMBER } from '../lib/graphQL/query'
import Link from 'next/link'
interface CustomJwtPayload extends JwtPayload {
    username: string
    pw: string
}

const Redirect = () => {
    const searchParams = useSearchParams()
    const token = searchParams.get('t')
    const router = useRouter()
    const apolloClient = useApolloClient()
    const [errorMessage, setErrorMessage] = useState('')
    const [loginUser] = useMutation(CREATE_TOKEN, {
        onCompleted: (response: any) => {
            const data = response.createToken
            if (data.token) {
                const token = data.token
                localStorage.setItem('sl-jwt', token)
                localStorage.setItem('firstName', data.member.firstName ?? '')
                localStorage.setItem('surname', data.member.surname ?? '')
                localStorage.setItem('userId', data.member.id)
                const superAdmin = data.member.superAdmin
                localStorage.setItem('superAdmin', superAdmin)
                localStorage.setItem('clientId', '0')
                localStorage.setItem('useDepartment', 'false')
                const availableClients = data.member.availableClients ?? []
                localStorage.setItem(
                    'availableClients',
                    JSON.stringify(availableClients),
                )
                localStorage.setItem('admin', 'false')

                // Update Apollo Client token
                apolloClient.defaultContext.token = localStorage
                    ?.getItem('sl-jwt')
                    ?.toString()

                loadUserInfo()
            } else {
                setErrorMessage('Your username or password is incorrect.')
            }
        },
        onError: (error: any) => {
            console.error('loginUser error', error)
        },
    })
    const handleLogin = async (credentials: any) => {
        await loginUser({
            variables: credentials,
        })
    }
    const [readOneSeaLogsMember] = useLazyQuery(READ_ONE_SEALOGS_MEMBER, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readOneSeaLogsMember
            if (data) {
                localStorage.setItem('clientId', data.clientID)
                localStorage.setItem('clientTitle', data.client.title)
                localStorage.setItem('departmentId', data.currentDepartmentID)
                localStorage.setItem('useDepartment', data.client.useDepartment)
                localStorage.setItem(
                    'departmentTitle',
                    data.currentDepartment.title,
                )
                const permissions = data.groups.nodes
                    .flatMap((node: any) => node.permissions.nodes)
                    .map((permission: any) => permission.code)

                if (data.superAdmin) {
                    permissions.push('ADMIN')
                }

                localStorage.setItem('permissions', JSON.stringify(permissions))
                const containsAdmin =
                    data.groups.nodes.some(
                        (group: any) => group.code === 'admin',
                    ) || permissions.includes('ADMIN')
                localStorage.setItem('admin', containsAdmin ? 'true' : 'false')
                const containsCrew = data.groups.nodes.some(
                    (group: any) => group.code === 'crew',
                )
                localStorage.setItem('crew', containsCrew ? 'true' : 'false')
                const superAdmin = localStorage.getItem('superAdmin') === 'true'
                if (superAdmin) {
                    router.push('/select-client?from=login')
                } else {
                    router.push('/')
                }
            } else {
                localStorage.setItem('admin', 'false')
                router.push('/')
            }
        },
        onError: (error: any) => {
            console.error('readOneSeaLogsMember error', error)
        },
    })
    const loadUserInfo = async () => {
        await readOneSeaLogsMember({
            variables: {
                filter: { id: { eq: +(localStorage.getItem('userId') ?? 0) } },
            },
        })
    }
    useEffect(() => {
        if (token) {
            const decoded = jwtDecode<CustomJwtPayload>(token)
            const { exp, username, pw } = decoded
            const isExpired = Date.now() >= exp! * 1000 * 7 * 24
            if (!isExpired) {
                const creds = {
                    email: username,
                    password: pw,
                }
                handleLogin(creds)
            } else {
                setErrorMessage(
                    'Your login session has expired. Please login again.',
                )
            }
        }
    }, [token])
    return (
        <div>
            {isEmpty(errorMessage) && <Loading message="Redirecting..." />}
            {!isEmpty(errorMessage) && (
                <div>
                    <div>{errorMessage}</div>
                    <Link href="/login">Click here to login again.</Link>
                </div>
            )}
        </div>
    )
}

export default Redirect
