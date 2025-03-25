'use client'
import {
    VESSEL_INFO,
    VESSEL_LIST,
    GET_INVENTORIES,
    GET_MAINTENANCE_CHECK_BY_VESSEL_ID,
    TRAINING_SESSION_BY_VESSEL,
    GET_INVENTORY_BY_VESSEL_ID,
    CREW_DUTY,
    GET_SUPPLIER,
    GET_LOGBOOKENTRY,
    GET_SEALOGS_MEMBER_COMMENTS,
    GET_CREW_BY_IDS,
    TRAINING_SESSIONS,
    SEALOGS_GROUP,
    TRAINING_SESSION_BY_ID,
    TRAINING_TYPE_BY_ID,
    CREW_TRAINING_TYPES,
    CREW_LIST,
    TRAINING_LOCATIONS,
    GET_MAINTENANCE_CHECK,
    GET_INVENTORY_CATEGORY,
    GET_INVENTORY_BY_ID,
    GET_SUPPLIER_BY_ID,
    GET_MAINTENANCE_CHECK_BY_ID,
    GET_CREW_DUTY_BY_ID,
    GET_INVENTORY_CATEGORY_BY_ID,
    GET_MAINTENANCE_CHECK_BY_MEMBER_ID,
    GET_CLIENT_BY_ID,
    GET_MAINTENANCE_CHECK_SUBTASK,
    TRAINING_TYPES,
    READ_TRAINING_SESSION_DUES,
    GET_LOGBOOK,
    GET_LOGBOOK_ENTRY_BY_ID,
    READ_ONE_CLIENT,
    CrewMembers_LogBookEntrySection,
    GET_SECTION_MEMBER_COMMENTS,
    ReadDepartments,
    GET_SEA_TIME_REPORT,
    GET_MAINTENANCE_CATEGORY_BY_ID,
    GET_MAINTENANCE_CATEGORY,
    GetLogBookEntriesMemberIds,
    DASHBOARD_VESSEL_LIST,
} from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash'
import { SLALL_LogBookFields } from './vesselDefaultConfig'
import { useOnline } from '@reactuses/core'
import VesselModel from '../offline/models/vessel'
import SectionMemberCommentModel from '../offline/models/sectionMemberComment'
import LogBookEntryModel from '../offline/models/logBookEntry'

export async function getVesselByID(vesselId: number, setVessel: any) {
    const online = false // To be replaced with useOnline()
    const vesselModel = new VesselModel()
    const [isLoading, setIsLoading] = useState(true)
    const [queryVesselInfo] = useLazyQuery(VESSEL_INFO, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneVessel
            if (data) {
                setVessel(data)
            }
        },
        onError: (error: any) => {
            console.error('queryVesselInfo error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadVesselInfo()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadVesselInfo = async () => {
        if (online) {
            await queryVesselInfo({
                variables: {
                    id: +vesselId,
                },
            })
        } else {
            const data = await vesselModel.getById(vesselId)
            setVessel(data)
        }
    }
}

export async function getVesselList(handleSetVessels: any) {
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        if (isLoading) {
            loadVessels()
            setIsLoading(false)
        }
    }, [isLoading])

    const [queryVessels] = useLazyQuery(VESSEL_LIST, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (queryVesselResponse: any) => {
            if (queryVesselResponse.readVessels.nodes) {
                handleSetVessels(queryVesselResponse.readVessels.nodes)
            }
        },
        onError: (error: any) => {
            console.error('queryVessels error', error)
        },
    })
    const loadVessels = async () => {
        await queryVessels({
            variables: {
                limit: 200,
                offset: 0,
            },
        })
    }
}

export async function getDashboardVesselList(handleSetVessels: any) {
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        if (isLoading) {
            loadVessels()
            setIsLoading(false)
        }
    }, [isLoading])

    const [queryVessels] = useLazyQuery(DASHBOARD_VESSEL_LIST, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (queryVesselResponse: any) => {
            if (queryVesselResponse.readDashboardData) {
                handleSetVessels(queryVesselResponse.readDashboardData[0].vessels)
            }
        },
        onError: (error: any) => {
            console.error('queryVessels error', error)
        },
    })
    const loadVessels = async () => {
        await queryVessels({
            variables: {
                limit: 200,
                offset: 0,
            },
        })
    }
}

export async function getInventoryList(setInventories: any) {
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        if (isLoading) {
            loadInventories()
            setIsLoading(false)
        }
    }, [isLoading])
    const [queryInventories] = useLazyQuery(GET_INVENTORIES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readInventories.nodes
            if (data) {
                setInventories(data)
            }
        },
        onError: (error: any) => {
            console.error('queryInventoriesEntry error', error)
        },
    })
    const loadInventories = async () => {
        await queryInventories()
    }
}

export async function getComponentMaintenanceCheckByVesselId(
    vesselId: number,
    handleSetMaintenanceTasks: (data: any) => void,
) {
    const [querysetMaintenanceCheckInfo] = useLazyQuery(
        GET_MAINTENANCE_CHECK_BY_VESSEL_ID,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readComponentMaintenanceChecks.nodes
                if (data) {
                    handleSetMaintenanceTasks(data)
                }
            },
            onError: (error: any) => {
                console.error('querysetMaintenanceCheckInfo error', error)
            },
        },
    )

    useEffect(() => {
        loadMaintenanceCheckInfo()
    }, [])

    const loadMaintenanceCheckInfo = async () => {
        await querysetMaintenanceCheckInfo({
            variables: {
                vesselId: +vesselId,
            },
        })
    }
}

export async function getTrainingSessionsByVesselId(
    vesselId: number,
    setTrainingSessions: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryTrainingSessions] = useLazyQuery(TRAINING_SESSION_BY_VESSEL, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readTrainingSessions.nodes
            if (data) {
                setTrainingSessions(data)
            }
        },
        onError: (error: any) => {
            console.error('queryTrainingSessions error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadTrainingSessions()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadTrainingSessions = async () => {
        await queryTrainingSessions({
            variables: {
                vesselID: +vesselId,
                limit: 10,
            },
        })
    }
}

