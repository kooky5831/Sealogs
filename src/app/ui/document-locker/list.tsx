'use client'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-aria-components'
import { List } from '@/app/ui/skeletons'
import { TableWrapper } from '@/app/components/Components'
import Filter from '@/app/components/Filter'
import { useLazyQuery } from '@apollo/client'
import { classes } from '@/app/components/GlobalClasses'
import {
    VESSEL_LIST_WITH_DOCUMENTS,
    GET_INVENTORIES_WITH_DOCUMENTS,
    MAINTENANCE_LIST_WITH_DOCUMENT,
    READ_ONE_CLIENT,
} from '@/app/lib/graphQL/query'
import { isEmpty, trim } from 'lodash'
import dayjs from 'dayjs'
import { formatDate } from '@/app/helpers/dateHelper'

export default function DocumentList() {
    const [vesselListWithDocuments, setVesselListWithDocuments] = useState(
        [] as any,
    )
    const [vesselListWithDocumentsCopy, setVesselListWithDocumentsCopy] =
        useState([] as any)

    const [filter, setFilter] = useState({} as SearchFilter)
    const [isLoading, setIsLoading] = useState(true)

    const [queryVesselListDocument] = useLazyQuery(VESSEL_LIST_WITH_DOCUMENTS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: async (response: any) => {
            let filterData = []
            const data = response.readVessels.nodes
            if (data && data.length) {
                for (const element of data) {
                    const documents = element.documents.nodes
                    for (const doc of documents) {
                        const modifiedDoc = {
                            ...doc,
                            type: element.__typename,
                            type_title: element.title,
                            type_id: element.id, // Assuming `id` is the unique identifier for the vessel
                        }
                        filterData.push(modifiedDoc)
                    }
                }
                setVesselListWithDocuments([
                    ...vesselListWithDocuments,
                    ...filterData,
                ])
                setVesselListWithDocumentsCopy([
                    ...vesselListWithDocuments,
                    ...filterData,
                ])
            }
        },
        onError: (error: any) => {
            console.error('queryInventoriesEntry error', error)
        },
    })

    const [queryInventoriesListDocument] = useLazyQuery(
        GET_INVENTORIES_WITH_DOCUMENTS,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: async (response: any) => {
                let filterData = []
                const data = response.readInventories.nodes
                if (data && data.length) {
                    for (const element of data) {
                        const documents = element.documents.nodes
                        for (const doc of documents) {
                            const modifiedDoc = {
                                ...doc,
                                type: element.__typename,
                                type_title: element.title,
                                type_id: element.id, // Assuming `id` is the unique identifier for the vessel
                            }
                            filterData.push(modifiedDoc)
                        }
                    }
                    setVesselListWithDocuments([
                        ...vesselListWithDocuments,
                        ...filterData,
                    ])
                    setVesselListWithDocumentsCopy([
                        ...vesselListWithDocuments,
                        ...filterData,
                    ])
                }
            },
            onError: (error: any) => {
                console.error('queryInventoriesEntry error', error)
            },
        },
    )

    const [queryMaintenanceListDocument] = useLazyQuery(
        MAINTENANCE_LIST_WITH_DOCUMENT,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: async (response: any) => {
                let filterData = []
                const data = response.readComponentMaintenanceChecks.nodes
                if (data && data.length) {
                    for (const element of data) {
                        const documents = element.documents.nodes
                        for (const doc of documents) {
                            const modifiedDoc = {
                                ...doc,
                                type: 'Maintenance',
                                type_title: element.name,
                                type_id: element.id, // Assuming `id` is the unique identifier for the vessel
                            }
                            filterData.push(modifiedDoc)
                        }
                    }
                    setVesselListWithDocuments([
                        ...vesselListWithDocuments,
                        ...filterData,
                    ])
                    setVesselListWithDocumentsCopy([
                        ...vesselListWithDocuments,
                        ...filterData,
                    ])
                }
            },
            onError: (error: any) => {
                console.error('queryInventoriesEntry error', error)
            },
        },
    )

    const handleFilterOnChange = ({ type, data }: any) => {
        let searchFilter = { ...filter }

        if (type === 'Module') {
            if (data && data !== null && !isEmpty(data?.value)) {
                searchFilter.moduleName = data?.value
            } else {
                delete searchFilter.item
                searchFilter = {}
                setVesselListWithDocuments(vesselListWithDocumentsCopy)
            }
        }

        if (type === 'vessel') {
            if (data) {
                searchFilter.vesselID = { eq: +data?.value }
            } else {
                delete searchFilter.vesselID
                setVesselListWithDocuments(vesselListWithDocumentsCopy)
            }
        }

        if (type === 'keyword') {
            if (!isEmpty(trim(data?.value))) {
                searchFilter.item = {
                    contains: trim(data.value),
                }
            } else {
                delete searchFilter.item
                setVesselListWithDocuments(vesselListWithDocumentsCopy)
            }
        }

        setFilter(searchFilter)
        applyFilterOptions(type, searchFilter)
    }

    const applyFilterOptions = (type: any, data: any) => {
        if (type === 'vessel' && data && data.vesselID && data.vesselID.eq) {
            const filteredData = vesselListWithDocuments.filter(
                (item: any) => item.type_id === data.vesselID.eq.toString(),
            )
            setVesselListWithDocuments(filteredData)
        }
        if (type === 'Module' && data !== null && data && data.moduleName) {
            const filteredData = vesselListWithDocuments.filter(
                (item: any) => item.type === data.moduleName,
            )

            setVesselListWithDocuments(filteredData)
        }
        if (type === 'keyword' && data && data.item && data.item.contains) {
            const filteredData = vesselListWithDocuments.filter((item: any) => {
                const lowerCaseTitle = item.title.toLowerCase()
                const lowerCaseName = item.name.toLowerCase()
                const lowerCaseContains = data.item.contains.toLowerCase()

                return (
                    lowerCaseTitle.includes(lowerCaseContains) ||
                    lowerCaseName.includes(lowerCaseContains)
                )
            })
            setVesselListWithDocuments(filteredData)
        }
    }

    const [readOneClient] = useLazyQuery(READ_ONE_CLIENT, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneClient
            if (data) {
                const docs = data.documents.nodes.map((doc: any) => {
                    return {
                        ...doc,
                        type: 'Company',
                        type_title: '',
                        type_id: 0,
                    }
                })
                if (docs.length > 0) {
                    setVesselListWithDocuments([
                        ...vesselListWithDocuments,
                        ...docs,
                    ])
                    setVesselListWithDocumentsCopy([
                        ...vesselListWithDocuments,
                        ...docs,
                    ])
                }
            }
        },
        onError: (error: any) => {
            console.error('readOneClient error', error)
        },
    })
    const loadClientDocuments = async () => {
        await readOneClient({
            variables: {
                filter: {
                    id: { eq: +(localStorage.getItem('clientId') ?? 0) },
                },
            },
        })
    }

    const loadVesselDocuments = async () => {
        await queryVesselListDocument()
    }
    const loadInventoryDocuments = async () => {
        await queryInventoriesListDocument()
    }
    const loadMaintenanceDocuments = async () => {
        await queryMaintenanceListDocument()
    }
    useEffect(() => {
        if (isLoading) {
            loadVesselDocuments()
            loadInventoryDocuments()
            loadMaintenanceDocuments()
            loadClientDocuments()
            setIsLoading(false)
        }
    }, [isLoading])

    return (
        <div className="w-full">
            <Filter onChange={handleFilterOnChange} />
            <div className="flex w-full justify-start flex-col md:flex-row items-start">
                <div className="relative w-full my-6">
                    <div className="overflow-auto h-[calc(100svh-12rem)]">
                        {vesselListWithDocuments ? (
                            <DocumentsList
                                vesselListWithDocuments={
                                    vesselListWithDocuments
                                }
                            />
                        ) : (
                            <List />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const DocumentsList = ({ vesselListWithDocuments }: any) => {
    return (
        <TableWrapper headings={[]}>
            <tr>
                <td></td>
                <td className="hidden md:table-cell text-left p-3 border-b border-slblue-200 w-auto">
                    <label className={`${classes.label} !w-full`}>Module</label>
                </td>
                <td className="hidden md:table-cell text-left p-3 border-b border-slblue-200 w-auto">
                    <label className={`${classes.label} !w-full`}>Item</label>
                </td>
                <td className="hidden md:table-cell text-left p-3 border-b border-slblue-200 w-auto">
                    <label className={`${classes.label} !w-full`}>
                        Upload date
                    </label>
                </td>
            </tr>
            {vesselListWithDocuments?.map((document: any) => (
                <tr
                    key={document.id}
                    className={`border-b border-sldarkblue-50 even:bg-sllightblue-50/50 dark:border-slblue-50 hover:bg-sllightblue-50 dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                    <td className="p-2 min-w-1/2 items-center">
                        <Link
                            target="_blank"
                            href={
                                process.env.FILE_BASE_URL +
                                document.fileFilename
                            }>
                            {document.name}
                        </Link>
                        <div className="flex flex-row md:hidden text-sm">
                            {document.type}: {document.type_title}
                        </div>
                        <div className="block md:hidden text-sm">
                            <label className={`${classes.label}`}>
                                Created:&nbsp;
                            </label>
                            {document?.created
                                ? formatDate(document.created)
                                : 'No Date'}
                        </div>
                    </td>
                    <td className="p-2 hidden md:table-cell ">
                        <div className="inline-block bg-slblue-50 border border-slblue-200 font-light rounded-lg text-sm m-1 p-2 outline-none dark:text-sldarkblue-800">
                            {document.type}
                        </div>
                    </td>
                    <td className="p-2 hidden md:table-cell ">
                        {!isEmpty(document.type_title) && (
                            <>{document.type_title}</>
                        )}
                    </td>
                    <td className="p-2 hidden md:table-cell ">
                        {document?.created
                            ? formatDate(document.created)
                            : 'No Date'}
                    </td>
                </tr>
            ))}
        </TableWrapper>
    )
}
