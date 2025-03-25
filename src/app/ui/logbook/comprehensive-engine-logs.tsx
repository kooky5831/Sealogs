'use client'

// import { useState } from 'react';
import { Heading } from 'react-aria-components'
import { LogBookEntrySections } from '@/app/lib/definitions'

export default function ComprehensiveEngineLogs({
    logbookSection,
}: {
    logbookSection: [LogBookEntrySections]
}) {
    const classNames = {
        input: 'bg-gray-50 w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
    }

    const totalEngineCount = logbookSection.filter(
        (logEntry) =>
            logEntry.LogBookComponentClass === 'Engine_LogBookComponent',
    ).length

    const engineFields: any = []
    {
        logbookSection
            .filter(
                (logEntry) =>
                    logEntry.LogBookComponentClass ===
                    'Engine_LogBookComponent',
            )
            .forEach((logEntry) => {
                if (
                    logEntry.LogBookComponentClass === 'Engine_LogBookComponent'
                ) {
                    engineFields.push({
                        label: logEntry.AggregateTitle,
                        id: logEntry.EngineID,
                    })
                }
            })
    }

    const fuelFields = [
        { label: 'Entered by', value: true, type: 'text' },
        { label: 'Fuel start', value: true, type: 'number' },
        { label: 'Fuel end', value: true, type: 'number' },
        { label: 'Fuel type', value: true, type: 'text' },
        { label: 'Nautical miles', value: false, type: 'number' },
    ]

    const oilFields = [
        { label: 'Gearbox oil', value: true, type: 'number' },
        { label: 'Steering fluid', value: true, type: 'number' },
        { label: 'Hydraulic fluid', value: true, type: 'number' },
        { label: 'Hynautics', value: true, type: 'number' },
        { label: 'Thrust bearing oil', value: true, type: 'number' },
        { label: 'Nozzle power steering fluid', value: true, type: 'number' },
        { label: 'Compressor oil', value: true, type: 'number' },
        { label: 'Oil - other', value: true, type: 'number' },
    ]

    const sewageFields = [
        { label: 'Discharge facility', value: true, type: 'text' },
        { label: 'Position', value: true, type: 'text' },
        { label: 'Volume', value: true, type: 'number' },
        { label: 'Sewage', value: true, type: 'text' },
        { label: 'Name', value: true, type: 'text' },
    ]

    const allFields = [
        { label: 'Total running hours', type: 'number' },
        { label: 'Nautical miles', type: 'number' },
        { label: 'Fuel added', type: 'number' },
        { label: 'Fuel temp', type: 'number' },
        { label: 'Fuel pressure', type: 'number' },
        { label: 'Fuel diff pressure', type: 'number' },
        { label: 'Fuel rate', type: 'number' },
        { label: 'Fuel day tank level', type: 'number' },
        { label: 'Header tank level', type: 'number' },
        { label: 'RPM', type: 'number' },
        { label: 'Boost', type: 'number' },
        { label: 'Manifold temp', type: 'number' },
        { label: 'Generator temp', type: 'number' },
        { label: 'Coolant temp', type: 'number' },
        { label: 'Coolant level OK', type: 'bool' },
        { label: 'Thrust bearing temp', type: 'number' },
        { label: 'Shaft bearing temp', type: 'number' },
        { label: 'Oil level OK', type: 'bool' },
        { label: 'Oil pressure', type: 'number' },
        { label: 'Lube oil OK', type: 'bool' },
        { label: 'Lube oil temp', type: 'number' },
        { label: 'Lube oil pressure', type: 'number' },
        { label: 'Volts', type: 'number' },
        { label: 'Kilo Watt load', type: 'number' },
        { label: 'Overboard pressure', type: 'number' },
        { label: 'Overboard discharge', type: 'number' },
    ]

    return (
        <>
            <div className="px-4 flex flex-col items-start dark:text-white">
                <div className="w-full p-0 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="dark:text-white p-0 my-4">
                        <Heading
                            className={`text-lg grid grid-cols-1 md:grid-cols-${engineFields.length + 1} lg:grid-cols-${engineFields.length + 1} items-center dark:text-white gap-4`}>
                            <div>Fuel Records</div>
                            {/* {logbookSection
                            .filter((logEntry) => logEntry.LogBookComponentClass === 'Engine_LogBookComponent')
                            .map((logEntry) => (
                                <div className='hidden md:block' key={`engine-${logEntry?.EngineID}`}>{logEntry.AggregateTitle}</div>
                            ))
                        } */}
                            {engineFields.map((engineField: any) => (
                                <div
                                    className="hidden md:block"
                                    key={engineField.id}>
                                    {engineField.label}
                                </div>
                            ))}
                        </Heading>
                        <div className="grid grid-cols-1 items-center dark:text-white">
                            {fuelFields.map(
                                (field) =>
                                    field.value === true && (
                                        <div
                                            key={field.label}
                                            className={`grid grid-cols-1 md:grid-cols-${engineFields.length + 1} lg:grid-cols-${engineFields.length + 1} items-center dark:text-white gap-4 my-2`}>
                                            <label className="">
                                                {field.label}
                                            </label>
                                            {engineFields.map(
                                                (engine: any, index: any) => (
                                                    <div
                                                        key={engine.id}
                                                        className={`${index > 0 ? 'hidden md:block' : ''} flex flex-col grid-cols-1`}>
                                                        <div className="flex items-center">
                                                            <input
                                                                type={
                                                                    field.type
                                                                }
                                                                id={`${field.label.replaceAll(' ', '_').toLowerCase()}-${engine.id}-input`}
                                                                aria-describedby="helper-text-explanation"
                                                                className={`${classNames.input}`}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ),
                            )}
                        </div>
                    </div>
                    <hr className="" />
                    <div className="dark:text-white my-4">
                        <Heading
                            className={`text-lg grid grid-cols-1 md:grid-cols-${engineFields.length + 1} lg:grid-cols-${engineFields.length + 1} items-center dark:text-white gap-4`}>
                            <div>Oil Records</div>
                        </Heading>
                        <div className="grid grid-cols-1 items-center dark:text-white">
                            {oilFields.map(
                                (field) =>
                                    field.value === true && (
                                        <div
                                            key={field.label}
                                            className={`grid grid-cols-1 md:grid-cols-${engineFields.length + 1} lg:grid-cols-${engineFields.length + 1} items-center dark:text-white gap-4 my-2`}>
                                            <label className="">
                                                {field.label}
                                            </label>
                                            {engineFields.map(
                                                (engine: any, index: any) => (
                                                    <div
                                                        key={engine.id}
                                                        className={`${index > 0 ? 'hidden md:block' : ''} flex flex-col grid-cols-1`}>
                                                        <div className="flex items-center">
                                                            <input
                                                                type={
                                                                    field.type
                                                                }
                                                                id={`${field.label.replaceAll(' ', '_').toLowerCase()}-${engine.id}-input`}
                                                                aria-describedby="helper-text-explanation"
                                                                className={`${classNames.input}`}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ),
                            )}
                        </div>
                    </div>
                    <hr className="" />
                    <div className="dark:text-white my-4">
                        <Heading
                            className={`text-lg grid grid-cols-1 md:grid-cols-${engineFields.length + 1} lg:grid-cols-${engineFields.length + 1} items-center dark:text-white gap-4`}>
                            <div>Sewage Records</div>
                        </Heading>
                        <div className="grid grid-cols-1 items-center dark:text-white">
                            {sewageFields.map(
                                (field) =>
                                    field.value === true && (
                                        <div
                                            key={field.label}
                                            className={`grid grid-cols-1 md:grid-cols-${engineFields.length + 1} lg:grid-cols-${engineFields.length + 1} items-center dark:text-white gap-4 my-2`}>
                                            <label className="">
                                                {field.label}
                                            </label>
                                            {engineFields.map(
                                                (engine: any, index: any) => (
                                                    <div
                                                        key={engine.id}
                                                        className={`${index > 0 ? 'hidden md:block' : ''} flex flex-col grid-cols-1`}>
                                                        <div className="flex items-center">
                                                            <input
                                                                type={
                                                                    field.type
                                                                }
                                                                id={`${field.label.replaceAll(' ', '_').toLowerCase()}-${engine.id}-input`}
                                                                aria-describedby="helper-text-explanation"
                                                                className={`${classNames.input}`}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ),
                            )}
                        </div>
                    </div>
                    <hr className="" />
                    <div className="dark:text-white mt-4">
                        <div className="grid grid-cols-1 items-center dark:text-white">
                            {allFields.map((field) => (
                                <div
                                    key={field.label}
                                    className={`grid grid-cols-1 md:grid-cols-${engineFields.length + 1} lg:grid-cols-${engineFields.length + 1} items-center dark:text-white gap-4 my-2`}>
                                    <label className="">{field.label}</label>
                                    {engineFields.map(
                                        (engine: any, index: any) => (
                                            <div
                                                key={engine.id}
                                                className={`${index > 0 ? 'hidden md:block' : ''} flex flex-col grid-cols-1`}>
                                                <div className="flex items-center">
                                                    {field.type !== 'bool' && (
                                                        <input
                                                            type={field.type}
                                                            id={`${field.label.replaceAll(' ', '_').toLowerCase()}-${engine.id}-input`}
                                                            aria-describedby="helper-text-explanation"
                                                            className={`${classNames.input}`}
                                                            required
                                                        />
                                                    )}
                                                    {field.type === 'bool' && (
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                value=""
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                                OK
                                                            </span>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between px-4">
                <button
                    type="button"
                    className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Cancel
                </button>
                <button
                    type="button"
                    className="w-48 text-sm font-semibold text-white bg-blue-600 border px-4 py-2 border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Save
                </button>
            </div>
        </>
    )
}
