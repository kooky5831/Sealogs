'use client'
import React, { useEffect, useState } from 'react'
import { Button, Heading } from 'react-aria-components'
import { useMutation, useLazyQuery } from '@apollo/client'
import {
    CREATE_FUELLOG,
    CreateLogBookSignOff_LogBookEntrySection,
    UPDATE_ENGINE,
    UPDATE_FUELLOG,
    UpdateCrewMembers_LogBookEntrySection,
    UpdateFuelTank,
    UpdateLogBookSignOff_LogBookEntrySection,
} from '@/app/lib/graphQL/mutation'
import SignatureCanvas from 'react-signature-canvas'
import {
    AlertDialog,
    DailyCheckField,
    FooterWrapper,
    SeaLogsButton,
} from '@/app/components/Components'
import {
    GET_ENGINES,
    GET_FUELTANKS,
    GET_GEO_LOCATIONS,
    GET_SECTION_MEMBER_COMMENTS,
    GET_VESSEL_POSITION,
} from '@/app/lib/graphQL/query'
import {
    UPDATE_SECTION_MEMBER_COMMENT,
    CREATE_SECTION_MEMBER_COMMENT,
    UPDATE_LOGBOOK_ENTRY,
    CreateLogBookEntrySection_Signature,
    CREATE_VESSEL_POSITION,
} from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { SLALL_LogBookFields, vesselTypes } from '@/app/lib/vesselDefaultConfig'
import toast, { Toaster } from 'react-hot-toast'
import { classes } from '@/app/components/GlobalClasses'
import { getPermissions, hasPermission, isCrew } from '@/app/helpers/userHelper'
import LocationField from './components/location'
import { get, isEmpty, update } from 'lodash'
import { GetCrewListWithTrainingStatus } from '@/app/lib/actions'
import dayjs from 'dayjs'
import TimeField from './components/time'
import OpenPreviousLogbookComments from './open-previous-comments'
import { displayDescriptionIcon, getSortOrder } from '../daily-checks/actions'
import SlidingPanel from 'react-sliding-side-panel'
import { XMarkIcon } from '@heroicons/react/24/outline'
import 'react-quill/dist/quill.snow.css'
import { SealogsFuelIcon } from '@/app/lib/icons/SealogsFuelIcon'
import EngineModel from '@/app/offline/models/engine'
import FuelTankModel from '@/app/offline/models/fuelTank'
import GeoLocationModel from '@/app/offline/models/geoLocation'
import VehiclePositionModel from '@/app/offline/models/vehiclePosition'
import SectionMemberCommentModel from '@/app/offline/models/sectionMemberComment'
import LogBookSignOff_LogBookEntrySectionModel from '@/app/offline/models/logBookSignOff_LogBookEntrySection'
import { generateUniqueId } from '@/app/offline/helpers/functions'
import FuelLogModel from '@/app/offline/models/fuelLog'
import CrewMembers_LogBookEntrySectionModel from '@/app/offline/models/crewMembers_LogBookEntrySection'
import LogBookEntryModel from '@/app/offline/models/logBookEntry'
import LogBookEntrySection_SignatureModel from '@/app/offline/models/logBookEntrySection_Signature'

