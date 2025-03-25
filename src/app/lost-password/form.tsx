'use client'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import LoginLogo from '../ui/login-logo'
import Link from 'next/link'
import * as Yup from 'yup'
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { REQUEST_RESET_PASSWORD } from '../lib/graphQL/mutation'
const LostPasswordForm = () => {
    const [errorMessage, setErrorMessage] = useState('')
    const [isEmailSent, setIsEmailSent] = useState(false)
    const [email, setEmail] = useState('')
    const [requestResetPassword, { loading: resetPasswordLoading }] =
        useMutation(REQUEST_RESET_PASSWORD, {
            onCompleted: () => {
                setErrorMessage('')
                setIsEmailSent(true)
            },
            onError: (error: any) => {
                setErrorMessage(error.message)
            },
        })
    async function handleFormSubmit(values: any) {
        setErrorMessage('')
        console.log('handleFormSubmit', values)
        setEmail(values.email)
        await requestResetPassword({
            variables: {
                email: values.email,
            },
        })
    }
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 dark:text-gray-500">
            <Link href="/">
                <LoginLogo />
            </Link>
            {!isEmailSent && (
                <Formik
                    initialValues={{
                        email: '',
                    }}
                    validationSchema={Yup.object({
                        email: Yup.string().required('Your email is required.'),
                    })}
                    onSubmit={(values) => {
                        handleFormSubmit(values)
                    }}
                >
                    <div className="bg-white shadow rounded py-8 px-4 w-80 md:w-96 ">
                        <h1 className="text-xl text-bold mb-4 ">
                            Lost Password
                        </h1>
                        <div className="text-sm mb-4">
                            Enter your e-mail address and we will send you a
                            link with which you can reset your password
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
                                    type="text"
                                    name="email"
                                    placeholder="Enter your email address"
                                />
                                <div className="text-red-500 text-xs">
                                    <ErrorMessage
                                        name="email"
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
                                            ? 'Sending email...'
                                            : 'Send me the password reset link'}
                                    </button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </Formik>
            )}
            {isEmailSent && (
                <div className="bg-white shadow rounded py-8 px-4 w-80 md:w-96 ">
                    <h1 className="text-xl text-bold mb-4 ">
                        Password reset link sent to '{email}'
                    </h1>
                    <div className="text-sm mb-4">
                        Thank you! A reset link has been sent to '{email}',
                        provided an account exists for this email address.
                    </div>
                </div>
            )}
        </div>
    )
}

export default LostPasswordForm
