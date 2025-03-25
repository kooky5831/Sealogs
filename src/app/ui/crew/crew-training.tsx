'use client'
import React, { useState } from 'react'
import {
    Button,
    Heading,
    ListBox,
    ListBoxItem,
    Popover,
    SelectValue,
    Select as PopUpSelect,
} from 'react-aria-components'
import SignatureCanvas from 'react-signature-canvas'
import { XCircleIcon } from '@heroicons/react/24/outline'
import Select from 'react-select'
import { v4 as uuidv4 } from 'uuid'
import { useMutation } from '@apollo/client'
import { CREATE_CREW_TRAINING } from '@/app/lib/graphQL/mutation'
import dayjs from 'dayjs'

export default function CrewTraining(props: any) {
    const [memberList, setMemberList] =
        useState<{ label: string; value: string }[]>()
    const [selectedTrainer, setSelectedTrainer] = useState<any>()
    const [selectedNatureTraining, setSelectedNatureTraining] = useState<any>()
    const [selectedTrainingLocation, setSelectedTrainingLocation] =
        useState<any>()
    const [trainingSummary, setTrainingSummary] = useState()
    const [signatureMembers, setSignatureMembers] = useState([] as any[])

    const handleSelectMember = (members: any) => {
        setMemberList(members)
    }

    const handleSelectTrainer = (e: any) => {
        const idx = e.split('-')[2]
        const trainer = props.crewTrainingConfigData?.trainers[idx - 1]
        setSelectedTrainer(trainer)
    }

    const handleSelectedNatureTraining = (e: any) => {
        const idx = e.split('-')[2]
        const trainingType =
            props?.crewTrainingConfigData?.trainingTypes[idx - 1]
        setSelectedNatureTraining(trainingType)
    }

    const handleSelectedTrainingLocation = (e: any) => {
        const idx = e.split('-')[2]
        const trainingLocation = getGetTrainingLocation()
        setSelectedTrainingLocation(trainingLocation[idx - 1])
    }

    const getGetTrainingLocation = () => {
        let trainingLocation = []
        let id = 0

        if (props?.crewTrainingConfigData?.trainingLocation) {
            for (const [key, value] of Object.entries(
                props?.crewTrainingConfigData?.trainingLocation,
            )) {
                trainingLocation.push({
                    id: id++,
                    location: `${value}`,
                })
            }
        }

        return trainingLocation
    }

    const handleTextArea = (event: any) => {
        setTrainingSummary(event.target.value)
    }

    const handleSave = async () => {
        if (selectedTrainer) {
            await mutationCreatCrewTraining({
                variables: {
                    input: {
                        trainerId: selectedTrainer.id.toString(),
                        logBookEntryId: +props.vesselID,
                        crewMemberSignatures: signatureMembers,
                        created: dayjs().format('YYYY-MM-DD'),
                        trainingTypes: [selectedNatureTraining.id.toString()],
                        uuid: uuidv4(),
                        trainingSummary: trainingSummary,
                        trainingLocation: selectedTrainingLocation.location,
                    },
                },
            })
        }
    }

    const onSignatureChanged = (
        e: string,
        member: string,
        memberId: string,
    ) => {
        let signedMembers: { SignatureData: string; MemberID: string }[] = []

        if (signatureMembers && signatureMembers.length > 0) {
            const index = signatureMembers.findIndex((object) => {
                return object.MemberID === memberId
            })

            if (index !== -1) {
                signatureMembers[index].SignatureData = e
                setSignatureMembers(signatureMembers)
            } else {
                let existing = signatureMembers
                existing.push({
                    MemberID: memberId,
                    SignatureData: e,
                })
                setSignatureMembers(existing)
            }
        } else {
            signedMembers.push({
                MemberID: memberId,
                SignatureData: e,
            })
            setSignatureMembers(signedMembers)
        }
    }

    const [
        mutationCreatCrewTraining,
        {
            loading: mutationCreatCrewTrainingLoading,
            error: mutationCreatCrewTrainingError,
            data: mutationCreatCrewTrainingData,
        },
    ] = useMutation(CREATE_CREW_TRAINING, {
        onCompleted: (response: any) => {
            console.log(`Response: ${JSON.stringify(response)}`)
        },
        onError: (error: any) => {
            console.error(
                `Exception encountered @ mutationCreatCrewTraining ${error}`,
            )
        },
    })

    return (
        <>
            <div
                className={`grid grid-cols-1 my-3 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white ${props.locked ? 'pointer-events-none' : ''}`}>
                <label className="hidden md:block">Trainer</label>
                <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center">
                        <PopUpSelect
                            aria-label="Select Member"
                            onSelectionChange={handleSelectTrainer}>
                            <Button
                                className={
                                    'w-64 peer flex justify-between rounded-md border border-gray-200 p-2 text-sm outline-2 placeholder:text-gray-500'
                                }>
                                <SelectValue />
                                <span aria-hidden="true">▼</span>
                            </Button>
                            <Popover>
                                <ListBox className="p-4 w-64 max-h-full bg-gray-50 rounded dark:bg-gray-800">
                                    {props.crewTrainingConfigData?.trainers.map(
                                        (trainer: any, index: number) => (
                                            <ListBoxItem key={trainer.id}>
                                                {trainer.name}
                                            </ListBoxItem>
                                        ),
                                    )}
                                </ListBox>
                            </Popover>
                        </PopUpSelect>
                    </div>
                </div>
            </div>
            <div
                className={`grid grid-cols-1 my-3  md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white ${props.locked ? 'pointer-events-none' : ''}`}>
                <label className="hidden md:block">Nature of Training</label>
                <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center">
                        <PopUpSelect
                            aria-label="Select Location"
                            onSelectionChange={handleSelectedNatureTraining}>
                            <Button
                                className={
                                    'w-64 peer flex justify-between rounded-md border border-gray-200 p-2 text-sm outline-2 placeholder:text-gray-500'
                                }>
                                <SelectValue />
                                <span aria-hidden="true">▼</span>
                            </Button>
                            <Popover>
                                <ListBox className="p-4 w-64 max-h-full bg-gray-50 rounded dark:bg-gray-800">
                                    {props?.crewTrainingConfigData?.trainingTypes.map(
                                        (trainingType: any, index: number) => (
                                            <ListBoxItem key={trainingType.id}>
                                                {trainingType.type}
                                            </ListBoxItem>
                                        ),
                                    )}
                                </ListBox>
                            </Popover>
                        </PopUpSelect>
                    </div>
                </div>
            </div>
            <div
                className={`grid grid-cols-1 my-3 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white ${props.locked ? 'pointer-events-none' : ''}`}>
                <label className="hidden md:block">Training Location</label>
                <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center">
                        <PopUpSelect
                            aria-label="Select Position"
                            onSelectionChange={handleSelectedTrainingLocation}>
                            <Button
                                className={
                                    'w-64 peer flex justify-between rounded-md border border-gray-200 p-2 text-sm outline-2 placeholder:text-gray-500'
                                }>
                                <SelectValue
                                    onSelect={(e) => console.log(`### ${e}`)}
                                />
                                <span aria-hidden="true">▼</span>
                            </Button>
                            <Popover>
                                <ListBox className="p-4 w-64 max-h-full bg-gray-50 rounded dark:bg-gray-800">
                                    {getGetTrainingLocation().map(
                                        (location) => (
                                            <ListBoxItem key={location.id}>
                                                {location.location}
                                            </ListBoxItem>
                                        ),
                                    )}
                                </ListBox>
                            </Popover>
                        </PopUpSelect>
                    </div>
                </div>
            </div>
            <div
                className={`grid grid-cols-1 my-3 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white ${props.locked ? 'pointer-events-none' : ''}`}>
                <label className="hidden md:block">Training Summary</label>
                <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center">
                        <textarea
                            id={`training-summary`}
                            rows={4}
                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-white dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Training Summary ..."
                            onChange={handleTextArea}
                        />
                    </div>
                </div>
            </div>
            <hr className="my-4" />
            <Heading className="mb-4 dark:text-white">Crew Members</Heading>
            <div className="grid grid-cols-1 my-3 gap-4 md:grid-cols-2 lg:grid-cols-3 items-center dark:text-white w-full p-4 overflow-hidden bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                {memberList?.map((member: any, index: number) => (
                    <SignaturePad
                        key={member.value}
                        member={member.label}
                        memberId={member.value}
                        onSignatureChanged={(
                            e: string,
                            member: string,
                            memberId: string,
                        ) => onSignatureChanged(e, member, memberId)}
                    />
                ))}
            </div>
            <div
                className={`grid grid-cols-1 my-3 md:grid-cols-3 lg:grid-cols-4 items-center dark:text-white ${props.locked ? 'pointer-events-none' : ''}`}>
                <label className="hidden md:block">Add Member</label>
                <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center dark:text-black text-sm">
                        <Select
                            closeMenuOnSelect={false}
                            isMulti
                            options={props?.crewTrainingConfigData?.crewMembers}
                            menuPlacement="top"
                            className="w-full bg-gray-50 rounded dark:bg-gray-800"
                            defaultValue={memberList}
                            onChange={handleSelectMember}
                            classNames={{
                                control: () =>
                                    '!border-0 dark:bg-transparent !bg-transparent rounded-md',
                                multiValue: () =>
                                    'bg-green-100 inline-block rounded p-0 m-0 text-green-900 font-normal mr-2',
                                clearIndicator: () => '!p-0',
                                dropdownIndicator: () => '!p-0 !hidden',
                                indicatorsContainer: () => '!hidden',
                                indicatorSeparator: () => '!hidden',
                                menu: () => 'dark:bg-gray-800',
                                multiValueLabel: () => 'bg-green-100',
                                multiValueRemove: () => 'bg-green-100',
                                valueContainer: () => '!p-0',
                            }}
                        />
                    </div>
                </div>
            </div>
            <div
                className={`flex justify-between items-center ${props.locked ? 'pointer-events-none' : ''}`}>
                <Heading className="dark:text-white" />
                <div>
                    {/* ATM Hide this button as there is no point in adding cancel button here */}
                    {/* <Button 
            className='w-32 mr-8 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' 
            onPress={()=>console.log('')}
          >
            Cancel
          </Button> */}
                    <Button
                        className="w-32 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onPress={handleSave}>
                        Save
                    </Button>
                </div>
            </div>
        </>
    )
}