export default function LogEntrySignOff({
    logBookConfig,
    signOff = false,
    updateSignOff = false,
    fuel = false,
    locked = false,
    crewMembers = false,
    vessel = false,
    logBook = false,
    masterTerm = 'Master',
    prevComments = false,
    screen = 'Desktop',
    onUpdatePrevComments,
    offline = false,
}: {
    logBookConfig: any
    signOff: any
    updateSignOff: any
    fuel: any
    locked: any
    crewMembers: any
    vessel: any
    logBook: any
    masterTerm: any
    prevComments: any
    screen: any
    onUpdatePrevComments: any
    offline?: boolean
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const vesselID = searchParams.get('vesselID') ?? 0
    const logentryID = searchParams.get('logentryID') ?? 0
    const [openCommentAlert, setOpenCommentAlert] = useState(false)
    const [currentComment, setCurrentComment] = useState<any>('')
    const [currentField, setCurrentField] = useState<any>('')
    const [comments, setComments] = useState<any>(false)
    const [signature, setSignature] = useState<any>(false)
    const [engineList, setEngineList] = useState<any>(null)
    const [selectedLocation, setSelectedLocation] = useState<any>(null)
    const [reloadTimer, setReloadTimer] = useState<any>(false)
    const [currentLocation, setCurrentLocation] = useState<any>({
        latitude: '',
        longitude: '',
    })
    const [geoLocations, setLocations] = useState<any>(false)
    const [geoLocation, setGeoLocation] = useState<any>(false)
    const [imCrew, setImCrew] = useState<any>(false)
    const [crew, setCrew] = useState<any>(false)
    const [fuelStart, setFuelStart] = useState<any>(false)
    const [sectionComment, setSectionComment] = useState<any>('')
    const [time, setTime] = useState<any>(dayjs().format('HH:mm'))
    const [dismissPrevComment, setDismissPrevComment] = useState<any>(false)
    const [isLocked, setIsLocked] = useState<any>(locked)
    const [prevComment, setPrevComment] = useState<any>(false)
    const [unrelevantComments, setUnrelevantComments] = useState([] as any)
    const [filteredFields, setFilteredFields] = useState<any>(false)
    const [openDescriptionPanel, setOpenDescriptionPanel] = useState(false)
    const [descriptionPanelContent, setDescriptionPanelContent] = useState('')
    const [descriptionPanelHeading, setDescriptionPanelHeading] = useState('')
    const [fuelTankList, setFuelTankList] = useState<any>(false)

    const engineModel = new EngineModel()
    const fuelTankModel = new FuelTankModel()
    const fuelLogModel = new FuelLogModel()
    const geoLocationModel = new GeoLocationModel()
    const vehiclePositionModel = new VehiclePositionModel()
    const commentModel = new SectionMemberCommentModel()
    const signOffModel = new LogBookSignOff_LogBookEntrySectionModel()
    const lbCrewModel = new CrewMembers_LogBookEntrySectionModel()
    const logBookModel = new LogBookEntryModel()
    const signatureModel = new LogBookEntrySection_SignatureModel()
    const [permissions, setPermissions] = useState<any>(false)
    const [closeLogBookEntry, setCloseLogBookEntry] = useState<any>(false)

    const init_permissions = () => {
        if (permissions) {
            if (hasPermission('CLOSE_LOGBOOKENTRY', permissions)) {
                setCloseLogBookEntry(true)
            } else {
                setCloseLogBookEntry(false)
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
        if (crewMembers) {
            const data = crewMembers.map((crew: any) => {
                return {
                    ...crew,
                    crewMember: GetCrewListWithTrainingStatus(
                        [crew.crewMember],
                        [vessel],
                    )[0],
                }
            })
            setCrew(data)
        }
    }, [crewMembers])

    const [queryGetFuelTanks] = useLazyQuery(GET_FUELTANKS, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readFuelTanks.nodes
            setFuelTankList(data)
        },
        onError: (error: any) => {
            console.error('getFuelTanks error', error)
        },
    })

    const getFuelTanks = async (fuelTankIds: any) => {
        if (offline) {
            const data = await fuelTankModel.getByIds(fuelTankIds)
            setFuelTankList(data)
        } else {
            await queryGetFuelTanks({
                variables: {
                    id: fuelTankIds,
                },
            })
        }
    }

    useEffect(() => {
        if (vessel.vesselType) {
            const logbookFields = SLALL_LogBookFields.filter((field: any) => {
                if (field?.items?.length > 0) {
                    return field.vesselType.includes(
                        vesselTypes.indexOf(vessel?.vesselType),
                    )
                }
                return false
            })
            var filteredFields: any = []
            logbookFields.map((logbookField: any) => {
                var currentField = logbookField
                var currentFieldItems: any = []
                logbookField.items.map((fields: any) => {
                    if (
                        fields.vesselType.includes(
                            vesselTypes.indexOf(vessel?.vesselType),
                        )
                    ) {
                        currentFieldItems.push(fields)
                    }
                })
                currentField.items = currentFieldItems
                filteredFields.push(currentField)
            })
            setFilteredFields(filteredFields)
            const fuelTankIds = vessel?.parentComponent_Components?.nodes
                .filter(
                    (item: any) =>
                        item.basicComponent.componentCategory === 'FuelTank',
                )
                .map((item: any) => {
                    return item.basicComponent.id
                })
            fuelTankIds.length > 0 && getFuelTanks(fuelTankIds)
        }
    }, [vessel])

    const getSlallFields = () => {
        return filteredFields ? filteredFields : SLALL_LogBookFields
    }

    const [loadLocations] = useLazyQuery(GET_GEO_LOCATIONS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const locations = response.readGeoLocations.nodes?.map(
                (location: any) => ({
                    label: location.title,
                    value: location.id,
                    latitude: location.lat,
                    longitude: location.long,
                }),
            )
            setGeoLocation(response.readGeoLocations.nodes)
            setLocations(locations)
            getlastLocation()
        },
        onError: (error) => {
            console.error('Error loading locations', error)
        },
    })

    useEffect(() => {
        setFuelStart(signOff?.fuelStart)
        if (fuel && fuel[0]?.fuelTankStartStops?.nodes?.length > 0) {
            setFuelStart(
                signOff?.fuelStart
                    ? signOff.fuelStart
                    : fuel[0]?.fuelTankStartStops?.nodes[0]?.start,
            )
        }
        if (signOff?.completedTime) {
            setTime(
                signOff.completedTime.split(':')[0] +
                    ':' +
                    signOff.completedTime.split(':')[1],
            )
        }
    }, [fuel, signOff])

    const getlastLocation = async () => {
        if (offline) {
            const vpData = await vehiclePositionModel.getByVehicleId(vesselID)
            const sortedData = vpData.sort((a: any, b: any) => {
                return b.id.localeCompare(a.id, undefined, { numeric: true })
            })
            if (sortedData.length > 0) {
                const data = sortedData[0]
                if (+data.geoLocation?.id > 0) {
                    setSelectedLocation({
                        label: data.geoLocation.title,
                        value: data.geoLocation.id,
                        latitude: data.geoLocation.lat,
                        longitude: data.geoLocation.long,
                    })
                }
                setCurrentLocation({
                    latitude: data.lat,
                    longitude: data.long,
                })
            }
        } else {
            await queryVesselPosition({
                variables: {
                    id: +vesselID,
                },
            })
        }
    }

    const [queryVesselPosition] = useLazyQuery(GET_VESSEL_POSITION, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneVehiclePosition
            if (data.geoLocation?.id > 0) {
                setSelectedLocation({
                    label: data.geoLocation.title,
                    value: data.geoLocation.id,
                    latitude: data.geoLocation.lat,
                    longitude: data.geoLocation.long,
                })
            }
            setCurrentLocation({
                latitude: data.lat,
                longitude: data.long,
            })
        },
        onError: (error: any) => {
            console.error('queryVesselPosition error', error)
        },
    })
    const loadGeoLocations = async () => {
        if (offline) {
            const data = await geoLocationModel.getAll()
            const locations = data?.map((location: any) => ({
                label: location.title,
                value: location.id,
                latitude: location.lat,
                longitude: location.long,
            }))
            setGeoLocation(data)
            setLocations(locations)
            getlastLocation()
        } else {
            loadLocations()
        }
    }
    useEffect(() => {
        setImCrew(isCrew())
        if (!geoLocations) {
            loadGeoLocations()
        }
        if (logBook && logBook.status === 'Locked') {
            setIsLocked(true)
        }
    }, [])

    const [additionalComment, setAdditionalComment] = useState<Boolean>(false)
    const handleReview = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                review: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleSafetyEquipmentCheck = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                safetyEquipmentCheck: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleForecastAccuracy = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                forecastAccuracy: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleAIS = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                ais: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleNavigationLightsAndShapes = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                navigationLightsAndShapes: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleElectronicNavigationalAids = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                electronicNavigationalAids: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleMainEngines = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                mainEngines: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleAuxiliarySystems = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                auxiliarySystems: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleFuelAndOil = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                fuelAndOil: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const handleBilgeSystems = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                bilgeSystems: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const handlePower = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                power: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const handleBatteryMaintenance = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                batteryMaintenance: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleCircuitInspections = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                circuitInspections: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleMooringAndAnchoring = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                mooringAndAnchoring: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleCargoAndAccessEquipment = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                cargoAndAccessEquipment: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const handleHatchesAndWatertightDoors = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                hatchesAndWatertightDoors: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const handleGalleyAppliances = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                galleyAppliances: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleWasteManagement = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                wasteManagement: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleVentilationAndAirConditioning = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                ventilationAndAirConditioning: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const handleEmergencyReadiness = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                emergencyReadiness: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const handleEnvironmentalCompliance = async (check: Boolean) => {
        if (+signOff?.id > 0) {
            const variables = {
                id: signOff.id,
                environmentalCompliance: check ? 'Ok' : 'Not_Ok',
            }
            if (offline) {
                const data = await signOffModel.save(variables)
                updateSignOff(data)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            } else {
                updateLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }

    const getComment = (fieldName: string, commentType = 'FieldComment') => {
        if (!comments) return false
        // Sort comments in descending order
        const sortedComments = comments?.sort((a: any, b: any) => b.id - a.id)
        const comment =
            sortedComments?.length > 0
                ? sortedComments.filter(
                      (comment: any) =>
                          comment.fieldName === fieldName &&
                          comment.commentType === commentType,
                  )
                : false
        return comment.length > 0 ? comment[0] : false
    }

    const composeField = (fieldName: string) => {
        var composedField: { fleldID: any; fieldName: any }[] = []
        const signOff =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'LogBookSignOff_LogBookComponent',
            )
        if (
            signOff?.length > 0 &&
            signOff[0]?.customisedComponentFields?.nodes.map((field: any) =>
                field.fieldName === fieldName
                    ? composedField.push({
                          fleldID: field.id,
                          fieldName: field.fieldName,
                      })
                    : '',
            )
        ) {
            return composedField
        }
        return false
    }

    const showCommentPopup = (comment: string, field: any) => {
        setCurrentComment(comment ? comment : '')
        setCurrentField(field)
        setOpenCommentAlert(true)
    }

    const handleSaveComment = async () => {
        setOpenCommentAlert(false)
        const comment = (document.getElementById('comment') as HTMLInputElement)
            ?.value
        const variables = {
            id: currentComment?.id ? currentComment?.id : 0,
            fieldName: currentField[0]?.fieldName,
            comment: comment,
            logBookEntryID: +logentryID,
            logBookEntrySectionID: signOff.id,
            commentType: 'FieldComment',
        }
        const offlineID = currentComment?.id
            ? currentComment?.id
            : generateUniqueId()
        if (currentComment) {
            if (offline) {
                await commentModel.save({ ...variables, id: offlineID })
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variables },
                })
            }
        } else {
            setCurrentComment(comment)
            if (offline) {
                await commentModel.save({ ...variables, id: offlineID })
                loadSectionMemberComments()
                setCurrentComment('')
            } else {
                createSectionMemberComment({
                    variables: { input: variables },
                })
            }
        }
    }

    const [
        updateSectionMemberComment,
        { loading: updateSectionMemberCommentLoading },
    ] = useMutation(UPDATE_SECTION_MEMBER_COMMENT, {
        onCompleted: (response) => {
            console.log('Comment updated')
            loadSectionMemberComments()
        },
        onError: (error) => {
            console.error('Error updating comment', error)
        },
    })

    const [
        createSectionMemberComment,
        { loading: createSectionMemberCommentLoading },
    ] = useMutation(CREATE_SECTION_MEMBER_COMMENT, {
        onCompleted: (response) => {
            console.log('Comment created')
            loadSectionMemberComments()
            setCurrentComment('')
        },
        onError: (error) => {
            console.error('Error creating comment', error)
        },
    })

    const [querySectionMemberComments] = useLazyQuery(
        GET_SECTION_MEMBER_COMMENTS,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response: any) => {
                const data = response.readSectionMemberComments.nodes
                if (data) {
                    setComments(data)
                    setSectionComment(
                        data.filter(
                            (comment: any) => comment.commentType === 'Section',
                        )[0]?.comment,
                    )
                }
            },
            onError: (error: any) => {
                console.error('querySectionMemberComments error', error)
            },
        },
    )

    const loadSectionMemberComments = async () => {
        if (offline) {
            const data = await commentModel.getByLogBookEntrySectionID(
                signOff.id,
            )
            if (data) {
                setComments(data)
                setSectionComment(
                    data.filter(
                        (comment: any) => comment.commentType === 'Section',
                    )[0]?.comment,
                )
            }
        } else {
            await querySectionMemberComments({
                variables: {
                    filter: {
                        logBookEntrySectionID: { eq: signOff.id },
                    },
                },
            })
        }
    }

    const createOfflineLogBookSignOff = async () => {
        const id = generateUniqueId()
        const data = await signOffModel.save({
            id: id,
            logBookEntryID: logentryID,
        })
        updateSignOff(data)
    }
    useEffect(() => {
        if (!signOff && screen === 'Desktop') {
            if (offline) {
                createOfflineLogBookSignOff()
            } else {
                createLogBookSignOff_LogBookEntrySection({
                    variables: {
                        input: {
                            logBookEntryID: logentryID,
                        },
                    },
                })
            }
        }
        if (signOff) {
            loadSectionMemberComments()
        }
    }, [])

    const displayField = (fieldName: string) => {
        const signOff =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'LogBookSignOff_LogBookComponent',
            )
        if (
            signOff?.length > 0 &&
            signOff[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            return true
        }
        return false
    }

    const getFieldLabel = (fieldName: string) => {
        const signOff =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'LogBookSignOff_LogBookComponent',
            )
        if (signOff?.length > 0) {
            return signOff[0]?.customisedComponentFields?.nodes.find(
                (field: any) => field.fieldName === fieldName,
            )?.customisedFieldTitle
                ? signOff[0]?.customisedComponentFields?.nodes.find(
                      (field: any) => field.fieldName === fieldName,
                  )?.customisedFieldTitle
                : fieldName
        }
        return fieldName
    }

    const displayDescription = (fieldName: string) => {
        const signOff =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'LogBookSignOff_LogBookComponent',
            )
        if (
            signOff?.length > 0 &&
            signOff[0]?.customisedComponentFields?.nodes.filter(
                (field: any) =>
                    field.fieldName === fieldName && field.status !== 'Off',
            ).length > 0
        ) {
            const description =
                signOff[0]?.customisedComponentFields?.nodes.filter(
                    (field: any) =>
                        field.fieldName === fieldName && field.status !== 'Off',
                )[0].description
            return description
        }
        return ''
    }

    const [
        updateLogBookSignOff_LogBookEntrySection,
        { loading: updateLogBookSignOff_LogBookEntrySectionLoading },
    ] = useMutation(UpdateLogBookSignOff_LogBookEntrySection, {
        onCompleted: (response) => {
            console.log('Safety check completed')
            const data = response.updateLogBookSignOff_LogBookEntrySection
            updateSignOff(data)
            if (reloadTimer > 0) {
                setReloadTimer(reloadTimer + 1)
            }
        },
        onError: (error) => {
            console.error('Error completing safety check', error)
        },
    })

    const [
        createLogBookSignOff_LogBookEntrySection,
        { loading: createLogBookSignOff_LogBookEntrySectionLoading },
    ] = useMutation(CreateLogBookSignOff_LogBookEntrySection, {
        onCompleted: (response) => {
            console.log('Safety check completed')
            const data = response.createLogBookSignOff_LogBookEntrySection
            updateSignOff(data)
        },
        onError: (error) => {
            console.error('Error completing safety check', error)
        },
    })

    const getFilteredFields = (fields: any, grouped = true) => {
        const logbookFields = getSlallFields()
        const defaultConfig = logbookFields.map((component: any) => component)
        var groupFields: any = []
        var nonGroupFields: any = []
        var groups: any = []
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (
                'LogBookSignOff_LogBookComponent' ===
                defaultLogBookComponents.componentClass
            ) {
                defaultLogBookComponents.items.forEach((defaultField: any) => {
                    fields.forEach((field: any) => {
                        if (field.name === defaultField.value) {
                            if (defaultField.groupTo != undefined) {
                                groupFields.push({
                                    ...field,
                                    groupTo: defaultField.groupTo,
                                })
                                groups.includes(defaultField.groupTo)
                                    ? null
                                    : groups.push(defaultField.groupTo)
                            } else {
                                nonGroupFields.push(field)
                            }
                        }
                    })
                })
            }
        })

        if (grouped) {
            const groupedFields = groups.map((group: any) => {
                const fields = groupFields.filter(
                    (field: any) => field.groupTo === group,
                )
                return {
                    name: group,
                    field: getFieldByName(group),
                    items: fields,
                }
            })
            return groupedFields
        }
        return nonGroupFields.filter(
            (field: any) => !groups?.includes(field.name),
        )
    }

    const isGroupVisible = (fieldName: string) => {
        const logbookFields = getSlallFields()
        const defaultConfig = logbookFields.map((component: any) => component)
        const signOff =
            logBookConfig?.customisedLogBookComponents?.nodes?.filter(
                (node: any) =>
                    node.componentClass === 'LogBookSignOff_LogBookComponent',
            )
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (
                'LogBookSignOff_LogBookComponent' ===
                defaultLogBookComponents.componentClass
            ) {
                defaultLogBookComponents.items.forEach((defaultField: any) => {
                    if (defaultField.value === fieldName) {
                        if (defaultField.groupTo) {
                            const groupField =
                                signOff[0]?.customisedComponentFields?.nodes.filter(
                                    (field: any) =>
                                        field.fieldName ===
                                        defaultField.groupTo,
                                )
                            if (groupField.length > 0) {
                                return groupField[0].status !== 'Off'
                            }
                        }
                    }
                })
            }
        })
        return false
    }

    const getFieldByName = (name: string) => {
        const logbookFields = getSlallFields()
        const defaultConfig = logbookFields.map((component: any) => component)
        var groupField: any = []
        defaultConfig.forEach((defaultLogBookComponents: any) => {
            if (
                'LogBookSignOff_LogBookComponent' ===
                defaultLogBookComponents.componentClass
            ) {
                defaultLogBookComponents.items.forEach((defaultField: any) => {
                    if (defaultField.value === name) {
                        groupField.push(defaultField)
                    }
                })
            }
        })
        return groupField[0]
    }

    const handleSave = async () => {
        if (!closeLogBookEntry) {
            toast.error('You do not have permission to close the logbook entry')
            return
        }
        if (isEmpty(logBook.master.firstName)) {
            toast.error('Please assign master in order to signoff the logbook')
            return
        }
        toast.loading('Saving Log Entry...')
        // Dismiss unrelevant comments
        const promises = unrelevantComments.map(async (comment: any) => {
            const variables = {
                id: comment.id,
                hideComment: true,
            }
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                await updateSectionMemberComment({
                    variables: {
                        input: variables,
                    },
                })
            }
        })
        await Promise.all(promises)
        const comment = sectionComment
        const variables = {
            id: currentComment?.id ? currentComment?.id : 0,
            fieldName: 'LogBookSignOff',
            comment: comment,
            logBookEntryID: +logentryID,
            logBookEntrySectionID: signOff?.id,
            commentType: 'Section',
        }
        if (!selectedLocation) {
            toast.dismiss()
            toast.error('Please select the end location')
            return
        }
        const offlineID = currentComment?.id
            ? currentComment?.id
            : generateUniqueId()
        if (currentComment) {
            if (offline) {
                await commentModel.save({ ...variables, id: offlineID })
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: { input: variables },
                })
            }
        } else {
            setCurrentComment(comment)
            if (offline) {
                await commentModel.save({ ...variables, id: offlineID })
                loadSectionMemberComments()
                setCurrentComment('')
            } else {
                createSectionMemberComment({
                    variables: { input: variables },
                })
            }
        }
        if (
            fields.filter(
                (field: any) =>
                    field.checked === null &&
                    displayField(field.name) &&
                    isGroupVisible(field.name),
            ).length > 0
        ) {
            toast.dismiss()
            toast.error(
                'Please complete ' +
                    fields.filter(
                        (field: any) =>
                            field.checked === null && displayField(field.name),
                    ).length +
                    ' remaining fields',
            )
            return
        }
        if (signature === false || signature === '') {
            toast.dismiss()
            toast.error('Please sign the log entry')
            return
        }
        const updateVars = {
            id: signOff.id,
            fuelStart: +fuelStart,
            completedTime: time,
        }
        if (offline) {
            const data = await signOffModel.save(updateVars)
            updateSignOff(data)
            if (reloadTimer > 0) {
                setReloadTimer(reloadTimer + 1)
            }
        } else {
            updateLogBookSignOff_LogBookEntrySection({
                variables: {
                    input: updateVars,
                },
            })
        }
        updateFuelLogs()
        logOutCrew()
        const sigVariables = {
            logBookEntrySectionID: signOff?.id,
            memberID: localStorage.getItem('userId'),
            signatureData: signature,
        }
        if (offline) {
            const offlineID = generateUniqueId()
            const data = await signatureModel.save({
                ...sigVariables,
                id: offlineID,
            })
            const signOffdata = await signOffModel.save({
                id: signOff.id,
                sectionSignatureID: +data?.id,
            })
            updateSignOff(signOffdata)
            await vehiclePositionModel.save({
                id: generateUniqueId(),
                vehicleID: +vesselID,
                geoLocationID: selectedLocation.value,
                lat: !isEmpty(currentLocation?.latitude)
                    ? currentLocation?.latitude
                    : 0,
                long: !isEmpty(currentLocation?.longitude)
                    ? currentLocation?.longitude
                    : 0,
            })
            const lb: any = await logBookModel.getById(logentryID)
            const lbData: any = await logBookModel.save({
                ...lb,
                state: 'Locked',
                lockedDate: dayjs().format('YYYY-MM-DD'),
            })
            toast.dismiss()
            toast.success('Log entry completed')
            setIsLocked(true)
            if (reloadTimer > 0) {
                setReloadTimer(reloadTimer + 1)
            }
            router.back()
        } else {
            createLogBookEntrySection_Signature({
                variables: {
                    input: sigVariables,
                },
            })
        }

        if (dismissPrevComment && prevComment) {
            const variables = {
                id: prevComment.id,
                hideComment: true,
            }
            if (offline) {
                await commentModel.save(variables)
                loadSectionMemberComments()
            } else {
                updateSectionMemberComment({
                    variables: {
                        input: variables,
                    },
                })
            }
        }
    }
    const doCreateFuelLog = async (fuelTank: any) => {
        const variables = {
            fuelTankID: fuelTank.id,
            fuelAfter: fuelTank.currentLevel,
            date: dayjs().format('YYYY-MM-DD'),
            logBookEntryID: +logentryID,
        }
        if (offline) {
            const id = generateUniqueId()
            await fuelLogModel.save({
                ...variables,
                id: id,
            })
        } else {
            createFuelLog({
                variables: {
                    input: variables,
                },
            })
        }
    }
    const updateFuelLogs = async () => {
        fuelTankList &&
            (await Promise.all(
                fuelTankList?.map(async (fuelTank: any) => {
                    const variables = {
                        id: fuelTank.id,
                        currentLevel: fuelTank.currentLevel,
                    }
                    if (offline) {
                        await fuelTankModel.save(variables)
                    } else {
                        updateFuelTank({
                            variables: { input: variables },
                        })
                    }
                    logBook?.fuelLogs?.nodes?.find(
                        (log: any) => log.fuelTankID === fuelTank.id,
                    )
                        ? doUpdateFuelLog(fuelTank)
                        : doCreateFuelLog(fuelTank)
                }),
            ))
    }

    const doUpdateFuelLog = async (fuelTank: any) => {
        const variables = {
            id: logBook.fuelLogs.nodes.find(
                (log: any) => log.fuelTankID === fuelTank.id,
            ).id,
            fuelTankID: fuelTank.id,
            fuelAfter: fuelTank.currentLevel,
            date: dayjs().format('YYYY-MM-DD'),
            logBookEntryID: +logentryID,
        }
        if (offline) {
            await fuelLogModel.save(variables)
        } else {
            updateFuelLog({
                variables: {
                    input: variables,
                },
            })
        }
    }
    const [updateFuelLog] = useMutation(UPDATE_FUELLOG, {
        onCompleted: (response) => {
            const data = response.updateFuelLog
        },
        onError: (error) => {
            console.error('Error updating fuel log', error)
        },
    })

    const [createFuelLog] = useMutation(CREATE_FUELLOG, {
        onCompleted: (response) => {
            const data = response.createFuelLog
        },
        onError: (error) => {
            console.error('Error creating fuel log', error)
        },
    })

    const logOutCrew = () => {
        if (crew) {
            crew.filter((member: any) => member.punchOut == null).forEach(
                async (member: any) => {
                    const variables = {
                        id: member.id,
                        punchOut: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    }
                    if (offline) {
                        await lbCrewModel.save(variables)
                    } else {
                        updateCrewMembers_LogBookEntrySection({
                            variables: { input: variables },
                        })
                    }
                },
            )
        }
    }

    const [
        updateCrewMembers_LogBookEntrySection,
        { loading: updateCrewMembers_LogBookEntrySectionLoading },
    ] = useMutation(UpdateCrewMembers_LogBookEntrySection, {
        onCompleted: (data) => {
            console.log('Crew members updated logged out')
        },
        onError: (error) => {
            console.error('updateCrewMembers_LogBookEntrySection', error)
        },
    })

    const doUpdateSignOff = async (variables: any) => {
        const data = await signOffModel.save(variables)
        updateSignOff(data)
        if (reloadTimer > 0) {
            setReloadTimer(reloadTimer + 1)
        }
    }
    // const updateOfflineLogBookEntry = async (variables: any) => {
    //     await logBookModel.save(variables)
    //     toast.dismiss()
    //     toast.success('Log entry completed')
    //     setIsLocked(true)
    //     if (reloadTimer > 0) {
    //         setReloadTimer(reloadTimer + 1)
    //     }
    //     router.back()
    // }
    // const createOfflineVesselPosition = async (variables: any) => {
    //     await vehiclePositionModel.save(variables)
    //     if (reloadTimer > 0) {
    //         setReloadTimer(reloadTimer + 1)
    //     }
    // }
    const [
        createLogBookEntrySection_Signature,
        { loading: createLogBookEntrySection_SignatureLoading },
    ] = useMutation(CreateLogBookEntrySection_Signature, {
        onCompleted: (response) => {
            setReloadTimer(1)
            console.log('Signature saved')
            const data = response.createLogBookEntrySection_Signature
            update_logbook_entry({
                variables: {
                    input: {
                        id: +logentryID,
                        state: 'Locked',
                        lockedDate: dayjs().format('YYYY-MM-DD'),
                    },
                },
            })

            updateLogBookSignOff_LogBookEntrySection({
                variables: {
                    input: {
                        id: signOff.id,
                        sectionSignatureID: +data?.id,
                    },
                },
            })

            createVesselPosition({
                variables: {
                    input: {
                        vehicleID: +vesselID,
                        geoLocationID: selectedLocation.value,
                        lat: !isEmpty(currentLocation?.latitude)
                            ? currentLocation?.latitude
                            : 0,
                        long: !isEmpty(currentLocation?.longitude)
                            ? currentLocation?.longitude
                            : 0,
                    },
                },
            })
        },
        onError: (error) => {
            console.error('Error saving signature', error)
        },
    })

    const [createVesselPosition, { loading: createVesselPositionLoading }] =
        useMutation(CREATE_VESSEL_POSITION, {
            onCompleted: (response) => {
                console.log('Vessel position saved')
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
            },
            onError: (error) => {
                console.error('Error saving vessel position', error)
            },
        })

    const [update_logbook_entry, { loading: updateLogBookEntryLoading }] =
        useMutation(UPDATE_LOGBOOK_ENTRY, {
            onCompleted: (response) => {
                toast.dismiss()
                toast.success('Log entry completed')
                setIsLocked(true)
                if (reloadTimer > 0) {
                    setReloadTimer(reloadTimer + 1)
                }
                router.back()
            },
            onError: (error) => {
                toast.dismiss()
                toast.error('Error completing log entry')
                console.error('Error completing log entry', error)
            },
        })

    const fields = [
        {
            name: 'Review',
            label: 'Logbook entry review',
            value: 'review',
            checked: signOff?.review,
            sortOrder: getSortOrder('Review', logBookConfig),
            handleChange: handleReview,
        },
        {
            name: 'SafetyEquipmentCheck',
            label: 'Safety equipment check',
            value: 'safetyEquipmentCheck',
            checked: signOff?.safetyEquipmentCheck,
            sortOrder: getSortOrder('SafetyEquipmentCheck', logBookConfig),
            handleChange: handleSafetyEquipmentCheck,
        },
        {
            name: 'ForecastAccuracy',
            label: 'Forecast Accuracy',
            value: 'ForecastAccuracy',
            checked: signOff?.forecastAccuracy,
            sortOrder: getSortOrder('ForecastAccuracy', logBookConfig),
            handleChange: handleForecastAccuracy,
        },
        {
            name: 'AIS',
            label: 'Automatic Identification System (AIS)',
            value: 'ais',
            checked: signOff?.ais,
            sortOrder: getSortOrder('AIS', logBookConfig),
            handleChange: handleAIS,
        },
        {
            name: 'NavigationLightsAndShapes',
            label: 'Navigation lights and shapes',
            value: 'navigationLightsAndShapes',
            checked: signOff?.navigationLightsAndShapes,
            sortOrder: getSortOrder('NavigationLightsAndShapes', logBookConfig),
            handleChange: handleNavigationLightsAndShapes,
        },
        {
            name: 'ElectronicNavigationalAids',
            label: 'Electronic navigational aids',
            value: 'electronicNavigationalAids',
            checked: signOff?.electronicNavigationalAids,
            sortOrder: getSortOrder(
                'ElectronicNavigationalAids',
                logBookConfig,
            ),
            handleChange: handleElectronicNavigationalAids,
        },
        {
            name: 'MainEngines',
            label: 'Main engines',
            value: 'mainEngines',
            checked: signOff?.mainEngines,
            sortOrder: getSortOrder('MainEngines', logBookConfig),
            handleChange: handleMainEngines,
        },
        {
            name: 'AuxiliarySystems',
            label: 'Auxiliary systems',
            value: 'auxiliarySystems',
            checked: signOff?.auxiliarySystems,
            sortOrder: getSortOrder('AuxiliarySystems', logBookConfig),
            handleChange: handleAuxiliarySystems,
        },
        {
            name: 'FuelAndOil',
            label: 'Fuel and oil systems',
            value: 'fuelAndOil',
            checked: signOff?.fuelAndOil,
            sortOrder: getSortOrder('FuelAndOil', logBookConfig),
            handleChange: handleFuelAndOil,
        },
        {
            name: 'BilgeSystems',
            label: 'Bilge Systems',
            value: 'bilgeSystems',
            checked: signOff?.bilgeSystems,
            sortOrder: getSortOrder('BilgeSystems', logBookConfig),
            handleChange: handleBilgeSystems,
        },
        {
            name: 'Power',
            label: 'Main and emergency power',
            value: 'power',
            checked: signOff?.power,
            sortOrder: getSortOrder('Power', logBookConfig),
            handleChange: handlePower,
        },
        {
            name: 'BatteryMaintenance',
            label: 'Battery maintenance',
            value: 'batteryMaintenance',
            checked: signOff?.batteryMaintenance,
            sortOrder: getSortOrder('BatteryMaintenance', logBookConfig),
            handleChange: handleBatteryMaintenance,
        },
        {
            name: 'CircuitInspections',
            label: 'Circuit inspections',
            value: 'circuitInspections',
            checked: signOff?.circuitInspections,
            sortOrder: getSortOrder('CircuitInspections', logBookConfig),
            handleChange: handleCircuitInspections,
        },
        {
            name: 'MooringAndAnchoring',
            label: 'Mooring and anchoring',
            value: 'mooringAndAnchoring',
            checked: signOff?.mooringAndAnchoring,
            sortOrder: getSortOrder('MooringAndAnchoring', logBookConfig),
            handleChange: handleMooringAndAnchoring,
        },
        {
            name: 'CargoAndAccessEquipment',
            label: 'Cargo and access equipment',
            value: 'cargoAndAccessEquipment',
            checked: signOff?.cargoAndAccessEquipment,
            sortOrder: getSortOrder('CargoAndAccessEquipment', logBookConfig),
            handleChange: handleCargoAndAccessEquipment,
        },
        {
            name: 'HatchesAndWatertightDoors',
            label: 'Hatches and watertight doors',
            value: 'hatchesAndWatertightDoors',
            checked: signOff?.hatchesAndWatertightDoors,
            sortOrder: getSortOrder('HatchesAndWatertightDoors', logBookConfig),
            handleChange: handleHatchesAndWatertightDoors,
        },
        {
            name: 'GalleyAppliances',
            label: 'Galley appliances',
            value: 'galleyAppliances',
            checked: signOff?.galleyAppliances,
            sortOrder: getSortOrder('GalleyAppliances', logBookConfig),
            handleChange: handleGalleyAppliances,
        },
        {
            name: 'WasteManagement',
            label: 'Waste management',
            value: 'wasteManagement',
            checked: signOff?.wasteManagement,
            sortOrder: getSortOrder('WasteManagement', logBookConfig),
            handleChange: handleWasteManagement,
        },
        {
            name: 'VentilationAndAirConditioning',
            label: 'Ventilation and air conditioning',
            value: 'ventilationAndAirConditioning',
            checked: signOff?.ventilationAndAirConditioning,
            sortOrder: getSortOrder(
                'VentilationAndAirConditioning',
                logBookConfig,
            ),
            handleChange: handleVentilationAndAirConditioning,
        },
        {
            name: 'EmergencyReadiness',
            label: 'Emergency readiness',
            value: 'emergencyReadiness',
            checked: signOff?.emergencyReadiness,
            sortOrder: getSortOrder('EmergencyReadiness', logBookConfig),
            handleChange: handleEmergencyReadiness,
        },
        {
            name: 'EnvironmentalCompliance',
            label: 'Environmental compliance',
            value: 'environmentalCompliance',
            checked: signOff?.environmentalCompliance,
            sortOrder: getSortOrder('EnvironmentalCompliance', logBookConfig),
            handleChange: handleEnvironmentalCompliance,
        },
    ]

    const handleDismissPrevComment = (value: boolean) => {
        setDismissPrevComment(value)
    }

    useEffect(() => {
        if (reloadTimer > 4) {
            router.back()
        }
    }, [reloadTimer])

    useEffect(() => {
        if (prevComments) setPrevComment(prevComments[0])
    }, [prevComments])

    const handleTimeChange = (time: any) => {
        setTime(dayjs(time).format('HH:mm'))
    }

    const getEngines = async (engineIds: any) => {
        if (offline) {
            const engines = await engineModel.getByIds(engineIds)
            const data = engines.filter((engine: any) => {
                return engine.engineStartStops.nodes.some(
                    (stop: any) =>
                        +stop.logBookEntrySection.logBookEntryID ===
                        +logentryID,
                )
            })
            if (data) {
                setEngineList(data)
            }
        } else {
            await queryGetEngines({
                variables: {
                    id: engineIds,
                    filter: {
                        logBookEntrySection: {
                            logBookEntryID: { eq: +logentryID },
                        },
                    },
                },
            })
        }
    }

    const [queryGetEngines] = useLazyQuery(GET_ENGINES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readEngines.nodes
            setEngineList(data)
        },
        onError: (error: any) => {
            console.error('getEngines error', error)
        },
    })

    useEffect(() => {
        if (vessel) {
            const engineIds = vessel?.parentComponent_Components?.nodes
                .filter(
                    (item: any) =>
                        item.basicComponent.componentCategory === 'Engine',
                )
                .map((item: any) => {
                    return item.basicComponent.id
                })
            engineIds?.length > 0 && getEngines(engineIds)
        }
    }, [vessel])

    const doUpdateEngineHours = async (e: any, engine: any) => {
        const variables = {
            id: engine.id,
            currentHours: +e.target.value,
        }
        if (offline) {
            await engineModel.save(variables)
        } else {
            updateEngineHours({
                variables: {
                    input: variables,
                },
            })
        }
        setEngineList(
            engineList.map((item: any) => {
                if (item.id === engine.id) {
                    return {
                        ...item,
                        currentHours: +e.target.value,
                    }
                }
                return item
            }),
        )
    }
    const [updateEngineHours] = useMutation(UPDATE_ENGINE, {
        onCompleted: (response) => {
            console.log('Engine hours updated')
        },
        onError: (error) => {
            console.error('Error updating engine hours', error)
        },
    })

    const handleUpdateFuelTank = (tank: any, value: any) => {
        if (tank.capacity < +value) {
            toast.error(
                'Fuel level cannot be higher than tank capacity of ' +
                    tank.capacity,
            )
            return
        }
        setFuelTankList(
            fuelTankList.map((item: any) => {
                if (item.id === tank.id) {
                    item.currentLevel = +value
                    return item
                }
                return item
            }),
        )
    }

    const [updateFuelTank] = useMutation(UpdateFuelTank, {
        onCompleted: (response) => {
            const data = response.updateFuelTank
        },
        onError: (error) => {
            console.error('Error updating fuel tank', error)
        },
    })

    const getEngineRunHours = (engine: any) => {
        const initialHours = logBook?.engineStartStop?.nodes?.filter(
            (item: any) => item.engineID === engine.id,
        )?.[0]?.hoursStart
        return (engine.currentHours - initialHours).toFixed(1)
    }

    return (
        <div>
            <div className={`${isLocked ? 'pointer-events-none' : ''} px-2`}>
                {logBookConfig && (
                    <div key={logBookConfig.id}>
                        {getFilteredFields(fields, false).map(
                            (field: any, index: number) => (
                                <DailyCheckField
                                    key={field.name}
                                    className="!my-2"
                                    displayField={displayField(field.name)}
                                    displayDescription={displayDescription(
                                        field.name,
                                    )}
                                    setDescriptionPanelContent={
                                        setDescriptionPanelContent
                                    }
                                    setOpenDescriptionPanel={
                                        setOpenDescriptionPanel
                                    }
                                    setDescriptionPanelHeading={
                                        setDescriptionPanelHeading
                                    }
                                    displayLabel={getFieldLabel(field.name)}
                                    inputId={field.value}
                                    handleNoChange={() =>
                                        field.handleChange(false)
                                    }
                                    defaultNoChecked={
                                        field.checked === 'Not_Ok'
                                    }
                                    handleYesChange={() =>
                                        field.handleChange(true)
                                    }
                                    defaultYesChecked={field.checked === 'Ok'}
                                    commentAction={() =>
                                        showCommentPopup(
                                            getComment(field.name),
                                            composeField(field.name),
                                        )
                                    }
                                    comment={getComment(field.name)?.comment}
                                />
                            ),
                        )}
                        {getFilteredFields(fields)
                            ?.filter((groupField: any) =>
                                displayField(groupField.name),
                            )
                            ?.map((groupField: any) => (
                                <div key={groupField.name}>
                                    <hr className="my-4" />
                                    <div>
                                        <div className="flex flex-col">
                                            <div className="uppercase font-semibold text-left">
                                                {groupField.field?.title
                                                    ? groupField.field.title
                                                    : groupField.field.label}
                                                {displayDescription(
                                                    groupField.name,
                                                ) && (
                                                    <SeaLogsButton
                                                        icon="alert"
                                                        className="w-6 h-6 sup -mt-2 ml-0.5"
                                                        action={() => {
                                                            setDescriptionPanelContent(
                                                                displayDescription(
                                                                    groupField.name,
                                                                ),
                                                            )
                                                            setOpenDescriptionPanel(
                                                                true,
                                                            )
                                                            setDescriptionPanelHeading(
                                                                groupField.name,
                                                            )
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className={`!my-2`}>
                                                {groupField?.items?.map(
                                                    (
                                                        field: any,
                                                        index: number,
                                                    ) => (
                                                        <DailyCheckField
                                                            className={`lg:!grid-cols-2`}
                                                            innerWrapperClassName={`lg:!col-span-1`}
                                                            key={field.name}
                                                            displayField={displayField(
                                                                field.name,
                                                            )}
                                                            displayDescription={displayDescription(
                                                                field.name,
                                                            )}
                                                            setDescriptionPanelContent={
                                                                setDescriptionPanelContent
                                                            }
                                                            setOpenDescriptionPanel={
                                                                setOpenDescriptionPanel
                                                            }
                                                            setDescriptionPanelHeading={
                                                                setDescriptionPanelHeading
                                                            }
                                                            displayLabel={getFieldLabel(
                                                                field.name,
                                                            )}
                                                            inputId={
                                                                field.value
                                                            }
                                                            handleNoChange={() =>
                                                                field.handleChange(
                                                                    false,
                                                                )
                                                            }
                                                            defaultNoChecked={
                                                                field.checked ===
                                                                'Not_Ok'
                                                            }
                                                            handleYesChange={() =>
                                                                field.handleChange(
                                                                    true,
                                                                )
                                                            }
                                                            defaultYesChecked={
                                                                field.checked ===
                                                                'Ok'
                                                            }
                                                            commentAction={() =>
                                                                showCommentPopup(
                                                                    getComment(
                                                                        field.name,
                                                                    ),
                                                                    composeField(
                                                                        field.name,
                                                                    ),
                                                                )
                                                            }
                                                            comment={
                                                                getComment(
                                                                    field.name,
                                                                )?.comment
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
                <hr className="my-4" />
                {displayField('FuelStart') && (
                    <div className="flex flex-col">
                        <div className="text-sm font-semibold uppercase text-left">
                            Fuel end
                            {displayDescription('FuelStart') &&
                                displayDescriptionIcon(
                                    displayDescription('FuelStart'),
                                )}
                        </div>
                        <div className="flex flex-col">
                            {fuelTankList &&
                                fuelTankList.map((tank: any) => (
                                    <div
                                        key={tank.id}
                                        className="my-2 flex flex-row flex-nowrap items-center">
                                        <label
                                            className={`${classes.label} flex flex-row items-center`}>
                                            <SealogsFuelIcon className="w-6 h-6 mr-3 mb-0.5 text-sldarkblue-950" />
                                            {tank.title}
                                        </label>
                                        <input
                                            type="number"
                                            // id="fuel_start"
                                            className={`${classes.input} !w-auto min-w-48`}
                                            placeholder="Fuel end"
                                            value={tank.currentLevel}
                                            min={0}
                                            max={tank.capacity}
                                            onChange={(e: any) =>
                                                handleUpdateFuelTank(
                                                    tank,
                                                    e.target.value,
                                                )
                                            }
                                            // value={fuelStart}
                                            // onChange={(e: any) =>
                                            //     setFuelStart(e.target.value)
                                            // }
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
                {displayField('EngineHours') && engineList?.length > 0 && (
                    <div className="flex flex-col my-4">
                        <div className="text-sm font-semibold uppercase text-left">
                            Engine hours at shutdown
                            {displayDescription('EngineHours') &&
                                displayDescriptionIcon(
                                    displayDescription('EngineHours'),
                                )}
                        </div>
                        <div className="flex flex-col">
                            {engineList?.map((engine: any) => (
                                <div
                                    key={engine.id}
                                    className="flex flex-row flex-nowrap items-center">
                                    <label className={classes.label}>
                                        {engine.title}
                                    </label>
                                    <input
                                        id={`engine-hours-${engine.id}`}
                                        type="number"
                                        defaultValue={engine.currentHours}
                                        name="start"
                                        placeholder="Engine Hours"
                                        className={`${classes.input} !w-auto min-w-48`}
                                        disabled={locked}
                                        onBlur={(e: any) => {
                                            doUpdateEngineHours(e, engine)
                                        }}
                                    />
                                    {displayField('EngineHoursEnd') && (
                                        <div className="ml-2 flex items-center">
                                            <span className="text-2xs uppercase font-inter">
                                                Run hours:
                                            </span>
                                            <span className="text-slblue-1000 border rounded-full flex justify-center items-center w-5 h-5 md:w-9 md:h-9 p-2 bg-slblue-100 border-slblue-1000 ml-2">
                                                {getEngineRunHours(engine)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <hr className="my-4" />
                <div className="flex flex-col md:flex-row items-start md:items-center my-4 justify-start">
                    <label className={classes.label}>Time trip completed</label>
                    <div className="flex items-center justify-between gap-1">
                        <TimeField
                            time={time}
                            handleTimeChange={handleTimeChange}
                            timeID="complete-time"
                            fieldName="Time of completion"
                            buttonLabel="Complete now"
                        />
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row items-start lg:items-center my-4">
                    <label className={classes.label}>End Location</label>
                    <div className="flex items-center justify-between">
                        {geoLocations && (
                            <LocationField
                                offline={offline}
                                // geoLocations={geoLocation}
                                currentTrip={{}}
                                updateTripReport={{}}
                                tripReport={{}}
                                setCurrentLocation={setCurrentLocation}
                                handleLocationChange={setSelectedLocation}
                                currentLocation={currentLocation}
                                currentEvent={{
                                    geoLocationID: selectedLocation?.value,
                                    lat: currentLocation?.latitude,
                                    long: currentLocation?.longitude,
                                }}
                            />
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 my-3 md:grid-cols-3 lg:grid-cols-3 items-start dark:text-white">
                    <label className="md:block md:pr-4 pr-0 pb-1 md:pb-0">
                        &nbsp;
                    </label>
                    <div className="flex flex-col grid-cols-1 md:col-span-2 lg:col-span-2">
                        <OpenPreviousLogbookComments
                            prevComments={prevComments}
                            onDismiss={(coms: any) => {
                                onUpdatePrevComments(coms)
                            }}
                            onDismissAll={() => onUpdatePrevComments([])}
                            enableRelevantQuestion={true}
                            onRelevantQuestionChange={(rc: any) => {
                                setUnrelevantComments(
                                    rc.filter((c: any) => c.value === 'no'),
                                )
                            }}
                        />
                    </div>
                </div>
                <div className="my-4 text-left">
                    <label className={`${classes.label} ml-2 `}>
                        Shutdown log:
                    </label>
                    <div className="flex items-center justify-between w-full">
                        <textarea
                            id={`section_comment`}
                            rows={4}
                            className={classes.textarea}
                            placeholder="Record any extra-ordinary actions taken during the shutdown in this logbook entry, including times, dates, and personnel involved. These comments will appear in the next logbook entry."
                            defaultValue={
                                getComment('LogBookSignOff', 'Section')?.comment
                            }
                            onChange={(e: any) => {
                                setSectionComment(e.target.value)
                            }}></textarea>
                    </div>
                </div>
                <div className="my-4 flex flex-col w-full">
                    <label
                        className={`${classes.label} ml-2 block font-semibold`}>
                        Logbook completion:
                    </label>
                    <p className={classes.helpText}>
                        If the above the checklist is fully completed please
                        sign below as the responsible officer.
                    </p>
                    <SignaturePad
                        signature={isLocked ? signOff.sectionSignature : null}
                        onSignatureChanged={(sign: String) => {
                            setSignature(sign)
                        }}
                    />
                </div>
            </div>
            <FooterWrapper>
                {!isLocked && (
                    <SeaLogsButton
                        text="Cancel"
                        type="text"
                        action={() => router.back()}
                        isDisabled={
                            createSectionMemberCommentLoading ||
                            updateSectionMemberCommentLoading ||
                            updateLogBookSignOff_LogBookEntrySectionLoading ||
                            createLogBookSignOff_LogBookEntrySectionLoading ||
                            updateCrewMembers_LogBookEntrySectionLoading ||
                            createVesselPositionLoading ||
                            createLogBookEntrySection_SignatureLoading ||
                            updateLogBookEntryLoading
                        }
                    />
                )}
                {!imCrew && !isLocked && (
                    <SeaLogsButton
                        text="Complete"
                        type="primary"
                        color="sky"
                        icon="check"
                        action={handleSave}
                        isDisabled={
                            createSectionMemberCommentLoading ||
                            updateSectionMemberCommentLoading ||
                            updateLogBookSignOff_LogBookEntrySectionLoading ||
                            createLogBookSignOff_LogBookEntrySectionLoading ||
                            updateCrewMembers_LogBookEntrySectionLoading ||
                            createVesselPositionLoading ||
                            createLogBookEntrySection_SignatureLoading ||
                            updateLogBookEntryLoading
                        }
                    />
                )}
            </FooterWrapper>
            <AlertDialog
                openDialog={openCommentAlert}
                setOpenDialog={setOpenCommentAlert}
                handleCreate={handleSaveComment}
                actionText="Save">
                <div
                    className={`flex flex-col ${locked ? 'pointer-events-none' : ''}`}>
                    <label className="text-sm">Comment</label>
                    <textarea
                        id="comment"
                        rows={4}
                        className="block p-2.5 w-full mt-4 text-sm text-gray-900 bg-slblue-100 rounded-lg border border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:bg-slblue-700 dark:border-white dark:placeholder-slblue-400 dark:text-white dark:focus:ring-slblue-500 dark:focus:border-slblue-500"
                        placeholder="Comment"
                        defaultValue={
                            currentComment ? currentComment.comment : ''
                        }></textarea>
                </div>
            </AlertDialog>
            <SlidingPanel type={'left'} isOpen={openDescriptionPanel} size={40}>
                <div className="h-[calc(100vh_-_1rem)] pt-4">
                    {openDescriptionPanel && (
                        <div className="bg-sllightblue-50 h-full flex flex-col justify-between rounded-r-lg">
                            <div className="text-xl dark:text-white text-white items-center flex justify-between font-medium py-4 px-6 rounded-tr-lg bg-slblue-1000">
                                <Heading
                                    slot="title"
                                    className="text-sm font-semibold leading-6 my-2 text-white dark:text-slblue-200">
                                    Field -{' '}
                                    <span className="font-thin">
                                        {descriptionPanelHeading}
                                    </span>
                                </Heading>
                                <XMarkIcon
                                    className="w-6 h-6"
                                    onClick={() => {
                                        setOpenDescriptionPanel(false)
                                        setDescriptionPanelContent('')
                                        setDescriptionPanelHeading('')
                                    }}
                                />
                            </div>
                            <div className="text-xl p-4 flex-grow overflow-scroll">
                                <div
                                    className="text-xs leading-loose font-light"
                                    dangerouslySetInnerHTML={{
                                        __html: descriptionPanelContent,
                                    }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </SlidingPanel>
            <Toaster position="top-right" />
        </div>
    )
}

function SignaturePad({
    signature,
    onSignatureChanged,
}: {
    signature: any
    onSignatureChanged: (sign: String) => void
}) {
    const [signPad, setSignPad] = useState<SignaturePad | null>(null)
    const [loaded, setLoaded] = useState<boolean>(false)

    const handleSignatureChanged = (e: any) => {
        if (signPad?.toDataURL()) onSignatureChanged(signPad?.toDataURL())
    }
    const handleClear = () => {
        if (signPad) {
            signPad.clear()
            onSignatureChanged('')
        }
    }
    useEffect(() => {
        setLoaded(false)
        if (signPad) {
            signPad.clear()
        }
    }, [signature])
    {
        signature?.signatureData &&
            signPad &&
            !loaded &&
            (signPad.fromDataURL(signature.signatureData, {
                width: 384,
                height: 200,
            }),
            setLoaded(true))
    }
    return (
        <div className="flex flex-col items-right gap-3 md:mb-0 mb-8">
            <SignatureCanvas
                ref={(ref: any) => {
                    setSignPad(ref)
                }}
                penColor={`blue`}
                canvasProps={{
                    className:
                        'sigCanvas border border-slblue-200 bg-white rounded-lg w-full h-48',
                }}
                onEnd={handleSignatureChanged}
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"></div>
                <Button
                    onPress={handleClear}
                    className="peer flex justify-between text-sm">
                    Clear
                </Button>
            </div>
        </div>
    )
}
