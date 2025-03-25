'use client'
import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import {
    Button,
    Heading,
    Dialog,
    Modal,
    ModalOverlay,
    DialogTrigger,
} from 'react-aria-components'
import { CrewDuty } from '../../../../types/crew-duty'
import { debounce, isEmpty, trim } from 'lodash'
import { useRouter } from 'next/navigation'
import {
    CREATE_CREW_DUTY,
    UPDATE_CREW_DUTY,
    DELETE_CREW_DUTY,
} from '@/app/lib/graphQL/mutation'
import Link from 'next/link'
import { SeaLogsButton, FooterWrapper } from '@/app/components/Components'
import { getCrewDutyByID } from '@/app/lib/actions'
import { classes } from '@/app/components/GlobalClasses'
import { preventCrewAccess } from '@/app/helpers/userHelper'

interface CrewDutyFormProps {
    crewDutyId: number
    showCancel?: boolean
    onSave?: (value: any) => void
    onCancel?: (value: any) => void
    isPopup?: boolean
}
const CrewDutyForm = ({
    crewDutyId,
    showCancel = false,
    onSave,
    onCancel,
    isPopup = false,
}: CrewDutyFormProps) => {
    const [crewDuty, setCrewDuty] = useState({} as CrewDuty)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const [hasFormErrors, setHasFormErrors] = useState(false)
    const [formErrors, setFormErrors] = useState({
        title: '',
        abbreviation: '',
    })

    getCrewDutyByID(crewDutyId, setCrewDuty)

    const debouncedhandleInputChange = debounce(
        (name: string, value: string) => {
            setCrewDuty({
                ...crewDuty,
                [name]: value,
                id: +crewDutyId,
            })
        },
        300,
    )

    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        debouncedhandleInputChange(name, value)
    }

    const handleSave = async () => {
        let hasErrors = false
        let errors = {
            title: '',
            abbreviation: '',
        }
        if (isEmpty(trim(crewDuty.title))) {
            hasErrors = true
            errors.title = 'Title is required'
        }
        if (isEmpty(trim(crewDuty.abbreviation))) {
            hasErrors = true
            errors.abbreviation = 'Abbreviation is required'
        }

        if (hasErrors) {
            setHasFormErrors(true)
            setFormErrors(errors)
            return
        }
        const variables = {
            input: {
                id: +crewDuty.id,
                title: crewDuty.title,
                abbreviation: crewDuty.abbreviation,
            },
        }
        if (crewDutyId === 0) {
            await mutationCreateCrewDuty({
                variables,
            })
        } else {
            await mutationUpdateCrewDuty({
                variables,
            })
        }
    }

    const [mutationCreateCrewDuty, { loading: mutationCreateCrewDutyLoading }] =
        useMutation(CREATE_CREW_DUTY, {
            onCompleted: (response: any) => {
                const data = response.createCrewDuty
                if (data.id > 0) {
                    // if (onSave) {
                    //     onSave(data)
                    // }
                    // if (!showCancel) {
                    router.back()
                    // }
                } else {
                    console.error('mutationCreateCrewDuty error', response)
                }
            },
            onError: (error: any) => {
                console.error('mutationCreateCrewDuty error', error)
            },
        })

    const [mutationUpdateCrewDuty, { loading: mutationUpdateCrewDutyLoading }] =
        useMutation(UPDATE_CREW_DUTY, {
            onCompleted: (response: any) => {
                const data = response.updateCrewDuty
                if (data.id > 0) {
                    router.back()
                } else {
                    console.error('mutationUpdateCrewDuty error', response)
                }
            },
            onError: (error: any) => {
                console.error('mutationUpdateCrewDuty error', error)
            },
        })

    const handleDeleteCrewDuty = async (crewDuty: any) => {
        await mutationDeleteCrewDuty({
            variables: {
                ids: [crewDuty.id],
            },
        })
    }

    const [mutationDeleteCrewDuty, {}] = useMutation(DELETE_CREW_DUTY, {
        onCompleted: (mutationDeleteCrewDutyResponse: any) => {
            router.push('/settings/crew-duty/list')
        },
        onError: (error: any) => {
            console.error('mutationDeleteCrewDuty error', error)
        },
    })

    useEffect(() => {
        preventCrewAccess()
    }, [])
    return (
        <div className="w-full p-0 dark:bg-sldarkblue-800">
            <div
                className={`${isPopup ? 'px-6' : ''} flex justify-between pb-4 pt-3 items-center`}>
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    {crewDutyId === 0 ? 'Create' : 'Edit'} Crew Duty
                </Heading>
            </div>
            <div className="px-0 md:px-4 pt-4 border-t dark:text-white">
                <div
                    className={`${isPopup ? 'grid-cols-2' : 'grid-cols-3'} grid gap-6 pb-4 pt-3 px-4`}>
                    <div className={`${isPopup ? 'hidden' : ''} my-4 text-xl`}>
                        Crew duty details
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Esse minima maxime enim, consectetur hic est
                            perferendis explicabo suscipit rem reprehenderit
                            vitae ex sunt corrupti obcaecati aliquid natus et
                            inventore tenetur?
                        </p>
                    </div>
                    <div className="col-span-2 flex flex-col">
                        <div className="my-4">
                            <input
                                name="title"
                                type="text"
                                className={classes.input}
                                required
                                defaultValue={crewDuty?.title || ''}
                                onChange={handleInputChange}
                                placeholder="Duty Title"
                            />
                            <small className="text-red-500">
                                {hasFormErrors && formErrors.title}
                            </small>
                        </div>
                        <div className="mb-4">
                            <input
                                name="abbreviation"
                                type="text"
                                className={classes.input}
                                placeholder="Abbreviation"
                                required
                                defaultValue={crewDuty?.abbreviation || ''}
                                onChange={handleInputChange}
                            />
                            <small className="text-red-500">
                                {hasFormErrors && formErrors.abbreviation}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            {isPopup ? (
                <div className="flex justify-end p-4 border-t">
                    <SeaLogsButton
                        type="text"
                        text="Cancel"
                        action={onCancel}
                    />
                    {crewDutyId !== 0 ? (
                    <DialogTrigger>
                        <SeaLogsButton
                            type="secondary"
                            color="rose"
                            icon="trash"
                            text="Delete"
                        />
                        <ModalOverlay
                            className={({ isEntering, isExiting }) => `
                            fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur
                            ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                            ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                        `}>
                            <Modal
                                className={({ isEntering, isExiting }) => `
                                w-full max-w-md overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl
                                ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
                                ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
                            `}>
                                <Dialog
                                    role="alertdialog"
                                    className="outline-none relative">
                                    {({ close }) => (
                                        <div className="flex justify-center flex-col px-6 py-6">
                                            <Heading
                                                slot="title"
                                                className="text-2xl font-light leading-6 my-2 text-gray-700">
                                                Delete Crew Duty
                                            </Heading>
                                            <p className="mt-3 text-slate-500">
                                                Are you sure you want to delete
                                                "{crewDuty.title}"?
                                            </p>
                                            <hr className="my-6" />
                                            <div className="flex justify-end">
                                                <Button
                                                    className="mr-8 text-sm text-gray-600 hover:text-gray-600"
                                                    onPress={close}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    className="group inline-flex justify-center items-center rounded-md bg-sky-700 px-4 py-2 text-sm text-white shadow-sm hover:bg-white hover:text-sky-800 ring-1 ring-sky-700"
                                                    onPress={() => {
                                                        close()
                                                        handleDeleteCrewDuty(
                                                            crewDuty,
                                                        )
                                                    }}>
                                                    <svg
                                                        className="-ml-0.5 mr-1.5 h-5 w-5 border rounded-full bg-sky-300 group-hover:bg-sky-700 group-hover:text-white"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        aria-hidden="true">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                            clipRule="evenodd"></path>
                                                    </svg>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Dialog>
                            </Modal>
                        </ModalOverlay>
                    </DialogTrigger>
                    ):(
                        <></>
                    )}
                    <SeaLogsButton
                        type="primary"
                        icon="check"
                        text={`${crewDutyId === 0 ? 'Create' : 'Update'} Duty`}
                        color="sky"
                        action={handleSave}
                        isDisabled={
                            mutationCreateCrewDutyLoading ||
                            mutationUpdateCrewDutyLoading
                        }
                    />
                </div>
            ) : (
                <FooterWrapper>
                    <Link
                        href="/settings/crew-duty/list"
                        className="group inline-flex justify-center items-center">
                        <Button className="mr-6 text-sm text-gray-600 hover:text-gray-600 dark:text-white">
                            Cancel
                        </Button>
                    </Link>
                    {crewDutyId !== 0 ? (
                    <DialogTrigger>
                        <SeaLogsButton
                            type="secondary"
                            color="rose"
                            icon="trash"
                            text="Delete"
                        />
                        <ModalOverlay
                            className={({ isEntering, isExiting }) => `
                            fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur
                            ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                            ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                        `}>
                            <Modal
                                className={({ isEntering, isExiting }) => `
                                w-full max-w-md overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl
                                ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
                                ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
                            `}>
                                <Dialog
                                    role="alertdialog"
                                    className="outline-none relative">
                                    {({ close }) => (
                                        <div className="flex justify-center flex-col px-6 py-6">
                                            <Heading
                                                slot="title"
                                                className="text-2xl font-light leading-6 my-2 text-gray-700">
                                                Delete Crew Duty
                                            </Heading>
                                            <p className="mt-3 text-slate-500">
                                                Are you sure you want to delete
                                                "{crewDuty.title}"?
                                            </p>
                                            <hr className="my-6" />
                                            <div className="flex justify-end">
                                                <Button
                                                    className="mr-8 text-sm text-gray-600 hover:text-gray-600"
                                                    onPress={close}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    className="group inline-flex justify-center items-center rounded-md bg-sky-700 px-4 py-2 text-sm text-white shadow-sm hover:bg-white hover:text-sky-800 ring-1 ring-sky-700"
                                                    onPress={() => {
                                                        close()
                                                        handleDeleteCrewDuty(
                                                            crewDuty,
                                                        )
                                                    }}>
                                                    <svg
                                                        className="-ml-0.5 mr-1.5 h-5 w-5 border rounded-full bg-sky-300 group-hover:bg-sky-700 group-hover:text-white"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        aria-hidden="true">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                            clipRule="evenodd"></path>
                                                    </svg>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Dialog>
                            </Modal>
                        </ModalOverlay>
                    </DialogTrigger>
                    ):(
                        <></>
                    )}
                    <SeaLogsButton
                        type="primary"
                        icon="check"
                        text={`${crewDutyId === 0 ? 'Create' : 'Update'} Duty`}
                        color="sky"
                        action={handleSave}
                        isDisabled={
                            mutationCreateCrewDutyLoading ||
                            mutationUpdateCrewDutyLoading
                        }
                    />
                </FooterWrapper>
            )}
        </div>
    )
}

export default CrewDutyForm