function SignaturePad({
    member,
    memberId,
    onSignatureChanged,
}: {
    member: string
    memberId: string
    onSignatureChanged: (e: string, member: string, memberId: string) => void
}) {
    const [signPad, setSignPad] = useState<SignaturePad | null>(null)

    const handleSignatureChanged = (e: any) => {
        if (signPad?.toDataURL())
            onSignatureChanged(signPad?.toDataURL(), member, memberId)
    }

    const handleClear = () => {
        if (signPad) {
            signPad.clear()
        }
    }
    return (
        <div className="flex flex-col items-left gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {member}
                    <Button className="peer flex justify-between text-sm placeholder:text-sldarkblue-950">
                        <XCircleIcon className="w-6" />
                    </Button>
                </div>
                <Button
                    onPress={handleClear}
                    className="peer flex justify-between rounded-md border border-sllightblue-200 p-2 text-sm outline-2 placeholder:text-sldarkblue-950">
                    Clear
                </Button>
            </div>
            <SignatureCanvas
                ref={(ref: any) => {
                    setSignPad(ref)
                }}
                penColor={`blue`}
                canvasProps={{
                    height: 200,
                    className: 'sigCanvas border border-sllightblue-200',
                }}
                onEnd={handleSignatureChanged}
            />
        </div>
    )
}
