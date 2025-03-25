'use client'

import React from 'react'
import { Heading } from 'react-aria-components'
import Select from 'react-select'

export default function EngineConfiguration() {
    const engines = [
        { label: 'Main Engine', value: '1' },
        { label: 'Auxiliary Engine', value: '2' },
        { label: 'Generator', value: '3' },
    ]

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
        {
            label: 'Fuel records',
            type: 'fields',
            fields: fuelFields,
            value: true,
        },
        {
            label: 'Engine fluid records',
            type: 'fields',
            fields: oilFields,
            value: true,
        },
        {
            label: 'Sewage disposal records',
            type: 'fields',
            fields: sewageFields,
            value: true,
        },
        { label: 'Total running hours', type: 'number', value: true },
        { label: 'Nautical miles', type: 'number', value: false },
        { label: 'Fuel added', type: 'number', value: true },
        { label: 'Fuel temp', type: 'number', value: true },
        { label: 'Fuel pressure', type: 'number', value: true },
        { label: 'Fuel diff pressure', type: 'number', value: true },
        { label: 'Fuel rate', type: 'number', value: true },
        { label: 'Fuel day tank level', type: 'number', value: true },
        { label: 'Header tank level', type: 'number', value: true },
        { label: 'RPM', type: 'number', value: true },
        { label: 'Boost', type: 'number', value: true },
        { label: 'Manifold temp', type: 'number', value: true },
        { label: 'Generator temp', type: 'number', value: true },
        { label: 'Coolant temp', type: 'number', value: true },
        { label: 'Coolant level OK', type: 'bool', value: true },
        { label: 'Thrust bearing temp', type: 'number', value: true },
        { label: 'Shaft bearing temp', type: 'number', value: true },
        { label: 'Oil level OK', type: 'bool', value: true },
        { label: 'Oil pressure', type: 'number', value: true },
        { label: 'Lube oil OK', type: 'bool', value: true },
        { label: 'Lube oil temp', type: 'number', value: true },
        { label: 'Lube oil pressure', type: 'number', value: true },
        { label: 'Volts', type: 'number', value: true },
        { label: 'Kilo Watt load', type: 'number', value: true },
        { label: 'Overboard pressure', type: 'number', value: true },
        { label: 'Overboard discharge', type: 'number', value: true },
    ]

    return (
        <div className="w-full">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="grid grid-cols-1 px-4 pb-4 items-center dark:text-white">
                    {allFields.map((field) => (
                        <div
                            key={field.label}
                            className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 border-b py-2">
                            <div className="flex flex-col gap-3 flex-wrap pt-2">
                                <Heading className="">{field.label}</Heading>
                            </div>
                            <div className="col-span-1 md:col-span-3 lg:col-span-3">
                                <div className="flex">
                                    <Select
                                        className="w-full"
                                        isMulti
                                        name="colors"
                                        defaultValue={engines}
                                        options={engines}
                                        classNamePrefix="select"
                                        placeholder="Select Engines"
                                        classNames={{
                                            control: () =>
                                                '!border-0 dark:bg-transparent !bg-transparent rounded-md',
                                            multiValue: () =>
                                                'bg-green-100 inline-block rounded p-0 m-0 text-green-900 font-normal mr-2',
                                            clearIndicator: () => '!p-0',
                                            dropdownIndicator: () =>
                                                '!p-0 !hidden',
                                            indicatorsContainer: () =>
                                                '!hidden',
                                            indicatorSeparator: () => '!hidden',
                                            menu: () => 'dark:bg-gray-800',
                                            multiValueLabel: () =>
                                                'bg-green-100',
                                            multiValueRemove: () =>
                                                'bg-green-100',
                                            valueContainer: () => '!p-0',
                                        }}
                                    />
                                </div>
                                {field.type === 'fields' && (
                                    <div className="flex flex-col gap-1 py-1 dark:text-white">
                                        {field.type === 'fields' && (
                                            <>
                                                {field.fields?.map(
                                                    (subField) => (
                                                        <div
                                                            key={subField.label}
                                                            className="flex items-center  dark:text-white p-1">
                                                            <Heading className="w-64">
                                                                {subField.label}
                                                            </Heading>
                                                            <div className="flex flex-col w-full grid-cols-1 md:col-span-2 lg:col-span-3">
                                                                <Select
                                                                    className="w-full"
                                                                    isMulti
                                                                    name="colors"
                                                                    defaultValue={
                                                                        engines
                                                                    }
                                                                    options={
                                                                        engines
                                                                    }
                                                                    classNamePrefix="select"
                                                                    placeholder="Select Engines"
                                                                    classNames={{
                                                                        control:
                                                                            () =>
                                                                                '!border-0 dark:bg-transparent !bg-transparent rounded-md',
                                                                        multiValue:
                                                                            () =>
                                                                                'bg-green-100 inline-block rounded p-0 m-0 text-green-900 font-normal mr-2',
                                                                        clearIndicator:
                                                                            () =>
                                                                                '!p-0',
                                                                        dropdownIndicator:
                                                                            () =>
                                                                                '!p-0 !hidden',
                                                                        indicatorsContainer:
                                                                            () =>
                                                                                '!hidden',
                                                                        indicatorSeparator:
                                                                            () =>
                                                                                '!hidden',
                                                                        menu: () =>
                                                                            'dark:bg-gray-800',
                                                                        multiValueLabel:
                                                                            () =>
                                                                                'bg-green-100',
                                                                        multiValueRemove:
                                                                            () =>
                                                                                'bg-green-100',
                                                                        valueContainer:
                                                                            () =>
                                                                                '!p-0',
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
