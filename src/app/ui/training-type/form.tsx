'use client'

import { useEffect, useState } from 'react'
import { TrainingTypeType } from '../../../../types/training-type'
import { useMutation } from '@apollo/client'
import { InputSkeleton } from '../skeletons'
import { Vessel } from '../../../../types/vessel'
import { isEmpty, trim } from 'lodash'
import {
    Button,
    Heading,
    DialogTrigger,
    Dialog,
    Modal,
    ModalOverlay,
} from 'react-aria-components'
import { useRouter } from 'next/navigation'
import {
    CREATE_TRAINING_TYPE,
    UPDATE_TRAINING_TYPE,
    DELETE_TRAINING_TYPE,
} from '@/app/lib/graphQL/mutation'
import Editor from '../editor'
import Select from 'react-select'
import { SeaLogsButton } from '@/app/components/Components'
import { getVesselList, getTrainingTypeByID } from '@/app/lib/actions'
import { classes } from '@/app/components/GlobalClasses'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import Loading from '@/app/loading'

const TrainingTypeForm = ({
    trainingTypeId = 0,
}: {
    trainingTypeId: number
}) => {
    const router = useRouter()
    const [trainingType, setTrainingType] = useState<any>()
    const [vessels, setVessels] = useState<any>()
    const [chkVessels, setChkVessels] = useState<any>()
    const [isSelectAll, setIsSelectAll] = useState(false)
    const [hasFormErrors, setHasFormErrors] = useState(false)
    const [formErrors, setFormErrors] = useState({
        Title: '',
    })
    const [selectedTrainingType, setSelectedTrainingType] =
        useState<TrainingTypeType | null>(null)
    const [trainingTypes, setTrainingTypes] = useState<any>()
    const [procedure, setProcedure] = useState(false)

    const handleSetTrainingType = (trainingType: any) => {
        setTrainingType(trainingType)
        setProcedure(trainingType?.procedure)
    }

    getTrainingTypeByID(trainingTypeId, handleSetTrainingType)

    const handleSetVessels = (vessels: any) => {
        const activeVessels = vessels.filter((vessel: any) => !vessel.archived)
        setVessels(activeVessels)
    }

    getVesselList(handleSetVessels)

    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        const intValues = ['HighWarnWithin', 'MediumWarnWithin', 'OccursEvery']
        let newValue = value
        if (intValues.includes(name)) {
            newValue = +value
        }
        setTrainingType({
            ...trainingType,
            [name]: newValue,
            ID: +trainingTypeId,
        })
    }
    const handleSelectAllChange = (event: any) => {
        const { checked } = event.target
        const newChkVessels = chkVessels.map((v: any) => {
            return {
                ...v,
                isChecked: checked,
            }
        })
        setIsSelectAll(checked)
        setChkVessels(newChkVessels)
        setTrainingType({
            ...trainingType,
            Vessels: newChkVessels
                .filter((v: any) => v.isChecked)
                .map((v: any) => ({
                    ID: v.id,
                    Title: v.label,
                })),
        })
    }
    const handleVesselChange = (event: any) => {
        setTrainingType({
            ...trainingType,
            Vessels: event.map((v: any) => ({
                ID: v.value,
                Title: v.label,
            })),
        })
    }
    const [
        mutationUpdateTrainingType,
        { loading: mutationUpdateTrainingTypeLoading },
    ] = useMutation(UPDATE_TRAINING_TYPE, {
        onCompleted: (response: any) => {
            const data = response.updateTrainingType
            if (data.id > 0) {
                router.back()
                if (trainingTypeId === 0) {
                    router.push('/training-type')
                } else {
                    router.push(`/training-type/info?id=${trainingTypeId}`)
                }
            }
        },
        onError: (error: any) => {
            console.error('mutationUpdateTrainingType error', error)
        },
    })
    const [
        mutationCreateTrainingType,
        { loading: mutationCreateTrainingTypeLoading },
    ] = useMutation(CREATE_TRAINING_TYPE, {
        onCompleted: (response: any) => {
            const data = response.createTrainingType
            if (data.id > 0) {
                router.back()
                if (trainingTypeId === 0) {
                    router.push('/training-type')
                } else {
                    router.push(`/training-type/info?id=${trainingTypeId}`)
                }
            }
        },
        onError: (error: any) => {
            console.error('mutationCreateTrainingType error', error)
        },
    })
    const handleSave = async () => {
        let hasErrors = false
        let errors = {
            Title: '',
        }
        setFormErrors(errors)
        if (
            isEmpty(
                trim(
                    (
                        document.getElementById(
                            'nature-of-training',
                        ) as HTMLInputElement
                    ).value,
                ),
            )
        ) {
            hasErrors = true
            errors.Title = 'Nature of training is required'
        }
        if (hasErrors) {
            setHasFormErrors(true)
            setFormErrors(errors)
            return
        }

        const variables = {
            input: {
                id: trainingTypeId,
                title: (
                    document.getElementById(
                        'nature-of-training',
                    ) as HTMLInputElement
                ).value,
                occursEvery: trainingType.OccursEvery,
                highWarnWithin: trainingType.HighWarnWithin,
                mediumWarnWithin: trainingType.MediumWarnWithin,
                procedure: procedure ? procedure : trainingType.procedure,
                vessels: trainingType.Vessels?.map((v: any) => v.ID).join(','),
            },
        }
        if (trainingTypeId === 0) {
            await mutationCreateTrainingType({
                variables,
            })
        } else {
            await mutationUpdateTrainingType({
                variables,
            })
        }
    }
    const handleEditorChange = (content: any) => {
        setProcedure(content)
    }

    useEffect(() => {
        if (!isEmpty(vessels)) {
            const newChkVessels = vessels.map((vessel: Vessel) => {
                return {
                    id: vessel.id,
                    label: vessel.title,
                    isChecked: trainingType?.Vessels?.some(
                        (v: any) => v?.ID === vessel.id,
                    ),
                }
            })
            setChkVessels(newChkVessels)
        }
    }, [vessels, trainingType])

    const [mutationDeleteTrainingType, {}] = useMutation(DELETE_TRAINING_TYPE, {
        onCompleted: (mutationDeleteTrainingTypeResponse: any) => {},
        onError: (error: any) => {
            console.error('mutationDeleteTrainingType error', error)
        },
    })

    const handleDeleteTrainingType = async () => {
        if (selectedTrainingType?.ID) {
            await mutationDeleteTrainingType({
                variables: {
                    id: selectedTrainingType.ID,
                },
            })
            const tt = trainingTypes.map((t: any) => {
                if (t.ID === selectedTrainingType.ID) {
                    return {
                        ...t,
                        Archived: !t.Archived,
                    }
                }
                return t
            })
            const filteredList = tt.filter((t: any) => !t.Archived)
            setTrainingTypes(filteredList)
        }
    }

    const [permissions, setPermissions] = useState<any>(false)

    useEffect(() => {
        setPermissions(getPermissions)
    }, [])

    if (
        !permissions ||
        !hasPermission(
            process.env.EDIT_TRAINING || 'EDIT_TRAINING',
            permissions,
        )
    ) {
        return !permissions ? (
            <Loading />
        ) : (
            <Loading errorMessage="Oops! You do not have the permission to view this section." />
        )
    }

    return (
        <div className="w-full p-0 px-6 dark:text-white">
            <div className="flex justify-between pb-4 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    {trainingTypeId === 0 ? 'New' : 'Edit'} Training Type
                </Heading>
            </div>
            <div className="px-0 md:px-4 py-4 border-t">
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-xl">
                        Training type details
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Facilis possimus harum eaque itaque est id
                            reprehenderit excepturi eius temporibus, illo
                            officia amet nobis sapiente dolorem ipsa earum
                            adipisci recusandae cumque.
                        </p>
                    </div>
                    <div className="col-span-2">
                        <div className="my-4">
                            {!trainingType && trainingTypeId > 0 ? (
                                <InputSkeleton />
                            ) : (
                                <input
                                    id="nature-of-training"
                                    placeholder="Nature of training"
                                    name="Title"
                                    defaultValue={trainingType?.title || ''}
                                    onChange={handleInputChange}
                                    type="text"
                                    required
                                    className={classes.input}
                                />
                            )}
                            <small className="text-red-500">
                                {hasFormErrors && formErrors.Title}
                            </small>
                        </div>
                        <div className="mt-4">
                            {vessels ? (
                                <Select
                                    id="task-assigned"
                                    isMulti
                                    isClearable
                                    options={vessels?.map((vessel: any) => ({
                                        value: vessel.id,
                                        label: vessel.title,
                                    }))}
                                    defaultValue={trainingType?.vessels?.nodes?.map(
                                        (v: any) => ({
                                            value: v.id,
                                            label: v.title,
                                        }),
                                    )}
                                    onChange={handleVesselChange}
                                    menuPlacement="bottom"
                                    closeMenuOnSelect={false}
                                    placeholder="Select vessels"
                                    className={classes.selectMain}
                                    classNames={{
                                        control: () =>
                                            'block py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                        singleValue: () => 'dark:!text-white',
                                        dropdownIndicator: () => '!p-0 !hidden',
                                        indicatorSeparator: () => '!hidden',
                                        multiValue: () =>
                                            '!bg-sky-100 inline-block rounded p-1 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                                        valueContainer: () =>
                                            '!py-0 h-20 content-start',
                                        indicatorsContainer: () =>
                                            '!items-start',
                                        option: () => classes.selectOption,
                                        menu: () => classes.selectMenu,
                                    }}
                                />
                            ) : (
                                <InputSkeleton />
                            )}
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-xl">
                        Frequency
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Facilis possimus harum eaque itaque est id
                            reprehenderit excepturi eius temporibus, illo
                            officia amet nobis sapiente dolorem ipsa earum
                            adipisci recusandae cumque.
                        </p>
                    </div>
                    <div className="col-span-2">
                        <div className="my-4 flex items-center">
                            <span className="w-96 text-msm">
                                Occurs Every (days)
                            </span>
                            {!trainingType && trainingTypeId > 0 ? (
                                <InputSkeleton />
                            ) : (
                                <input
                                    name="OccursEvery"
                                    defaultValue={
                                        trainingType?.occursEvery || 0
                                    }
                                    onChange={handleInputChange}
                                    type="number"
                                    step={1}
                                    min={0}
                                    className={classes.input}
                                />
                            )}
                        </div>
                        <div className="my-4 flex items-center">
                            <span className="w-96 text-msm">
                                Medium Warning Within (e.g. 5 days)
                            </span>
                            {!trainingType && trainingTypeId > 0 ? (
                                <InputSkeleton />
                            ) : (
                                <input
                                    name="MediumWarnWithin"
                                    defaultValue={
                                        trainingType?.mediumWarnWithin || 0
                                    }
                                    onChange={handleInputChange}
                                    type="number"
                                    step={1}
                                    min={0}
                                    className={classes.input}
                                />
                            )}
                        </div>
                        <div className="my-4 flex items-center">
                            <span className="w-96 text-msm">
                                High Warning Within (e.g. 1 day)
                            </span>
                            {!trainingType && trainingTypeId > 0 ? (
                                <InputSkeleton />
                            ) : (
                                <input
                                    name="HighWarnWithin"
                                    defaultValue={
                                        trainingType?.highWarnWithin || 0
                                    }
                                    onChange={handleInputChange}
                                    type="number"
                                    step={1}
                                    min={0}
                                    className={classes.input}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-xl">
                        Procedure
                        {/* <p className='text-xs mt-4 max-w-[25rem] leading-loose'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis possimus harum eaque itaque est id reprehenderit excepturi eius temporibus, illo officia amet nobis sapiente dolorem ipsa earum adipisci recusandae cumque.</p> */}
                    </div>
                    <div className="col-span-2">
                        {!trainingType && trainingTypeId > 0 ? (
                            <InputSkeleton />
                        ) : (
                            <Editor
                                name="Procedure"
                                className={classes.editor}
                                content={procedure || ''}
                                handleEditorChange={handleEditorChange}
                                handleEditorBlur={handleEditorChange}
                            />
                        )}
                    </div>
                </div>
                <hr className="mb-4" />
                <div className="flex justify-end px-4 pb-4 pt-4">
                    <SeaLogsButton
                        // link="/training-type"
                        action={() => router.back()}
                        text="Cancel"
                        type="text"
                    />
                    <DialogTrigger>
                        <SeaLogsButton
                            text="Delete"
                            type="secondary"
                            icon="trash"
                            color="rose"
                            action={() => setSelectedTrainingType(trainingType)}
                        />
                        <ModalOverlay
                            className={({ isEntering, isExiting }) => `
                            fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur
                            ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                            ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                            `}>
                            <Modal
                                className={({ isEntering, isExiting }) => `
                                w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl
                                ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
                                ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
                            `}>
                                <Dialog
                                    role="alertdialog"
                                    className="outline-none relative">
                                    {({ close }) => (
                                        <>
                                            <Heading
                                                slot="title"
                                                className="text-xxl font-semibold leading-6 my-0 text-slate-700">
                                                Delete Training Type
                                            </Heading>
                                            <p className="mt-3 text-slate-500">
                                                {/* Are you sure you want to delete {`${selectedUser?.FirstName || 'this user'} ${selectedUser?.Surname || ''}`}? */}
                                                Are you sure you want to delete{' '}
                                                <strong>
                                                    {trainingType.Title}
                                                </strong>
                                                ?
                                            </p>
                                            <div className="mt-6 flex justify-end gap-2">
                                                <Button
                                                    onPress={close}
                                                    className="bg-slate-200 text-slate-800 hover:border-slate-300 pressed:bg-slate-300 inline-flex justify-center rounded-md border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2">
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onPress={() => {
                                                        close()
                                                        handleDeleteTrainingType()
                                                    }}
                                                    className="bg-red-500 text-white hover:border-red-600 pressed:bg-red-600 inline-flex justify-center rounded-md border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2">
                                                    Delete
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Dialog>
                            </Modal>
                        </ModalOverlay>
                    </DialogTrigger>
                    <SeaLogsButton
                        isDisabled={
                            mutationUpdateTrainingTypeLoading ||
                            mutationCreateTrainingTypeLoading
                        }
                        text={trainingTypeId === 0 ? 'Create' : 'Update'}
                        type="primary"
                        icon="check"
                        color="sky"
                        action={handleSave}
                    />
                </div>
            </div>
        </div>
    )
}
export default TrainingTypeForm
