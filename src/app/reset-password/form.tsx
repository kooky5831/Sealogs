'use client'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import LoginLogo from '../ui/login-logo'
import Link from 'next/link'
import * as Yup from 'yup'
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { RESET_PASSWORD } from '../lib/graphQL/mutation'
import { useSearchParams } from 'next/navigation'
import { isEmpty } from 'lodash'
const ResetPasswordForm = () => {
    const searchParam = useSearchParams()
    const token = searchParam.get('t')
    const [errorMessage, setErrorMessage] = useState('')
    const [isResetSuccessful, setIsResetSuccessful] = useState(false)
    const [resetPassword, { loading: resetPasswordLoading }] = useMutation(
        RESET_PASSWORD,
        {
            onCompleted: (response) => {
                console.log('resetPassword response', response)
                const { message, result } = response.resetPassword
                if (result === 'OK') {
                    setIsResetSuccessful(true)
                } else {
                    if (!isEmpty(message)) {
                        setErrorMessage(message[0])
                    } else {
                        setErrorMessage('')
                    }
                }
            },
            onError: (error: any) => {
                console.error('resetPassword error', error)
                setErrorMessage(error.message)
            },
        },
    )
    async function handleFormSubmit(values: any) {
        setErrorMessage('')
        await resetPassword({
            variables: {
                token: token,
                password: values.password,
                passwordConfirm: values.confirmPassword,
            },
        })
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 dark:text-gray-500">
            <Link href="/">
                <LoginLogo />
            </Link>
            {!isEmpty(token) && !isResetSuccessful && (
                <Formik
                    initialValues={{
                        password: '',
                        confirmPassword: '',
                    }}
                    validationSchema={Yup.object({
                        password: Yup.string()
                            .min(6, 'Password must be at least 6 characters')
                            .required('A password is required.'),
                        confirmPassword: Yup.string()
                            .oneOf(
                                [Yup.ref('password')],
                                'Passwords must match',
                            )
                            .required('You need to confirm your password.'),
                    })}
                    onSubmit={(values) => {
                        handleFormSubmit(values)
                    }}
                >
                    <div className="bg-white shadow rounded py-8 px-4 w-80 md:w-96 ">
                        <h1 className="text-xl text-bold mb-4 ">
                            Reset Password
                        </h1>
                        <div className="text-sm mb-4">
                            Enter your new password below.
                        </div>
                        {errorMessage && (
                            <div className="text-red-500 text-center border border-red-500 p-2 bg-red-50">
                                {errorMessage}
                            </div>
                        )}
                        <Form>
                            <div className="py-4">
                                <Field
                                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-5 text-sm placeholder:text-gray-500 "
                                    type="password"
                                    name="password"
                                    placeholder="New password"
                                />
                                <div className="text-red-500 text-xs">
                                    <ErrorMessage
                                        name="password"
                                        className="text-red-500 text-xs"
                                    />
                                </div>
                            </div>
                            <div className="py-4">
                                <Field
                                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-5 text-sm placeholder:text-gray-500 "
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                />
                                <div className="text-red-500 text-xs">
                                    <ErrorMessage
                                        name="confirmPassword"
                                        className="text-red-500 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between py-4">
                                <div>
                                    <button
                                        type="submit"
                                        disabled={resetPasswordLoading}
                                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-slate-300"
                                    >
                                        {resetPasswordLoading
                                            ? 'Saving password...'
                                            : 'Save Password'}
                                    </button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </Formik>
            )}
            {isEmpty(token) && (
                <div className="bg-white shadow rounded py-8 px-4 w-80 md:w-96 ">
                    <h1 className="text-xl text-bold mb-4 ">Change Password</h1>
                    <div className="text-sm mb-4">
                        <div className="mb-4">
                            The password reset link is inivalid or expired.
                        </div>
                        <div>
                            You can request a new one{' '}
                            <Link
                                href="/lost-password"
                                className="text-blue-500"
                            >
                                here
                            </Link>{' '}
                            or change your password after you{' '}
                            <Link href="/login" className="text-blue-500">
                                login
                            </Link>
                            .
                        </div>
                    </div>
                </div>
            )}
            {isResetSuccessful && (
                <div className="bg-white shadow rounded py-8 px-4 w-80 md:w-96 ">
                    <h1 className="text-xl text-bold mb-4 ">
                        Password Changed
                    </h1>
                    <div className="text-sm mb-4">
                        <div className="mb-4">
                            You have successfully reset your password.
                        </div>
                        <div>
                            Click{' '}
                            <Link href="/login" className="text-blue-500">
                                here
                            </Link>{' '}
                            to login.
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ResetPasswordForm
