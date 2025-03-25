'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button, DialogTrigger, Heading, Popover } from 'react-aria-components'
import { TrainingTypeType } from '../../../../types/training-type'
import { List } from '../skeletons'
import { TableWrapper, SeaLogsButton } from '@/app/components/Components'
import Filter from '@/app/components/Filter'
import { useLazyQuery } from '@apollo/client'
import { CREW_TRAINING_TYPES } from '@/app/lib/graphQL/query'
import { isEmpty, trim } from 'lodash'

const TrainingScheduleList = () => {
    const [trainingTypes, setTrainingTypes] = useState([] as TrainingTypeType[])
    const [filter, setFilter] = useState({} as SearchFilter)
    const [isLoading, setIsLoading] = useState(true)
    const [keywordFilter, setKeywordFilter] = useState([] as any)
    const [queryTrainingTypes, { loading: queryTrainingTypesLoading }] =
        useLazyQuery(CREW_TRAINING_TYPES, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readTrainingTypes.nodes
                if (data) {
                    setTrainingTypes(data)
                }
            },
            onError: (error: any) => {
                console.error('queryTrainingTypes error', error)
            },
        })
    useEffect(() => {
        if (isLoading) {
            loadTrainingTypes()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadTrainingTypes = async (
        searchFilter: SearchFilter = { ...filter },
        searchkeywordFilter: any = keywordFilter,
    ) => {
        if (searchkeywordFilter.length > 0) {
            const promises = searchkeywordFilter.map(
                async (keywordFilter: any) => {
                    return await queryTrainingTypes({
                        variables: {
                            filter: { ...searchFilter, ...keywordFilter },
                        },
                    })
                },
            )
            let responses = await Promise.all(promises)
            // filter out empty results
            responses = responses.filter(
                (r: any) => r.data.readTrainingTypes.nodes.length > 0,
            )
            // flatten results
            responses = responses.flatMap(
                (r: any) => r.data.readTrainingTypes.nodes,
            )
            // filter out duplicates
            responses = responses.filter(
                (value: any, index: any, self: any) =>
                    self.findIndex((v: any) => v.id === value.id) === index,
            )
            setTrainingTypes(responses)
        } else {
            await queryTrainingTypes({
                variables: {
                    filter: searchFilter,
                },
            })
        }
    }

    const handleFilterOnChange = ({ type, data }: any) => {
        const searchFilter: SearchFilter = { ...filter }
        if (type === 'vessel') {
            if (data) {
                searchFilter.vessels = { id: { contains: +data.value } }
            } else {
                delete searchFilter.vessels
            }
        }
        let keyFilter = keywordFilter
        if (type === 'keyword') {
            if (!isEmpty(trim(data.value))) {
                keyFilter = [
                    { title: { contains: data.value } },
                    { procedure: { contains: data.value } },
                ]
            } else {
                keyFilter = [];
            }
        }
        setFilter(searchFilter)
        setKeywordFilter(keyFilter)
        loadTrainingTypes(searchFilter, keyFilter)
    }
    return (
        <div className="w-full p-0 px-6">
            <div className="flex justify-between pb-4 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Training Types
                </Heading>
                <div className="flex">
                    <SeaLogsButton
                        link={`/training-type/create`}
                        text="Add A Training Type"
                        color="sky"
                        type="primary"
                        icon="check"
                    />
                </div>
            </div>
            <Filter onChange={handleFilterOnChange} />
            {queryTrainingTypesLoading ? (
                <List />
            ) : (
                <TableWrapper
                    headings={[
                        'Nature of Training:firstHead',
                        'Vessels',
                        'Occurs Every (days)',
                        'Medium Warning Within (days)',
                        'High Warning Within (days)',
                    ]}>
                    {trainingTypes.map((trainingType: any) => (
                        <tr
                            key={trainingType.id}
                            className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                            <td className="px-6 py-4">
                                <Link
                                    href={`/training-type/info?id=${trainingType.id}`}
                                    className="text-gray-800 dark:text-white group-hover:text-emerald-600">
                                    {trainingType.title}
                                </Link>
                            </td>
                            <td className="px-6 py-4">
                                {trainingType?.vessels?.nodes.map(
                                    (vessel: any, index: number) => {
                                        if (index < 2) {
                                            return (
                                                <div
                                                    key={vessel.id}
                                                    className="bg-sky-100 text-xs font-semibold inline-block rounded px-3 py-1 text-sky-700 mr-2">
                                                    {vessel.title}
                                                </div>
                                            )
                                        }
                                        if (index === 2) {
                                            return (
                                                <DialogTrigger key={vessel.id}>
                                                    <Button className="inline-block bg-sky-100  text-sky-700 font-semibold rounded text-sm mr-1 p-1 px-3 outline-none">
                                                        +{' '}
                                                        {trainingType.vessels
                                                            .nodes.length -
                                                            2}{' '}
                                                        more
                                                    </Button>
                                                    <Popover>
                                                        <div className="p-0 w-64 max-h-full bg-sky-100 rounded text-sky-700">
                                                            {trainingType.vessels.nodes.map(
                                                                (
                                                                    vessel: any,
                                                                    index: number,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }>
                                                                        {index >
                                                                            1 && (
                                                                            <div className="flex cursor-pointer hover:bg-sky-200 items-center overflow-auto">
                                                                                <div className="ps-3 py-2">
                                                                                    <div className="text-sm">
                                                                                        {
                                                                                            vessel.title
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </Popover>
                                                </DialogTrigger>
                                            )
                                        }
                                    },
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {trainingType.occursEvery}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {trainingType.mediumWarnWithin}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {trainingType.highWarnWithin}
                            </td>
                        </tr>
                    ))}
                </TableWrapper>
            )}
        </div>
    )
}

export default TrainingScheduleList
