'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import LoginLogo from '../ui/login-logo'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { CREATE_TOKEN } from '../lib/graphQL/mutation'
import { READ_ONE_SEALOGS_MEMBER } from '../lib/graphQL/query'
import { useApolloClient } from '@apollo/client/react/hooks/useApolloClient'
import { classes } from '../components/GlobalClasses'
function LoginForm() {
    const router = useRouter()
    const apolloClient = useApolloClient()
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoginSuccessful, setIsLoginSuccessful] = useState(false)
    async function handleFormSubmit(values: any) {
        setErrorMessage('')
        await loginUser({
            variables: {
                email: values.email,
                password: values.password,
            },
        })
    }
    const [readOneSeaLogsMember, { loading: readOneSeaLogsMemberLoading }] =
        useLazyQuery(READ_ONE_SEALOGS_MEMBER, {
            fetchPolicy: 'no-cache',
            onCompleted: (response: any) => {
                const data = response.readOneSeaLogsMember
                if (data) {
                    localStorage.setItem('clientId', data.clientID)
                    localStorage.setItem('clientTitle', data.client.title)
                    localStorage.setItem('useDepartment', data.client.useDepartment)
                    localStorage.setItem(
                        'departmentId',
                        data.currentDepartmentID,
                    )
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

                    localStorage.setItem(
                        'permissions',
                        JSON.stringify(permissions),
                    )
                    const containsAdmin =
                        data.groups.nodes.some(
                            (group: any) => group.code === 'admin',
                        ) || permissions.includes('ADMIN')
                    localStorage.setItem(
                        'admin',
                        containsAdmin ? 'true' : 'false',
                    )
                    const containsCrew = data.groups.nodes.some(
                        (group: any) => group.code === 'crew',
                    )
                    localStorage.setItem(
                        'crew',
                        containsCrew ? 'true' : 'false',
                    )
                    const superAdmin =
                        localStorage.getItem('superAdmin') === 'true'
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
    const [loginUser, { loading: loginUserLoading }] = useMutation(
        CREATE_TOKEN,
        {
            onCompleted: (response: any) => {
                const data = response.createToken
                if (data.token) {
                    const token = data.token
                    localStorage.setItem('sl-jwt', token)
                    localStorage.setItem(
                        'firstName',
                        data.member.firstName ?? '',
                    )
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

                    setIsLoginSuccessful(true)
                } else {
                    setErrorMessage('Your username or password is incorrect.')
                }
            },
            onError: (error: any) => {
                console.error('loginUser error', error)
            },
        },
    )

    useEffect(() => {
        if (isLoginSuccessful) {
            loadUserInfo()
        }
    }, [isLoginSuccessful])
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 dark:text-white dark:bg-sldarkblue-900">
            <Link href="/">
                <LoginLogo />
            </Link>
            <Formik
                initialValues={{
                    email: '',
                    password: '',
                }}
                validationSchema={Yup.object({
                    email: Yup.string().required(
                        'Your email or username is required.',
                    ),
                    password: Yup.string().required('Your password required.'),
                })}
                onSubmit={(values) => {
                    handleFormSubmit(values)
                }}>
                <div className="bg-white shadow rounded-lg w-80 md:w-96 dark:bg-sldarkblue-800">
                    <h1 className="text-xl text-bold dark:bg-sldarkblue-1000 border-b rounded-t-lg p-4">
                        Log In
                    </h1>
                    {errorMessage && (
                        <div className="text-red-500 text-center border border-red-500 p-2 bg-red-50">
                            {errorMessage}
                        </div>
                    )}
                    <Form>
                        <div className="py-8 px-4">
                            <div className="py-4">
                                <Field
                                    className={`${classes.input}`}
                                    type="text"
                                    name="email"
                                    placeholder="Enter your email address or username"
                                />
                                <div className="text-red-500 text-xs">
                                    <ErrorMessage
                                        name="email"
                                        className="text-red-500 text-xs"
                                    />
                                </div>
                            </div>
                            <div>
                                <Field
                                    className={`${classes.input}`}
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                />
                                <div className="text-red-500 text-xs">
                                    <ErrorMessage
                                        name="password"
                                        className="text-red-500 text-xs"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <div>
                                    <button
                                        type="submit"
                                        disabled={
                                            loginUserLoading ||
                                            readOneSeaLogsMemberLoading
                                        }
                                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-slate-300">
                                        {loginUserLoading ||
                                        readOneSeaLogsMemberLoading
                                            ? 'Logging In...'
                                            : 'Log In'}
                                    </button>
                                </div>
                                <div>
                                    <Link
                                        href="/lost-password"
                                        className="text-blue-500">
                                        I've lost my password
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Form>
                </div>
            </Formik>
        </div>
    )
}

export default LoginForm
