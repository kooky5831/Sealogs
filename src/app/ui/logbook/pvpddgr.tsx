'use client'
import { SeaLogsButton } from '@/app/components/Components'
import { classes } from '@/app/components/GlobalClasses'
import {
    CreateDangerousGoodsRecord,
    UpdateDangerousGoodsRecord,
    UpdateTripReport_LogBookEntrySection,
    UpdateTripReport_Stop,
} from '@/app/lib/graphQL/mutation'
import { useMutation } from '@apollo/client'
import { XMarkIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import SlidingPanel from 'react-sliding-side-panel'
import Editor from '../editor'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import toast from 'react-hot-toast'
import PVPDRiskAnalysis from './forms/pvpd-risk-analysis'
import DangerousGoodsRecordModel from '@/app/offline/models/dangerousGoodsRecord'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import TripReport_StopModel from '@/app/offline/models/tripReport_Stop'

export default function PVPDDGR({
    locked,
    currentTrip,
    updateTripReport,
    tripReport,
    logBookConfig,
    selectedDGR,
    setSelectedDGR,
    members,
    displayDangerousGoods,
    displayDangerousGoodsSailing,
    setDisplayDangerousGoods,
    setDisplayDangerousGoodsSailing,
    allDangerousGoods,
    setAllDangerousGoods,
    currentEvent,
    offline = false,
}: {
    locked: boolean
    currentTrip: any
    updateTripReport?: any
    tripReport: any
    logBookConfig: any
    selectedDGR: any
    setSelectedDGR: any
    members: any
    displayDangerousGoods: any
    displayDangerousGoodsSailing: any
    setDisplayDangerousGoods: any
    setDisplayDangerousGoodsSailing: any
    allDangerousGoods: any
    setAllDangerousGoods: any
    currentEvent: any
    offline?: boolean
}) {
    const [selectedRow, setSelectedRow] = useState<any>(false)
    const [currentDangerousGoods, setCurrentDangerousGoods] = useState<any>([])
    const [openRiskAnalysis, setOpenTripStartRiskAnalysis] = useState(false)
    const [permissions, setPermissions] = useState<any>(false)
    const [editDGR, setEditDGR] = useState<any>(false)
    const dangerousGoodsRecordModel = new DangerousGoodsRecordModel()
    const tripReport_StopModel = new TripReport_StopModel()
    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('EDIT_LOGBOOKENTRY_RISK_ANALYSIS', permissions)) {
                setEditDGR(true)
            } else {
                setEditDGR(false)
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
        if (selectedDGR > 0) {
            setSelectedRow(selectedDGR)
        }
    }, [selectedDGR])

    useEffect(() => {
        if (
            currentEvent?.dangerousGoodsRecords?.nodes?.length > 0 &&
            !allDangerousGoods
        ) {
            setAllDangerousGoods(currentEvent?.dangerousGoodsRecords?.nodes)
        }
    }, [currentEvent])

    const displayField = (fieldName: string) => {
        const dailyChecks =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'EventType_LogBookComponent',
            )
        if (
            dailyChecks?.length > 0 &&
            dailyChecks[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            return true
        }
        return false
    }

    const displayReportField = (fieldName: string) => {
        const dailyChecks =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'TripReport_LogBookComponent',
            )
        if (
            dailyChecks?.length > 0 &&
            dailyChecks[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            return true
        }
        return false
    }

    const goodsTypes = [
        { label: 'Class 1 Explosives', value: '1' },
        { label: 'Class 2 Gases', value: '2' },
        { label: 'Class 2.1 - Flammable gases', value: '2.1' },
        { label: 'Class 2.2 - Non-Flammable Non-Toxic Gases', value: '2.2' },
        { label: 'Class 2.3 - Toxic Gases', value: '2.3' },
        { label: 'Class 3 Flammable Liquids', value: '3' },
        { label: 'Class 4 Flammable Solids', value: '4' },
        { label: 'Class 4.1 - Flammable Solids', value: '4.1' },
        {
            label: 'Class 4.2 - Spontaneously Combustible Substances',
            value: '4.2',
        },
        { label: 'Class 4.3 - Substances Flammable When Wet', value: '4.3' },
        {
            label: 'Class 5 Oxidizing Substances and Organic Peroxides',
            value: '5',
        },
        { label: 'Class 5.1 - Oxidising Substances', value: '5.1' },
        { label: 'Class 5.2 - Organic Peroxides', value: '5.2' },
        { label: 'Class 6 Toxic and Infectious Substances', value: '6' },
        { label: 'Class 6.1 - Toxic Substances', value: '6.1' },
        { label: 'Class 6.2 - Infectious Substances', value: '6.2' },
        { label: 'Class 7 Radioactive Substances', value: '7' },
        { label: 'Class 8 Corrosive Substances', value: '8' },
        { label: 'Class 9 Miscellaneous Hazardous Substance', value: '9' },
    ]

    const handleAddNewDangerousGoods = async () => {
        if (currentEvent.id > 0) {
            setCurrentDangerousGoods(false)
            setSelectedRow(false)
            const dgr = {
                type: currentDangerousGoods?.type,
                comment: currentDangerousGoods?.comment,
                tripReport_StopID: +currentEvent.id,
            }
            if (offline) {
                // createDangerousGoodsRecord
                const data = await dangerousGoodsRecordModel.save({
                    ...dgr,
                    id: generateUniqueId(),
                })
                if (allDangerousGoods) {
                    setAllDangerousGoods([...allDangerousGoods, data])
                } else {
                    setAllDangerousGoods([data])
                }
                setSelectedRow(false)
            } else {
                createDangerousGoodsRecord({
                    variables: {
                        input: {
                            ...dgr,
                        },
                    },
                })
            }
        } else {
            toast.error('Please save the trip before adding dangerous goods')
        }
    }

    const [createDangerousGoodsRecord] = useMutation(
        CreateDangerousGoodsRecord,
        {
            onCompleted: (response) => {
                const data = response.createDangerousGoodsRecord
                if (allDangerousGoods) {
                    setAllDangerousGoods([...allDangerousGoods, data])
                } else {
                    setAllDangerousGoods([data])
                }
                setSelectedRow(false)
            },
            onError: (error) => {
                console.error('Error creating dangerous goods record', error)
            },
        },
    )

    const [updateDangerousGoodsRecord] = useMutation(
        UpdateDangerousGoodsRecord,
        {
            onCompleted: (response) => {},
            onError: (error) => {
                console.error('Error updating dangerous goods record', error)
            },
        },
    )

    const handleSetDisplayDangerousGoodsSailing = async (value: boolean) => {
        setDisplayDangerousGoodsSailing(value)
        if (offline) {
            await tripReport_StopModel.save({
                id: +currentEvent.id,
                designatedDangerousGoodsSailing: value ? value : false,
            })
        } else {
            updateTripReport_Stop({
                variables: {
                    input: {
                        id: +currentEvent.id,
                        designatedDangerousGoodsSailing: value ? value : false,
                    },
                },
            })
        }
    }

    const [updateTripReport_Stop] = useMutation(UpdateTripReport_Stop, {
        onCompleted: (response) => {},
        onError: (error) => {
            console.error('Error updating trip report stop', error)
        },
    })

    const deleteDangerousGoods = async () => {
        if (offline) {
            await dangerousGoodsRecordModel.save({
                id: +selectedRow,
                tripReport_StopID: 0,
            })
        } else {
            updateDangerousGoodsRecord({
                variables: {
                    input: {
                        id: +selectedRow,
                        tripReport_StopID: 0,
                    },
                },
            })
        }
        setAllDangerousGoods(
            allDangerousGoods.filter((dgr: any) => dgr.id !== selectedRow),
        )
    }

    return (
        <div key={`${currentTrip.id}`}>
            {displayField('PassengerVehiclePickDrop') && (
                <>
                    <div className={`flex justify-between w-full`}>
                        <div className={`flex items-center my-4`}>
                            <label
                                className={` ${locked ? 'pointer-events-none' : ''} relative flex items-center pr-3 rounded-full cursor-pointer`}
                                htmlFor="pvpd-log-dgr"
                                data-ripple="true"
                                data-ripple-color="dark"
                                data-ripple-dark="true">
                                <input
                                    type="checkbox"
                                    id="pvpd-log-dgr"
                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-sky-400 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-sky-500 before:opacity-0 before:transition-opacity checked:border-sky-700 checked:bg-sky-700 before:bg-sky-700 hover:before:opacity-10"
                                    checked={displayDangerousGoods}
                                    onChange={(e: any) => {
                                        setDisplayDangerousGoods(
                                            e.target.checked,
                                        )
                                    }}
                                />
                                <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                <span className="ml-3 text-sm font-semibold uppercase">
                                    Dangerous goods carried
                                </span>
                                {displayDangerousGoods &&
                                    displayReportField(
                                        'DesignatedDangerousGoodsSailing',
                                    ) && (
                                        <label
                                            className={`${locked ? 'pointer-events-none' : ''} relative ml-4 flex items-center pr-3 rounded-full cursor-pointer`}
                                            htmlFor="pvpd-log-dgs"
                                            data-ripple="true"
                                            data-ripple-color="dark"
                                            data-ripple-dark="true">
                                            <input
                                                type="checkbox"
                                                id="pvpd-log-dgs"
                                                className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-sky-400 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-sky-500 before:opacity-0 before:transition-opacity checked:border-sky-700 checked:bg-sky-700 before:bg-sky-700 hover:before:opacity-10"
                                                checked={
                                                    displayDangerousGoodsSailing
                                                }
                                                onChange={(e: any) => {
                                                    handleSetDisplayDangerousGoodsSailing(
                                                        e.target.checked,
                                                    )
                                                }}
                                            />
                                            <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                            <span className="ml-3 text-sm font-semibold uppercase">
                                                This is a designated dangerous
                                                goods sailing
                                            </span>
                                        </label>
                                    )}
                            </label>
                        </div>
                        <SeaLogsButton
                            text="Dangerous goods - risk analysis"
                            color="orange"
                            type="primaryWithColor"
                            action={() => {
                                setOpenTripStartRiskAnalysis(true)
                            }}
                        />
                    </div>
                    {displayDangerousGoods && (
                        <>
                            <div className="">
                                <div className="overflow-visible bg-white dark:text-white my-4 table-auto border  border-slblue-100 border-separate md:border-collapse border-spacing-y-2 md:border-spacing-0 shadow-md rounded-lg w-full dark:border-0">
                                    {allDangerousGoods &&
                                        allDangerousGoods?.map((dgr: any) => (
                                            <div key={`${dgr.id}`}>
                                                <div
                                                    key={`${dgr.id}-header`}
                                                    className={`group border-b text-left dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-900/90`}
                                                    onClick={() => {
                                                        if (
                                                            selectedRow ===
                                                            dgr.id
                                                        ) {
                                                            setSelectedRow(
                                                                false,
                                                            )
                                                            setSelectedDGR(
                                                                false,
                                                            )
                                                        } else {
                                                            setSelectedRow(
                                                                dgr.id,
                                                            )
                                                            setSelectedDGR(
                                                                dgr.id,
                                                            )
                                                            setCurrentDangerousGoods(
                                                                dgr,
                                                            )
                                                        }
                                                        // console.log(
                                                        //     'selectedRow',
                                                        //     selectedRow,
                                                        //     selectedDGR,
                                                        //     dgr.id,
                                                        // )
                                                    }}>
                                                    <div>
                                                        <div className="p-4">
                                                            {goodsTypes &&
                                                                (goodsTypes.find(
                                                                    (option) =>
                                                                        option.value ===
                                                                        dgr?.type,
                                                                )?.label ??
                                                                    ' --- Add goods --- ')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    key={`${dgr.id}-body`}
                                                    className={`${selectedRow === dgr.id ? 'bg-slblue-100 dark:bg-sldarkblue-900' : 'hidden'} text-left`}>
                                                    <div>
                                                        <div className="p-4 rounded-lg">
                                                            <div className="my-4">
                                                                <Select
                                                                    id="dangerous-goods-type"
                                                                    options={
                                                                        goodsTypes
                                                                    }
                                                                    onChange={async (
                                                                        selectedOption: any,
                                                                    ) => {
                                                                        setCurrentDangerousGoods(
                                                                            {
                                                                                ...currentDangerousGoods,
                                                                                type: selectedOption.value,
                                                                            },
                                                                        )
                                                                        if (
                                                                            offline
                                                                        ) {
                                                                            await dangerousGoodsRecordModel.save(
                                                                                {
                                                                                    id: +dgr.id,
                                                                                    type: selectedOption.value,
                                                                                },
                                                                            )
                                                                        } else {
                                                                            updateDangerousGoodsRecord(
                                                                                {
                                                                                    variables:
                                                                                        {
                                                                                            input: {
                                                                                                id: +dgr.id,
                                                                                                type: selectedOption.value,
                                                                                            },
                                                                                        },
                                                                                },
                                                                            )
                                                                        }
                                                                        setAllDangerousGoods(
                                                                            allDangerousGoods.map(
                                                                                (
                                                                                    dgr: any,
                                                                                ) =>
                                                                                    dgr.id ===
                                                                                    selectedRow
                                                                                        ? {
                                                                                              ...dgr,
                                                                                              type: selectedOption.value,
                                                                                          }
                                                                                        : dgr,
                                                                            ),
                                                                        )
                                                                    }}
                                                                    value={goodsTypes.find(
                                                                        (
                                                                            option,
                                                                        ) =>
                                                                            option.value ===
                                                                            (currentDangerousGoods?.type
                                                                                ? currentDangerousGoods?.type
                                                                                : dgr?.type),
                                                                    )}
                                                                    menuPlacement="top"
                                                                    placeholder="Dangerous goods type"
                                                                    className="w-full bg-gray-100 rounded dark:bg-gray-800 text-sm"
                                                                    classNames={{
                                                                        control:
                                                                            () =>
                                                                                'flex py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                                                        singleValue:
                                                                            () =>
                                                                                'dark:!text-white',
                                                                        dropdownIndicator:
                                                                            () =>
                                                                                '!p-0 !hidden',
                                                                        menu: () =>
                                                                            'dark:bg-gray-800',
                                                                        indicatorSeparator:
                                                                            () =>
                                                                                '!hidden',
                                                                        multiValue:
                                                                            () =>
                                                                                '!bg-sky-100 inline-flex rounded p-1 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                                                                        clearIndicator:
                                                                            () =>
                                                                                '!py-0',
                                                                        valueContainer:
                                                                            () =>
                                                                                '!py-0',
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="my-4">
                                                                <Editor
                                                                    id={`dangerous-goods-description`}
                                                                    placeholder="Dangerous goods description"
                                                                    className={`${classes.editor} w-full`}
                                                                    content={
                                                                        currentDangerousGoods?.comment
                                                                            ? currentDangerousGoods?.comment
                                                                            : dgr?.comment
                                                                    }
                                                                    handleEditorChange={(
                                                                        content: string,
                                                                    ) => {
                                                                        setCurrentDangerousGoods(
                                                                            {
                                                                                ...currentDangerousGoods,
                                                                                comment:
                                                                                    content,
                                                                            },
                                                                        )
                                                                    }}
                                                                    handleEditorBlur={async () => {
                                                                        if (
                                                                            offline
                                                                        ) {
                                                                            await dangerousGoodsRecordModel.save(
                                                                                {
                                                                                    id: +dgr.id,
                                                                                    comment:
                                                                                        currentDangerousGoods?.comment,
                                                                                },
                                                                            )
                                                                        } else {
                                                                            updateDangerousGoodsRecord(
                                                                                {
                                                                                    variables:
                                                                                        {
                                                                                            input: {
                                                                                                id: +dgr.id,
                                                                                                comment:
                                                                                                    currentDangerousGoods?.comment,
                                                                                            },
                                                                                        },
                                                                                },
                                                                            )
                                                                        }
                                                                        setAllDangerousGoods(
                                                                            allDangerousGoods.map(
                                                                                (
                                                                                    dgr: any,
                                                                                ) =>
                                                                                    dgr.id ===
                                                                                    selectedRow
                                                                                        ? {
                                                                                              ...dgr,
                                                                                              comment:
                                                                                                  currentDangerousGoods?.comment,
                                                                                          }
                                                                                        : dgr,
                                                                            ),
                                                                        )
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <SeaLogsButton
                                                                    text="Delete"
                                                                    type="text"
                                                                    icon="trash"
                                                                    action={() => {
                                                                        deleteDangerousGoods()
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <SeaLogsButton
                                    text="Add Dangerous Goods"
                                    type="text"
                                    icon="plus"
                                    className="ml-2 mt-6"
                                    action={handleAddNewDangerousGoods}
                                />
                            </div>
                        </>
                    )}
                </>
            )}
            <SlidingPanel
                type={'right'}
                isOpen={openRiskAnalysis}
                size={60}
                key={`${currentTrip.id}`}>
                <div className="h-[calc(100vh_-_1rem)] pt-4">
                    <div className="bg-orange-100 h-full flex flex-col justify-between rounded-l-lg">
                        <div className="text-xl dark:text-white text-white items-center flex justify-between font-medium py-4 px-6 rounded-tl-lg bg-orange-400">
                            <div>
                                Risk analysis{' - '}
                                <span className="font-thin">
                                    Dangerous goods
                                </span>
                            </div>
                            <XMarkIcon
                                className="w-6 h-6"
                                onClick={() =>
                                    setOpenTripStartRiskAnalysis(false)
                                }
                            />
                        </div>
                        {!currentEvent ? (
                            <div className="p-4 flex-grow overflow-scroll">
                                <div className="text-center">
                                    Please save the trip before adding dangerous
                                    goods
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`${locked ? 'pointer-events-none' : ''} p-4 flex-grow overflow-scroll`}>
                                <PVPDRiskAnalysis
                                    offline={offline}
                                    onSidebarClose={() =>
                                        setOpenTripStartRiskAnalysis(false)
                                    }
                                    currentTrip={currentTrip}
                                    crewMembers={members}
                                    openRiskAnalysis={openRiskAnalysis}
                                    editDGR={editDGR}
                                    currentEvent={currentEvent}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </SlidingPanel>
        </div>
    )
}
