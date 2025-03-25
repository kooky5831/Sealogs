import { CREW_DUTY } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import Select from 'react-select'
import { CrewDuty } from '../../../../types/crew-duty'
import CrewDutyModel from '@/app/offline/models/crewDuty'
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from 'react-aria-components'
import CrewDutyForm from './form'
import { classes } from '@/app/components/GlobalClasses'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import { useOnline } from '@reactuses/core'
interface CrewDutyDropdownProps {
    crewDutyID: number
    onChange: (value: any) => void
    menuPlacement: 'bottom' | 'top'
    // duties: any
    isClearable?: boolean
    controlClasses?: 'default' | 'filter'
    filterCustomClassName?: string
    offline?: boolean
}
const CrewDutyDropdown = ({
    crewDutyID = 0,
    onChange,
    menuPlacement,
    // duties,
    isClearable = false,
    controlClasses = 'default',
    filterCustomClassName,
    offline = false,
}: CrewDutyDropdownProps) => {
    // useEffect(()=>{
    //     console.log('filterCustomClassName:',filterCustomClassName)
    // },[filterCustomClassName])
    const dutyModel = new CrewDutyModel()
    const online = false // To be replaced with useOnline()
    const [isLoading, setIsLoading] = useState(true)
    const [duties, setDuties] = useState<any>([])
    const [duty, setDuty] = useState<{ label: any; value: any } | null>(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [
        queryDuties,
        {
            loading: queryDutiesLoading,
            error: queryDutiesError,
            data: queryDutiesData,
        },
    ] = useLazyQuery(CREW_DUTY, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readCrewDuties.nodes
            if (data) {
                const dutyObject: CrewDuty = {
                    id: 0,
                    title: '-- Create New Duty --',
                    archived: false,
                    abbreviation: 'NEW',
                }
                const activeDuties = data.filter((duty: any) => !duty.archived)
                const activeDutiesWithObject = [dutyObject, ...activeDuties]
                setDuties(activeDutiesWithObject)
                if (crewDutyID > 0) {
                    const selectedDuty = activeDuties.find(
                        (d: any) => d.id === crewDutyID,
                    )
                    setDuty({
                        label: selectedDuty.title,
                        value: selectedDuty.id,
                    })
                }
            }
        },
        onError: (error: any) => {
            console.error('queryDutiesEntry error', error)
        },
    })
    const loadCrewDuties = async () => {
        if (offline) {
            const data = await dutyModel.getAll()
            if (data) {
                const dutyObject: CrewDuty = {
                    id: 0,
                    title: '-- Create New Duty --',
                    archived: false,
                    abbreviation: 'NEW',
                }
                const activeDuties = data.filter((duty: any) => !duty.archived)
                const activeDutiesWithObject = [dutyObject, ...activeDuties]
                setDuties(activeDutiesWithObject)
                if (crewDutyID > 0) {
                    const selectedDuty = activeDuties.find(
                        (d: any) => d.id === crewDutyID,
                    )
                    setDuty({
                        label: selectedDuty.title,
                        value: selectedDuty.id,
                    })
                }
            }
        } else {
            await queryDuties()
        }
    }
    const handleOnChange = (duty: any) => {
        if (isClearable && !duty) {
            onChange(duty)
            setDuty(duty)
        } else if (duty.value > 0) {
            onChange(duty)
            setDuty(duty)
        } else {
            setOpenDialog(true)
        }
    }
    const handleCreateCrewDuty = (crewDuty: any) => {
        const newDuty = { label: crewDuty.title, value: crewDuty.id }
        setDuty(newDuty)
        onChange(newDuty)
        loadCrewDuties()
        setOpenDialog(false)
    }
    useEffect(() => {
        if (isLoading) {
            loadCrewDuties()
            setIsLoading(false)
        }
    }, [isLoading])

    const [permissions, setPermissions] = useState<any>(false)
    const [edit_logBookEntry, setEdit_logBookEntry] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (
                hasPermission(
                    process.env.EDIT_LOGBOOKENTRY || 'EDIT_LOGBOOKENTRY',
                    permissions,
                )
            ) {
                setEdit_logBookEntry(true)
            } else {
                setEdit_logBookEntry(false)
            }
        }
    }

    useEffect(() => {
        setPermissions(getPermissions)
        init_permissions()
    }, [])

    useEffect(() => {
        init_permissions()
    }, [permissions])

    useEffect(() => {
        if (crewDutyID > 0 && duties.length > 0) {
            const selectedDuty = duties.find((d: any) => d.id === crewDutyID)
            if (selectedDuty) {
                setDuty({ label: selectedDuty.title, value: selectedDuty.id })
            }
        } else if (crewDutyID === 0) {
            setDuty(null)
        }
    }, [crewDutyID, duties])

    return (
        <>
            <div className="flex flex-col">
                {duties && (
                    <Select
                        id="crew-position"
                        closeMenuOnSelect={true}
                        options={duties.map((d: any) => ({
                            label: `${d.title}`,
                            value: d.id,
                        }))}
                        isDisabled={!edit_logBookEntry}
                        menuPlacement={menuPlacement}
                        defaultValue={duty}
                        value={duty}
                        onChange={handleOnChange}
                        isClearable={isClearable}
                        className={classes.selectMain}
                        classNames={{
                            control: () => classes.selectControl + ' w-full',
                            singleValue: () => classes.selectSingleValue,
                            menu: () => classes.selectMenu,
                            option: () => classes.selectOption,
                        }}
                        styles={{
                            container: (provided) => ({
                                ...provided,
                                width: '100%',
                            }),
                        }}
                    />
                )}
            </div>
            <DialogTrigger isOpen={openDialog} onOpenChange={setOpenDialog}>
                <ModalOverlay
                    className={({ isEntering, isExiting }) => `
                    fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur
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
                                <>
                                    {/* <Heading slot="title" className="text-xxl font-semibold leading-6 my-0 text-slate-700">Create New Crew Duty</Heading> */}
                                    <CrewDutyForm
                                        crewDutyId={0}
                                        showCancel
                                        onCancel={close}
                                        onSave={handleCreateCrewDuty}
                                        isPopup={true}
                                    />
                                    {/* <div className="mt-6 flex justify-end gap-2">
                                <Button onPress={close} className="bg-slate-200 text-slate-800 hover:border-slate-300 pressed:bg-slate-300 inline-flex justify-center rounded-md border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2">Cancel</Button>
                                <Button onPress={()=>{close(); handleDeleteCrewDuty()}} className="bg-blue-500 text-white hover:border-blue-600 pressed:bg-blue-600 inline-flex justify-center rounded-md border border-solid border-transparent px-5 py-2 font-semibold font-[inherit] text-base transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2">Save</Button>
                            </div> */}
                                </>
                            )}
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>
        </>
    )
}

export default CrewDutyDropdown