export async function getTrainingSessionDuesByVesselId(
    vesselId: number,
    setTrainingSessionDues: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [
        readTrainingSessionDues,
        { loading: readTrainingSessionDuesLoading },
    ] = useLazyQuery(READ_TRAINING_SESSION_DUES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readTrainingSessionDues.nodes
            if (data) {
                // Filter out crew members who are no longer assigned to the vessel.
                const filteredData = data.filter((item: any) =>
                    item.vessel.seaLogsMembers.nodes.some((m: any) => {
                        return m.id === item.memberID
                    }),
                )
                const dueWithStatus = filteredData.map((due: any) => {
                    return { ...due, status: GetTrainingSessionStatus(due) }
                })
                // Return only due within 7 days and overdue
                const filteredDueWithStatus = dueWithStatus.filter(
                    (item: any) => {
                        return (
                            item.status.isOverdue ||
                            (item.status.isOverdue === false &&
                                item.status.dueWithinSevenDays === true)
                        )
                    },
                )
                const groupedDues = filteredDueWithStatus.reduce(
                    (acc: any, due: any) => {
                        const key = `${due.vesselID}-${due.trainingTypeID}-${due.dueDate}`
                        if (!acc[key]) {
                            acc[key] = {
                                id: due.id,
                                vesselID: due.vesselID,
                                vessel: due.vessel,
                                trainingTypeID: due.trainingTypeID,
                                trainingType: due.trainingType,
                                dueDate: due.dueDate,
                                status: due.status,
                                members: [],
                            }
                        }
                        acc[key].members.push(due.member)
                        return acc
                    },
                    {},
                )

                const mergedDues = Object.values(groupedDues).map(
                    (group: any) => {
                        const mergedMembers = group.members.reduce(
                            (acc: any, member: any) => {
                                const existingMember = acc.find(
                                    (m: any) => m.id === member.id,
                                )
                                if (existingMember) {
                                    existingMember.firstName = member.firstName
                                    existingMember.surname = member.surname
                                } else {
                                    acc.push(member)
                                }
                                return acc
                            },
                            [],
                        )
                        return {
                            id: group.id,
                            vesselID: group.vesselID,
                            vessel: group.vessel,
                            trainingTypeID: group.trainingTypeID,
                            trainingType: group.trainingType,
                            status: group.status,
                            dueDate: group.dueDate,
                            members: mergedMembers,
                        }
                    },
                )
                setTrainingSessionDues(mergedDues)
            }
        },
        onError: (error: any) => {
            console.error('readTrainingSessionDues error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadTrainingSessionDues()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadTrainingSessionDues = async () => {
        const dueFilter: any = {}
        if (vesselId > 0) {
            dueFilter.vesselID = { eq: +vesselId }
        }
        dueFilter.dueDate = { ne: null }
        await readTrainingSessionDues({
            variables: {
                filter: dueFilter,
            },
        })
    }
}

export async function getTrainingSessionDuesByMemberId(
    memberId: number,
    setTrainingSessionDues: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [
        readTrainingSessionDues,
        { loading: readTrainingSessionDuesLoading },
    ] = useLazyQuery(READ_TRAINING_SESSION_DUES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readTrainingSessionDues.nodes
            if (data) {
                const filteredData = data.filter(
                    (item: any) => item.memberID === memberId,
                )
                const dueWithStatus = filteredData.map((due: any) => {
                    return { ...due, status: GetTrainingSessionStatus(due) }
                })
                const filteredDueWithStatus = dueWithStatus.filter(
                    (item: any) => {
                        return (
                            item.status.isOverdue ||
                            (item.status.isOverdue === false &&
                                item.status.dueWithinSevenDays === true)
                        )
                    },
                )
                const groupedDues = filteredDueWithStatus.reduce(
                    (acc: any, due: any) => {
                        const key = `${due.memberID}-${due.trainingTypeID}-${due.dueDate}`
                        if (!acc[key]) {
                            acc[key] = {
                                id: due.id,
                                memberID: due.memberID,
                                member: due.member,
                                trainingTypeID: due.trainingTypeID,
                                trainingType: due.trainingType,
                                dueDate: due.dueDate,
                                status: due.status,
                            }
                        }
                        return acc
                    },
                    {},
                )

                const mergedDues = Object.values(groupedDues).map(
                    (group: any) => ({
                        id: group.id,
                        memberID: group.memberID,
                        member: group.member,
                        trainingTypeID: group.trainingTypeID,
                        trainingType: group.trainingType,
                        status: group.status,
                        dueDate: group.dueDate,
                    }),
                )
                setTrainingSessionDues(mergedDues)
            }
        },
        onError: (error: any) => {
            console.error('readTrainingSessionDues error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadTrainingSessionDues()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadTrainingSessionDues = async () => {
        const dueFilter: any = {}
        if (memberId > 0) {
            dueFilter.memberID = { eq: +memberId }
        }
        dueFilter.dueDate = { ne: null }
        await readTrainingSessionDues({
            variables: {
                filter: dueFilter,
            },
        })
    }
}

export async function getInventoryByVesselId(
    vesselId: number,
    setInventories: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryInventoriesByVessel] = useLazyQuery(
        GET_INVENTORY_BY_VESSEL_ID,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readInventories.nodes
                if (data) {
                    setInventories(data)
                }
            },
            onError: (error: any) => {
                console.error('queryInventories error', error)
            },
        },
    )
    useEffect(() => {
        if (isLoading) {
            loadInventories()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadInventories = async () => {
        await queryInventoriesByVessel({
            variables: {
                vesselId: +vesselId,
            },
        })
    }
}

export async function getCrewDuties(setCrewDuty: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryCrewDuty] = useLazyQuery(CREW_DUTY, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readCrewDuties.nodes
            if (data) {
                setCrewDuty(data)
            }
        },
        onError: (error: any) => {
            console.error('queryCrewDuty error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadCrewDuty()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadCrewDuty = async () => {
        await queryCrewDuty()
    }
}

export async function getSupplier(setSupplier: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [querySupplier] = useLazyQuery(GET_SUPPLIER, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readSuppliers.nodes
            if (data) {
                setSupplier(data)
            }
        },
        onError: (error: any) => {
            console.error('querySupplier error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadSupplier()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadSupplier = async () => {
        await querySupplier()
    }
}

export async function getLogBookEntries(
    vesselId: number,
    setLogBookEntries: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryLogBookEntries] = useLazyQuery(GET_LOGBOOKENTRY, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const crew = response.readCrewMembers_LogBookEntrySections.nodes
            const entries = response.GetLogBookEntries.nodes
            const data = entries.map((entry: any) => {
                const crewData = crew.filter(
                    (crewMember: any) => crewMember.logBookEntryID === entry.id,
                )
                return {
                    ...entry,
                    crew: crewData,
                }
            })
            if (data) {
                setLogBookEntries(data)
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookEntries error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadLogBookEntries()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadLogBookEntries = async () => {
        await queryLogBookEntries({
            variables: {
                vesselId: +vesselId,
            },
        })
    }
}

export async function getSeaLogsMemberComments(setSeaLogsMemberComments: any) {
    const online = false // To be replaced with useOnline()
    const sectionMemberCommentsModel = new SectionMemberCommentModel()
    const [isLoading, setIsLoading] = useState(true)

    const [querySeaLogsMemberComments] = useLazyQuery(
        GET_SEALOGS_MEMBER_COMMENTS,
        {
            // fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readSectionMemberComments.nodes
                if (data) {
                    setSeaLogsMemberComments(data)
                }
            },
            onError: (error: any) => {
                console.error(error)
            },
        },
    )
    useEffect(() => {
        if (isLoading) {
            loadNotification()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadNotification = async () => {
        await querySeaLogsMemberComments({
            variables: {
                start: 1,
                limit: 0,
            },
        })
    }
}

export async function getSeaLogsMembersList(setCrewMembers: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [querySeaLogsMembersList] = useLazyQuery(CREW_LIST, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readSeaLogsMembers.nodes
            if (data) {
                setCrewMembers(data)
            }
        },
        onError: (error: any) => {
            console.error('querySeaLogsMembersList error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadCrewMembers()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadCrewMembers = async () => {
        await querySeaLogsMembersList({
            variables: {
                filter: { archived: { eq: false } },
            },
        })
    }
}

export async function getSeaLogsMembers(
    crewMemberIDs: number[],
    setCrewMembers: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [querySeaLogsMembers] = useLazyQuery(GET_CREW_BY_IDS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readSeaLogsMembers.nodes
            if (data) {
                setCrewMembers(data)
            }
        },
        onError: (error: any) => {
            console.error('querySeaLogsMembers error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadCrewMembers()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadCrewMembers = async () => {
        await querySeaLogsMembers({
            variables: {
                crewMemberIDs: crewMemberIDs,
            },
        })
    }
}

// Note from Esthon: I commented this out because this function would be too complicated to use with paginations,
// among other issues particularty in the CrewTrainingList component
/* export async function getTrainingSessions(setTrainingSessions: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryTrainingSessions] = useLazyQuery(TRAINING_SESSIONS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readTrainingSessions.nodes
            if (data) {
                setTrainingSessions(data)
            }
        },
        onError: (error: any) => {
            console.error('queryTrainingSessions error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadTrainingSessions()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadTrainingSessions = async () => {
        await queryTrainingSessions()
    }
} */

export async function getSeaLogsGroups(setSeaLogsGroups: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [querySeaLogsGroups] = useLazyQuery(SEALOGS_GROUP, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readSeaLogsGroups.nodes
            if (data) {
                setSeaLogsGroups(data)
            }
        },
        onError: (error: any) => {
            console.error('querySeaLogsGroups error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadSeaLogsGroups()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadSeaLogsGroups = async () => {
        await querySeaLogsGroups()
    }
}

export async function getTrainingSessionByID(
    id: number,
    setTrainingSession: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryTrainingSessionByID] = useLazyQuery(TRAINING_SESSION_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneTrainingSession
            if (data) {
                setTrainingSession(data)
            }
        },
        onError: (error: any) => {
            console.error('queryTrainingSession error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadTrainingSessionByID()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadTrainingSessionByID = async () => {
        await queryTrainingSessionByID({
            variables: {
                id: +id,
            },
        })
    }
}

export async function getTrainingTypeByID(id: number, setTrainingType: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryTrainingTypeByID] = useLazyQuery(TRAINING_TYPE_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneTrainingType
            if (data) {
                setTrainingType(data)
            }
        },
        onError: (error: any) => {
            console.error('queryTrainingType error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadTrainingTypeByID()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadTrainingTypeByID = async () => {
        await queryTrainingTypeByID({
            variables: {
                id: +id,
            },
        })
    }
}

export async function getTrainingTypes(setTrainingTypes: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryTrainingTypes] = useLazyQuery(CREW_TRAINING_TYPES, {
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
    const loadTrainingTypes = async () => {
        await queryTrainingTypes()
    }
}

export async function getTrainingLocations(setTrainingLocations: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryTrainingLocations] = useLazyQuery(TRAINING_LOCATIONS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readTrainingLocations.nodes
            if (data) {
                setTrainingLocations(data)
            }
        },
        onError: (error: any) => {
            console.error('queryTrainingLocations error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadTrainingLocations()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadTrainingLocations = async () => {
        await queryTrainingLocations()
    }
}

export async function getMaintenanceChecks(setMaintenanceChecks: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryMaintenanceChecks] = useLazyQuery(GET_MAINTENANCE_CHECK, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readComponentMaintenanceChecks.nodes
            if (data) {
                setMaintenanceChecks(data)
            }
        },
        onError: (error: any) => {
            console.error('queryMaintenanceChecks error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadMaintenanceChecks()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadMaintenanceChecks = async () => {
        await queryMaintenanceChecks({
            variables: {
                limit: 10,
                start: 0,
            },
        })
    }
}

export async function getInventoryCategory(setInventoryCategory: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryInventoryCategory] = useLazyQuery(GET_INVENTORY_CATEGORY, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readInventoryCategories.nodes
            if (data) {
                setInventoryCategory(data)
            }
        },
        onError: (error: any) => {
            console.error('queryInventoryCategory error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadInventoryCategory()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadInventoryCategory = async () => {
        await queryInventoryCategory()
    }
}

export async function getMaintenanceCategory(setMaintenanceCategory: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryMaintenanceCategory] = useLazyQuery(GET_MAINTENANCE_CATEGORY, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readMaintenanceCategories.nodes
            if (data) {
                setMaintenanceCategory(data)
            }
        },
        onError: (error: any) => {
            console.error('queryMaintenanceCategory error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadMaintenanceCategory()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadMaintenanceCategory = async () => {
        await queryMaintenanceCategory({
            variables: {
                clientID: +(localStorage.getItem('clientId') ?? 0),
            },
        })
    }
}

export async function GetLogBookEntriesMembers(setMemberIds: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryMemberIds] = useLazyQuery(GetLogBookEntriesMemberIds, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readLogBookEntries
            if (data) {
                setMemberIds(
                    data.nodes
                        .filter((entry: any) => entry.vehicle.id > 0)
                        .flatMap(
                            (entry: any) => entry.logBookEntrySections.nodes,
                        )
                        .flatMap((section: any) => +section.id),
                )
            }
        },
        onError: (error: any) => {
            console.error('queryMemberIds error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadMemberIds()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadMemberIds = async () => {
        await queryMemberIds()
    }
}

export async function getInventoryByID(id: number, setInventory: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryInventoryByID] = useLazyQuery(GET_INVENTORY_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneInventory
            if (data) {
                setInventory(data)
            }
        },
        onError: (error: any) => {
            console.error('queryInventoryByID error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadInventoryByID()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadInventoryByID = async () => {
        await queryInventoryByID({
            variables: {
                id: +id,
            },
        })
    }
}

export async function getSupplierByID(id: number, setSupplier: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [querySupplierByID] = useLazyQuery(GET_SUPPLIER_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneSupplier
            if (data) {
                setSupplier(data)
            }
        },
        onError: (error: any) => {
            console.error('querySupplierByID error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadSupplierByID()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadSupplierByID = async () => {
        await querySupplierByID({
            variables: {
                id: +id,
            },
        })
    }
}

export async function getMaintenanceCheckByID(
    id: number,
    setMaintenanceCheck: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryMaintenanceCheckByID] = useLazyQuery(
        GET_MAINTENANCE_CHECK_BY_ID,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readOneComponentMaintenanceCheck
                if (data) {
                    setMaintenanceCheck(data)
                }
            },
            onError: (error: any) => {
                console.error('queryMaintenanceCheckByID error', error)
            },
        },
    )
    useEffect(() => {
        if (isLoading) {
            loadMaintenanceCheckByID()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadMaintenanceCheckByID = async () => {
        await queryMaintenanceCheckByID({
            variables: {
                id: +id,
            },
        })
    }
}

export async function getCrewDutyByID(id: number, setCrewDuty: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryCrewDutyByID] = useLazyQuery(GET_CREW_DUTY_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneCrewDuty
            if (data) {
                setCrewDuty(data)
            }
        },
        onError: (error: any) => {
            console.error('queryCrewDutyByID error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadCrewDutyByID()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadCrewDutyByID = async () => {
        await queryCrewDutyByID({
            variables: {
                id: +id,
            },
        })
    }
}

export async function getInventoryCategoryByID(
    id: number,
    setInventoryCategory: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryInventoryCategoryByID] = useLazyQuery(
        GET_INVENTORY_CATEGORY_BY_ID,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readOneInventoryCategory
                if (data) {
                    setInventoryCategory(data)
                }
            },
            onError: (error: any) => {
                console.error('queryInventoryCategoryByID error', error)
            },
        },
    )
    useEffect(() => {
        if (isLoading) {
            loadInventoryCategoryByID()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadInventoryCategoryByID = async () => {
        await queryInventoryCategoryByID({
            variables: {
                id: +id,
            },
        })
    }
}

export async function getMaintenanceCategoryByID(
    id: number,
    setMaintenanceCategory: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryMaintenanceCategoryByID] = useLazyQuery(
        GET_MAINTENANCE_CATEGORY_BY_ID,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readOneMaintenanceCategory
                if (data) {
                    setMaintenanceCategory(data)
                }
            },
            onError: (error: any) => {
                console.error('queryMaintenanceCategoryByID error', error)
            },
        },
    )
    useEffect(() => {
        if (isLoading) {
            loadMaintenanceCategoryByID()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadMaintenanceCategoryByID = async () => {
        await queryMaintenanceCategoryByID({
            variables: {
                id: +id,
                clientID: +(localStorage.getItem('clientId') ?? 0),
            },
        })
    }
}

export async function getComponentMaintenanceCheckByMemberId(
    memberId: number,
    handleSetMaintenanceTasks: (data: any) => void,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryTaskList] = useLazyQuery(GET_MAINTENANCE_CHECK_BY_MEMBER_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readComponentMaintenanceChecks.nodes
            if (data) {
                handleSetMaintenanceTasks(data)
            }
        },
        onError: (error: any) => {
            console.error('queryTaskList error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadTaskList()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadTaskList = async () => {
        await queryTaskList({
            variables: {
                memberId: +memberId,
            },
        })
    }
}

export async function getClientByID(id: number, setClient: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryClientByID] = useLazyQuery(GET_CLIENT_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readClients
            if (data) {
                setClient(data)
            }
        },
        onError: (error: any) => {
            console.error('queryClientByID error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadClientByID()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadClientByID = async () => {
        await queryClientByID({
            variables: {
                clientIDs: [id],
            },
        })
    }
}

export async function getMaintenanceCheckSubTaskByID(
    id: number,
    setMaintenanceCheckSubTask: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryMaintenanceCheckSubTask] = useLazyQuery(
        GET_MAINTENANCE_CHECK_SUBTASK,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readMaintenanceCheckSubTasks.nodes
                if (data) {
                    setMaintenanceCheckSubTask(data)
                }
            },
            onError: (error: any) => {
                console.error('queryMaintenanceCheckSubTask error', error)
            },
        },
    )
    useEffect(() => {
        if (isLoading) {
            loadMaintenanceCheckSubTask()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadMaintenanceCheckSubTask = async () => {
        await queryMaintenanceCheckSubTask({
            variables: {
                id: +id,
            },
        })
    }
}

export const upcomingScheduleDate = (
    maintenanceChecks: any,
    getRaw = false,
) => {
    const recurringTasks =
        maintenanceChecks?.maintenanceSchedule.__typename ===
        'ComponentMaintenanceSchedule'
            ? maintenanceChecks?.maintenanceSchedule
            : false
    if (recurringTasks) {
        const occursEveryType = recurringTasks.occursEveryType
            ? recurringTasks.occursEveryType
            : 'Days'
        if (occursEveryType === 'Hours' || occursEveryType === 'Uses') {
            if (occursEveryType === 'Uses') {
                return (
                    maintenanceChecks.equipmentUsagesAtCheck + ' Equipment Uses'
                )
            }
            return new Date(
                maintenanceChecks.dutyHoursAtCheck,
            ).toLocaleDateString()
        } else {
            const occursEvery = recurringTasks.occursEvery
                ? recurringTasks.occursEvery
                : 1
            const lastCompletedDate = dayjs(
                maintenanceChecks?.dateCompleted
                    ? new Date(maintenanceChecks.dateCompleted)
                    : new Date(),
            ).startOf('day')
            const nextOccurrence = lastCompletedDate.add(
                occursEvery,
                occursEveryType,
            )
            if (getRaw) {
                return nextOccurrence.format('YYYY-MM-DD')
            }
            return nextOccurrence.format('DD/MM/YYYY')
        }
    }
    return maintenanceChecks.expires
        ? getRaw
            ? dayjs(maintenanceChecks.expires).format('YYYY-MM-DD')
            : new Date(maintenanceChecks.expires).toLocaleDateString()
        : 'NA'
}

export async function getTrainingTypesList(setTrainingTypes: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryTrainingTypes] = useLazyQuery(TRAINING_TYPES, {
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
    const loadTrainingTypes = async () => {
        await queryTrainingTypes()
    }
}

export const isOverDueTask = (maintenanceChecks: any) => {
    if (
        !maintenanceChecks?.expires &&
        maintenanceChecks?.maintenanceSchedule?.occursEveryType !== 'Hours'
    ) {
        return {
            status: 'Completed',
            days: '',
        }
    }
    if (maintenanceChecks.status === 'Completed') {
        return {
            status: 'Completed',
            days:
                'Completed on ' +
                new Date(
                    maintenanceChecks?.dateCompleted
                        ? maintenanceChecks?.dateCompleted
                        : maintenanceChecks.completed,
                ).toLocaleDateString(),
        }
    }
    if (maintenanceChecks.status === 'Save_As_Draft') {
        return {
            status: 'Completed',
            days: maintenanceChecks.status.replaceAll('_', ' '),
        }
    }
    const recurringTasks =
        maintenanceChecks?.maintenanceSchedule.__typename ===
        'ComponentMaintenanceSchedule'
            ? maintenanceChecks?.maintenanceSchedule
            : false
    const today = new Date()
    const daysDifference = maintenanceChecks?.expires
        ? Math.ceil(
              (new Date(maintenanceChecks.expires).getTime() -
                  today.getTime()) /
                  (1000 * 60 * 60 * 24),
          )
        : 0
    if (maintenanceChecks?.maintenanceSchedule?.occursEveryType === 'Hours') {
        const engineHours = Math.min(
            ...maintenanceChecks.maintenanceSchedule.engineUsage.nodes
                .filter((engineUsage: any) => engineUsage.isScheduled === true)
                .map((engineUsage: any) => {
                    return (
                        engineUsage.lastScheduleHours +
                        maintenanceChecks.maintenanceSchedule.occursEvery -
                        engineUsage.engine.currentHours
                    )
                }),
        )
        const highWarnWithin = 3
        const mediumWarnWithin = 5
        const lowWarnWithin = 7
        if (engineHours < highWarnWithin) {
            return {
                status: 'High',
                days:
                    engineHours < 0
                        ? 'Overdue by ' + engineHours * -1 + ' engine hours'
                        : 'Due in ' + engineHours + ' engine hours',
            }
        }
        if (engineHours < mediumWarnWithin) {
            return {
                status: 'Medium',
                days:
                    engineHours < 0
                        ? 'Overdue by ' + engineHours * -1 + ' engine hours'
                        : 'Due in ' + engineHours + ' engine hours',
            }
        }
        if (engineHours < lowWarnWithin) {
            return {
                status: 'Low',
                days:
                    engineHours < 0
                        ? 'Overdue by ' + engineHours * -1 + ' engine hours'
                        : 'Due in ' + engineHours + ' engine hours',
            }
        }
        return {
            status: 'Upcoming',
            days: 'Due in ' + engineHours + ' engine hours',
        }
    }
    if (recurringTasks) {
        const occursEveryType = recurringTasks.occursEveryType
            ? recurringTasks.occursEveryType
            : 'Days'
        const highWarnWithin = occursEveryType === 'Months' ? 3 : 1
        const mediumWarnWithin = occursEveryType === 'Months' ? 7 : 3
        const lowWarnWithin = occursEveryType === 'Months' ? 14 : 7
        if (
            new Date(maintenanceChecks.expires) <
            new Date(new Date().setDate(today.getDate() + highWarnWithin))
        ) {
            return {
                status: 'High',
                days:
                    daysDifference < 0
                        ? daysDifference * -1 + ' days ago'
                        : 'Due in ' + daysDifference + ' days',
            }
        }
        if (
            new Date(maintenanceChecks.expires) <
            new Date(new Date().setDate(today.getDate() + mediumWarnWithin))
        ) {
            return {
                status: 'Medium',
                days:
                    daysDifference < 0
                        ? daysDifference * -1 + ' days ago'
                        : 'Due in ' + daysDifference + ' days',
            }
        }
        if (
            new Date(maintenanceChecks.expires) <
            new Date(new Date().setDate(today.getDate() + lowWarnWithin))
        ) {
            return {
                status: 'Low',
                days:
                    daysDifference < 0
                        ? daysDifference * -1 + ' days ago'
                        : 'Due in ' + daysDifference + ' days',
            }
        }
    } else {
        const highWarnWithin = 1
        const mediumWarnWithin = 3
        const lowWarnWithin = 7
        if (
            new Date(maintenanceChecks.expires) <
            new Date(new Date().setDate(today.getDate() + highWarnWithin))
        ) {
            return {
                status: 'High',
                days:
                    daysDifference < 0
                        ? daysDifference * -1 + ' days ago'
                        : 'Due in ' + daysDifference + ' days',
            }
        }
        if (
            new Date(maintenanceChecks.expires) <
            new Date(new Date().setDate(today.getDate() + mediumWarnWithin))
        ) {
            return {
                status: 'Medium',
                days:
                    daysDifference < 0
                        ? daysDifference * -1 + ' days ago'
                        : 'Due in ' + daysDifference + ' days',
            }
        }
        if (
            new Date(maintenanceChecks.expires) <
            new Date(new Date().setDate(today.getDate() + lowWarnWithin))
        ) {
            return {
                status: 'Low',
                days:
                    daysDifference < 0
                        ? daysDifference * -1 + ' days ago'
                        : 'Due in ' + daysDifference + ' days',
            }
        }
    }
    return {
        status: 'Upcoming',
        days: 'Due in ' + daysDifference + ' days',
    }
}

export const GetTrainingSessionStatus = (due: any) => {
    const classes = {
        low: 'text-slgreen-1000 bg-neon-100 px-2 py-0.5 border rounded text-xs border-slgreen-1000',
        medium: 'text-yellow-600 bg-yellow-100 px-2 py-0.5 border rounded text-xs border-yellow-600',
        high: 'text-slred-1000 bg-slred-100 px-2 py-0.5 border rounded text-xs border-slred-1000',
    }
    const dueDate = due.dueDate
    const today = new Date()
    const daysDifference = Math.ceil(
        (new Date(dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    )
    const daysText =
        daysDifference < 0
            ? daysDifference * -1 + ' days ago'
            : 'Due in ' + daysDifference + ' days'

    return {
        class: daysDifference < 0 ? classes.high : classes.low,
        label: daysText,
        isOverdue: daysDifference < 0,
        dueWithinSevenDays: !(daysDifference < 0) && daysDifference <= 7,
    }
}

export async function getLogBookByID(id: number, setLogBook: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryLogBook] = useLazyQuery(GET_LOGBOOK, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneLogBook
            if (data) {
                setLogBook(data)
            }
        },
        onError: (error: any) => {
            console.error('queryLogBook error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadLogBook()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadLogBook = async () => {
        await queryLogBook({
            variables: {
                id: +id,
            },
        })
    }
}

export async function getLogBookEntryByID(id: number, setLogBookEntry: any) {
    const online = false // To be replaced with useOnline()
    const lbeModel = new LogBookEntryModel()
    const [isLoading, setIsLoading] = useState(true)
    const [queryLogBookEntry] = useLazyQuery(GET_LOGBOOK_ENTRY_BY_ID, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneLogBookEntry
            if (data) {
                setLogBookEntry(data)
            }
        },
        onError: (error: any) => {
            console.error('queryLogBookEntry error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadLogBookEntry()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadLogBookEntry = async () => {
        if (online) {
            await queryLogBookEntry({
                variables: {
                    logbookEntryId: +id,
                },
            })
        } else {
            const response = await lbeModel.getById(id)
            setLogBookEntry(response)
        }
    }
}

export async function getOneClient(setClient: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryClientByID] = useLazyQuery(READ_ONE_CLIENT, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneClient
            if (data) {
                setClient(data)
            }
        },
        onError: (error: any) => {
            console.error('queryClientByID error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadClientByID()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadClientByID = async () => {
        await queryClientByID({
            variables: {
                filter: {
                    id: { eq: +(localStorage.getItem('clientId') ?? 0) },
                },
            },
        })
    }
}

export async function getCrewMembersLogBookEntrySections(
    crewMemberID: any,
    setLogBookEntrySections: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryLogBookEntrySections] = useLazyQuery(
        CrewMembers_LogBookEntrySection,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readCrewMembers_LogBookEntrySections.nodes
                if (data) {
                    setLogBookEntrySections(data)
                }
            },
            onError: (error: any) => {
                console.error('queryLogBookEntrySections error', error)
            },
        },
    )
    useEffect(() => {
        if (isLoading) {
            loadLogBookEntrySections()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadLogBookEntrySections = async () => {
        const searchFilter: SearchFilter = {}
        searchFilter.crewMemberID = { eq: crewMemberID }
        await queryLogBookEntrySections({
            variables: {
                filter: searchFilter,
            },
        })
    }
}

export const GetCrewListWithTrainingStatus = (crewList: any, vessels: any) => {
    const vesselID = vessels.length === 1 ? +vessels[0].id : 0
    const updatedCrewList = crewList.map((crewMember: any) => {
        if (
            crewMember.trainingSessionsDue &&
            crewMember.trainingSessionsDue.nodes
        ) {
            return {
                ...crewMember,
                trainingSessionsDue: {
                    ...crewMember.trainingSessionsDue,
                    nodes: crewMember.trainingSessionsDue.nodes
                        .filter((node: any) => {
                            return !isEmpty(node.dueDate)
                        })
                        .map((node: any) => ({
                            ...node,
                            status: GetTrainingSessionStatus(node),
                        })),
                },
            }
        }
        return crewMember
    })
    const crewListWithTrainingStatus = updatedCrewList.map(
        (crewMember: any) => {
            if (
                crewMember.trainingSessionsDue &&
                crewMember.trainingSessionsDue.nodes
            ) {
                const filteredNodes =
                    crewMember.trainingSessionsDue.nodes.filter((node: any) => {
                        if (vesselID > 0) {
                            return (
                                !isEmpty(node.dueDate) &&
                                +node.vesselID === +vesselID
                            )
                        } else {
                            return !isEmpty(node.dueDate)
                        }
                    })
                const mappedNodes = filteredNodes.map((node: any) => ({
                    ...node,
                    status: GetTrainingSessionStatus(node),
                }))

                let trainingStatus = { label: 'Good', dues: [] }

                if (filteredNodes.length === 0) {
                    trainingStatus = { label: 'Good', dues: [] }
                } else if (
                    filteredNodes.some(
                        (node: any) => node.status.dueWithinSevenDays,
                    )
                ) {
                    trainingStatus = {
                        label: ' ',
                        dues: filteredNodes.filter(
                            (node: any) => node.status.dueWithinSevenDays,
                        ),
                    }
                } else if (
                    filteredNodes.some((node: any) => node.status.isOverdue)
                ) {
                    trainingStatus = {
                        label: 'Overdue',
                        dues: filteredNodes.filter(
                            (node: any) => node.status.isOverdue,
                        ),
                    }
                }
                // Remove duplicate objects based on trainingTypeID and vesselID
                const uniqueDues = Object.values(
                    trainingStatus.dues.reduce((acc: any, due: any) => {
                        const key = due.trainingTypeID
                        if (!acc[key]) {
                            acc[key] = due
                        }
                        return acc
                    }, {}),
                )
                return {
                    ...crewMember,
                    trainingSessionsDue: {
                        ...crewMember.trainingSessionsDue,
                        nodes: mappedNodes,
                    },
                    trainingStatus: { ...trainingStatus, dues: uniqueDues },
                }
            }
            return {
                ...crewMember,
                trainingStatus: { label: 'Good', dues: [] },
            }
        },
    )
    return crewListWithTrainingStatus
}

const GetVesselWithTaskStatus = (vessels: any) => {
    /*
    const daysDifference = Math.ceil(
        (new Date(task.expires).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24),
    )
    const isOverdue = daysDifference < 0
    const dueWithinSevenDays = !(daysDifference < 0) && daysDifference <= 7 */
    const vesselList = vessels.map((vessel: any) => {
        let taskStatus = { label: 'Good', tasks: [] }
        if (
            vessel.componentMaintenanceChecks &&
            vessel.componentMaintenanceChecks.nodes
        ) {
            const today = new Date()
            let overdueTasks: any = []
            let upcomingTasks: any = []
            vessel.componentMaintenanceChecks.nodes.forEach((task: any) => {
                const daysDifference = Math.ceil(
                    (new Date(task.expires).getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24),
                )
                const isOverdue = daysDifference < 0
                const dueWithinSevenDays =
                    !(daysDifference < 0) && daysDifference <= 7

                if (isOverdue) {
                    overdueTasks.push({
                        ...task,
                        isOverdue: isOverDueTask(task),
                    })
                }
                if (dueWithinSevenDays) {
                    upcomingTasks.push({
                        ...task,
                        isOverdue: isOverDueTask(task),
                    })
                }
            })
            if (overdueTasks.length > 0) {
                taskStatus = {
                    label: 'Overdue',
                    tasks: overdueTasks,
                }
            }
            if (upcomingTasks.length > 0) {
                taskStatus = {
                    label: 'Upcoming',
                    tasks: upcomingTasks,
                }
            }
        }
        // const componentMaintenanceChecks =
        //     vessel.componentMaintenanceChecks.nodes.map((task: any) => {

        //         return {
        //             ...task,
        //             isOverDue: isOverDueTask(task),
        //         }
        //     })
        return {
            ...vessel,
            taskStatus: taskStatus,
        }
    })

    return vesselList
}
const GetVesselWithTrainingStatus = (vessels: any) => {
    return vessels.map((vessel: any) => {
        if (vessel.trainingSessionsDue && vessel.trainingSessionsDue.nodes) {
            const vesselID = +vessel.id
            const filteredNodes = vessel.trainingSessionsDue.nodes.filter(
                (node: any) => {
                    if (vesselID > 0) {
                        return (
                            !isEmpty(node.dueDate) &&
                            +node.vesselID === +vesselID
                        )
                    } else {
                        return !isEmpty(node.dueDate)
                    }
                },
            )
            const mappedNodes = filteredNodes.map((node: any) => ({
                ...node,
                status: GetTrainingSessionStatus(node),
            }))
            let trainingStatus = { label: 'Good', dues: [] }
            if (filteredNodes.length === 0) {
                trainingStatus = { label: 'Good', dues: [] }
            } else if (
                filteredNodes.some(
                    (node: any) => node.status.dueWithinSevenDays,
                )
            ) {
                trainingStatus = {
                    label: 'Upcoming',
                    dues: filteredNodes.filter(
                        (node: any) => node.status.dueWithinSevenDays,
                    ),
                }
            } else if (
                filteredNodes.some((node: any) => node.status.isOverdue)
            ) {
                trainingStatus = {
                    label: 'Overdue',
                    dues: filteredNodes.filter(
                        (node: any) => node.status.isOverdue,
                    ),
                }
            }
            // Remove duplicate objects based on trainingTypeID and vesselID
            const uniqueDues = Object.values(
                trainingStatus.dues.reduce((acc: any, due: any) => {
                    const key = due.trainingTypeID
                    if (!acc[key]) {
                        acc[key] = due
                    }
                    return acc
                }, {}),
            )
            return {
                ...vessel,
                trainingSessionsDue: {
                    ...vessel.trainingSessionsDue,
                    nodes: mappedNodes,
                },
                trainingStatus: { ...trainingStatus, dues: uniqueDues },
            }
        }
        return {
            ...vessel,
            trainingStatus: { label: 'Good', dues: [] },
        }
    })
}
export const GetVesselListWithTrainingAndMaintenanceStatus = (
    vesselList: any,
) => {
    const updatedVesselList = vesselList.map((vessel: any) => {
        if (vessel.trainingSessionsDue && vessel.trainingSessionsDue.nodes) {
            return {
                ...vessel,
                // trainingStatus: GetVesselTrainingStatus(vessel),
                trainingSessionsDue: {
                    ...vessel.trainingSessionsDue,
                    nodes: vessel.trainingSessionsDue.nodes
                        .filter((node: any) => {
                            return !isEmpty(node.dueDate)
                        })
                        .map((node: any) => ({
                            ...node,
                            status: GetTrainingSessionStatus(node),
                        })),
                },
                // componentMaintenanceChecks: {
                //     ...vessel.componentMaintenanceChecks,
                //     nodes: vessel.componentMaintenanceChecks.nodes
                //         .filter((task: any) => task.archived === false)
                //         .map((task: any) => ({
                //             ...task,
                //             isOverDue: isOverDueTask(task),
                //         })),
                // },
            }
        }
        return vessel
    })
    const vesselListWithTrainingStatus =
        GetVesselWithTrainingStatus(updatedVesselList)
    const vesselListWithMaintenanceStatus = GetVesselWithTaskStatus(
        vesselListWithTrainingStatus,
    )

    return vesselListWithMaintenanceStatus
}

export async function getSectionMemberComments(
    sectionID: number,
    setSectionMemberComments: any,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [querySectionMemberComments] = useLazyQuery(
        GET_SECTION_MEMBER_COMMENTS,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readSectionMemberComments.nodes
                if (data) {
                    setSectionMemberComments(data)
                }
            },
            onError: (error: any) => {
                console.error('querySectionMemberComments error', error)
            },
        },
    )
    useEffect(() => {
        if (isLoading) {
            loadSectionMemberComments()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadSectionMemberComments = async () => {
        await querySectionMemberComments({
            variables: {
                filter: {
                    logBookEntrySectionID: { eq: sectionID },
                },
            },
        })
    }
}

export const getFieldName = (field: any) => {
    if (field?.__typename && field.__typename === 'CustomisedComponentField') {
        const logbookFields = SLALL_LogBookFields
        const defaultConfig = logbookFields.map((component: any) => component)
        var title = field.fieldName
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            defaultLogBookComponents.items.forEach((defaultField: any) => {
                if (field.fieldName === defaultField.value) {
                    title = defaultField?.title
                        ? defaultField?.title
                        : field.fieldName
                }
            })
        })
        return title
    } else {
        return field?.title ? field.title : field.value
    }
}

export async function getDepartmentList(setDepartmentList: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [queryDepartmentList] = useLazyQuery(ReadDepartments, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readDepartments.nodes
            if (data) {
                setDepartmentList(data)
            }
        },
        onError: (error: any) => {
            console.error('queryDepartmentList error', error)
        },
    })
    useEffect(() => {
        if (isLoading) {
            loadDepartments()
            setIsLoading(false)
        }
    }, [isLoading])
    const loadDepartments = async () => {
        await queryDepartmentList()
    }
}

export async function getSeaTimeReport(
    crewMemberIds: any, // array of crew member IDs
    vesselIds: any, // array of vessel IDs
    startDate: any, // string in ISO format
    endDate: any, // string in ISO format
    setSeaTimeReport: any, // callback to set the report data
) {
    const [isLoading, setIsLoading] = useState(true)
    const [querySeaTimeReport] = useLazyQuery(GET_SEA_TIME_REPORT, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const reportData = response.seaTimeReport
            if (reportData) {
                setSeaTimeReport(reportData)
            }
        },
        onError: (error) => {
            console.error('querySeaTimeReport error', error)
        },
    })

    useEffect(() => {
        if (isLoading) {
            loadSeaTimeReport()
            setIsLoading(false)
        }
    }, [isLoading])

    const loadSeaTimeReport = async () => {
        await querySeaTimeReport({
            variables: {
                crewMemberIds,
                vesselIds,
                startDate,
                endDate,
            },
        })
    }
}

export const convertTimeFormat = (time: string) => {
    if (time === null || time === undefined) return ''
    const [hours, minutes, seconds] = time.split(':')
    return `${hours}:${minutes}`
}

export const userHasRescueVessel = (setHasRescueVessel: any) => {
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        if (isLoading) {
            loadVessels()
            setIsLoading(false)
        }
    }, [isLoading])

    const [queryVessels] = useLazyQuery(VESSEL_LIST, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (queryVesselResponse: any) => {
            if (queryVesselResponse.readVessels.nodes) {
                setHasRescueVessel(
                    queryVesselResponse.readVessels.nodes.filter(
                        (vessel: any) => vessel.vesselType === 'Rescue_Vessel',
                    ).length > 0,
                )
            }
        },
        onError: (error: any) => {
            console.error('queryVessels error', error)
        },
    })
    const loadVessels = async () => {
        await queryVessels()
    }
}
