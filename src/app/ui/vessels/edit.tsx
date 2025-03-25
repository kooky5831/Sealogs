'use client'
import {
    Heading,
    Button,
    ModalOverlay,
    DialogTrigger,
    Modal,
    Dialog,
} from 'react-aria-components'
import { useEffect, useState } from 'react'
import {
    FooterWrapper,
    SeaLogsButton,
    AlertDialog,
} from '@/app/components/Components'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useRouter } from 'next/navigation'
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers'
import {
    getInventoryList,
    getSeaLogsMembersList,
    getInventoryByVesselId,
    getInventoryCategory,
    getDepartmentList,
} from '@/app/lib/actions'
import Select from 'react-select'
import { CountriesList, vesselIconList } from '@/app/lib/data'
import { useMutation, useLazyQuery } from '@apollo/client'
import {
    UPDATE_VESSEL,
    UPDATE_ENGINE,
    CREATE_ENGINE,
    CREATE_PARENT_COMPONENT,
    CREATE_FUELTANK,
    UPDATE_FUELTANK,
    CREATE_INVENTORY,
    CREATE_USER,
    UPDATE_INVENTORY,
    CREATE_WATERTANK,
    UPDATE_WATERTANK,
    CREATE_SEWAGESYSTEM,
    UPDATE_SEWAGESYSTEM,
    CREATE_VESSEL_SPECIFICS,
    UPDATE_VESSEL_SPECIFICS,
    CREATE_INVENTORY_CATEGORY,
    CREATE_VESSEL,
} from '@/app/lib/graphQL/mutation'
import {
    GET_ENGINES,
    GET_FUELTANKS,
    VESSEL_INFO,
    GET_SEWAGESYSTEMS,
    GET_WATERTANKS,
    GET_FILES,
} from '@/app/lib/graphQL/query'
import dayjs from 'dayjs'
import { SealogsVesselsIcon } from '../../lib/icons/SealogsVesselsIcon'
import DepartmentMultiSelectDropdown from '../department/multiselect-dropdown'
import FileUpload from '../file-upload'
import { classes } from '@/app/components/GlobalClasses'
import {
    getPermissions,
    hasPermission,
    isAdmin,
} from '@/app/helpers/userHelper'
import Loading from '@/app/loading'

export default function EditVessel({ vesselId }: { vesselId: number }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [createVesselID, setCreateVesselID] = useState<number>(vesselId)
    const [vessel, setVessel] = useState({} as any)
    const [inventoryList, setInventoryList] = useState<any>()
    const [vesselInventories, setVesselInventory] = useState<any>([])
    const [inventoryCategories, setInventoryCategories] = useState<any>()
    const [engineList, setEngineList] = useState<any>()
    const [selectedEngine, setSelectedEngine] = useState<number>(0)
    const [fuelTankList, setFuelTankList] = useState<any>()
    const [selectedFuelTank, setSelectedFuelTank] = useState<number>(0)
    const [waterTankList, setWaterTankList] = useState<any>()
    const [selectedWaterTank, setSelectedWaterTank] = useState<number>(0)
    const [sewageSystemList, setSewageSystemList] = useState<any>()
    const [selectedSewageSystem, setSelectedSewageSystem] = useState<number>(0)
    const [membersList, setMembersList] = useState<any>()
    const [vesselMembers, setVesselMembers] = useState<any>()
    const [openEngineDialog, setOpenEngineDialog] = useState(false)
    const [openFuelTankDialog, setOpenFuelTankDialog] = useState(false)
    const [openCreateInventoryDialog, setOpenCreateInventoryDialog] =
        useState(false)
    const [openCreateMemberDialog, setOpenCreateMemberDialog] = useState(false)
    const [openWaterTankDialog, setOpenWaterTankDialog] = useState(false)
    const [openSewageSystemDialog, setOpenSewageSystemDialog] = useState(false)
    const [currentData, setCurrentData] = useState<any>({})
    const [displayOnDashboard, setDisplayOnDashboard] = useState<boolean>(false)
    const [selectedInventoryCategory, setSelectedInventoryCategory] =
        useState<any>()
    const [error, setError] = useState<any>(false)
    const [dateOfBuild, setDateOfBuild] = useState<any>()

    const [imageURI, setImageURI] = useState<any>()
    const [uploadImagedUrl, setUploadImagedUrl] = useState<any>('')
    const [uploadImagedID, setUploadImagedID] = useState<any>(null)
    const [Files, setFiles] = useState<any>([])
    const [imageLoader, setImageLoader] = useState(false)
    const [openVesselImageDialog, setOpenVesselImageDialog] = useState(false)
    const [vesselIcon, setVesselIcon] = useState<any>(false)
    const [vesselIconMode, setVesselIconMode] = useState<any>(false)
    const [departmentList, setDepartmentList] = useState<any>(false)
    const [vesselPhoto, setVesselPhoto] = useState<any>([])

    const [
        openCreateInventoryCategoryDialog,
        setOpenCreateInventoryCategoryDialog,
    ] = useState<boolean>(false)
    const [openArchiveVesselDialog, setOpenArchiveVesselDialog] =
        useState(false)
    const [selectedDepartments, setSelectedDepartments] = useState<any>([])
    const handleSetInventoryCategories = (data: any) => {
        const categoriesList = [
            {
                label: ' ---- Create Category ---- ',
                value: 'newCategory',
            },
            ...data
                ?.filter((category: any) => category.name !== null)
                .map((category: any) => ({
                    label: category.name,
                    value: category.id,
                })),
        ]
        setInventoryCategories(categoriesList)
    }

    getInventoryCategory(handleSetInventoryCategories)

    getDepartmentList(setDepartmentList)

    const [queryCreateVessel, { data: createVesselData }] = useMutation(
        CREATE_VESSEL,
        {
            fetchPolicy: 'no-cache',
            onCompleted: (response: any) => {
                console.log('createVessel response', response)
            },
            onError: (error: any) => {
                console.error('createVessel error', error)
            },
        },
    )

    const createNewVessel = async () => {
        let newVesselID = createVesselID
        if (createVesselID === 0) {
            const Title =
                (document.getElementById('vessel-title') as HTMLInputElement)
                    .value || 'New Vessel'
            const AuthNo = (
                document.getElementById('vessel-authNo') as HTMLInputElement
            ).value
            const MMSI = (
                document.getElementById('vessel-mmsi') as HTMLInputElement
            ).value
            const TransitId = (
                document.getElementById('vessel-transitId') as HTMLInputElement
            ).value
            const Country = currentData['countryofoperation']
                ? currentData['countryofoperation']
                : vessel?.countryOfOperation
            let vesselType = currentData['vesseltype']
                ? currentData['vesseltype'] || defaultVesselType.value
                : vessel?.vesselType || defaultVesselType.value
            vesselType = vesselType.replaceAll('_', ' ') // replace underscores with spaces for vessel type before saving
            const vesselDescription = (
                document.getElementById(
                    'vessel-description',
                ) as HTMLInputElement
            ).value
            const minCrew = (
                document.getElementById('vessel-minCrew') as HTMLInputElement
            ).value
            const maxPax = (
                document.getElementById('vessel-maxPax') as HTMLInputElement
            ).value
            const maxPOB = (
                document.getElementById('vessel-maxPOB') as HTMLInputElement
            ).value
            const callSign = (
                document.getElementById('vessel-callSign') as HTMLInputElement
            ).value
            const { data } = await queryCreateVessel({
                variables: {
                    input: {
                        mmsi: MMSI,
                        registration: AuthNo,
                        title: Title,
                        countryOfOperation: Country,
                        transitID: TransitId,
                        showOnDashboard: displayOnDashboard,
                        vesselType: vesselType,
                        vesselTypeDescription: vesselDescription,
                        callSign: callSign,
                        minCrew: +minCrew,
                        maxPax: +maxPax,
                        maxPOB: +maxPOB,
                        vesselSpecificsID: 0,
                        seaLogsMembers: vesselMembers
                            ?.map((member: any) => member.value)
                            .join(','),
                    },
                },
            })
            newVesselID = +data.createVessel.id
            setCreateVesselID(newVesselID)
        }
        return newVesselID
    }

    const [queryGetEngines] = useLazyQuery(GET_ENGINES, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readEngines.nodes
            setEngineList(data)
        },
        onError: (error: any) => {
            console.error('getEngines error', error)
        },
    })

    const getEngines = async (engineIds: any) => {
        await queryGetEngines({
            variables: {
                id: engineIds,
            },
        })
    }

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
        await queryGetFuelTanks({
            variables: {
                id: fuelTankIds,
            },
        })
    }

    const [queryGetWaterTanks] = useLazyQuery(GET_WATERTANKS, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readWaterTanks.nodes
            setWaterTankList(data)
        },
        onError: (error: any) => {
            console.error('getWaterTanks error', error)
        },
    })

    const getWaterTanks = async (waterTankIds: any) => {
        await queryGetWaterTanks({
            variables: {
                id: waterTankIds,
            },
        })
    }

    const [queryGetSewageSystems] = useLazyQuery(GET_SEWAGESYSTEMS, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.readSewageSystems.nodes
            setSewageSystemList(data)
        },
        onError: (error: any) => {
            console.error('getSewageSystems error', error)
        },
    })

    const getSewageSystems = async (sewageSystemIds: any) => {
        await queryGetSewageSystems({
            variables: {
                id: sewageSystemIds,
            },
        })
    }

    const handleSetVessel = (data: any) => {
        setVessel(data)
        const engineIds = data?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'Engine',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        const fuelTankIds = data?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'FuelTank',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        const waterTankIds = data?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'WaterTank',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        const sewageSystemIds = data?.parentComponent_Components?.nodes
            .filter(
                (item: any) =>
                    item.basicComponent.componentCategory === 'SewageSystem',
            )
            .map((item: any) => {
                return item.basicComponent.id
            })
        engineIds.length > 0 && getEngines(engineIds)
        fuelTankIds.length > 0 && getFuelTanks(fuelTankIds)
        waterTankIds.length > 0 && getWaterTanks(waterTankIds)
        sewageSystemIds.length > 0 && getSewageSystems(sewageSystemIds)
        setVesselMembers(
            data.seaLogsMembers.nodes.map((member: any) => {
                return {
                    label: member?.firstName + ' ' + member.surname,
                    value: member.id,
                }
            }),
        )
        setCurrentData({
            countryofoperation: data.countryOfOperation,
            vesseltype: data.vesselType || defaultVesselType.value,
            engine: data?.parentComponent_Components?.nodes.find(
                (item: any) =>
                    item.basicComponent.componentCategory === 'Engine',
            )?.basicComponent,
            fuelTank: data?.parentComponent_Components?.nodes.find(
                (item: any) =>
                    item.basicComponent.componentCategory === 'FuelTank',
            )?.basicComponent,
            waterTank: data?.parentComponent_Components?.nodes.find(
                (item: any) =>
                    item.basicComponent.componentCategory === 'WaterTank',
            )?.basicComponent,
            sewageSystem: data?.parentComponent_Components?.nodes.find(
                (item: any) =>
                    item.basicComponent.componentCategory === 'SewageSystem',
            )?.basicComponent,
        })
        setDateOfBuild(
            data?.vesselSpecifics?.dateOfBuild
                ? dayjs(data?.vesselSpecifics?.dateOfBuild).format('DD/MM/YYYY')
                : null,
        )
        setDisplayOnDashboard(data.showOnDashboard)
        setSelectedDepartments(data.departments?.nodes.map((d: any) => d.id))
        if (data.bannerImageID) {
            getFileDetails({
                variables: {
                    id: [data.bannerImageID],
                },
            })
        }
        data?.icon && setVesselIcon(data.icon.replaceAll('-', ' '))
        data?.iconMode && setVesselIconMode(data.iconMode)
        data?.photoID > 0 && loadVesselPhoto(data.photoID)
        data?.bannerImageID > 0 && setUploadImagedID(data.bannerImageID)
    }

    const loadVesselPhoto = async (id: string) => {
        await queryFiles({
            variables: {
                id: [id],
            },
        })
    }

    const [queryFiles] = useLazyQuery(GET_FILES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readFiles.nodes[0]
            setVesselPhoto([data])
        },
        onError: (error: any) => {
            console.error('queryFilesEntry error', error)
        },
    })

    const [queryVesselInfo] = useLazyQuery(VESSEL_INFO, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response: any) => {
            const data = response.readOneVessel
            if (data) {
                handleSetVessel(data)
            }
        },
        onError: (error: any) => {
            console.error('queryVesselInfo error', error)
        },
    })

    const loadVesselInfo = async () => {
        await queryVesselInfo({
            variables: {
                id: +createVesselID,
            },
        })
    }

    const [queryCreateParentComponent] = useMutation(CREATE_PARENT_COMPONENT, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.createParentComponent_Component
            if (data.id > 0) {
                loadVesselInfo()
            }
        },
        onError: (error: any) => {
            console.error('createParentComponent error', error)
        },
    })

    const createParentComponent = async (engineId: number) => {
        const vID = await createNewVessel()
        await queryCreateParentComponent({
            variables: {
                input: {
                    parentComponentID: vID,
                    basicComponentID: engineId,
                },
            },
        })
    }
    const handlesSetInventoryList = (data: any) => {
        // Show only inventory not assigned to any vessel.
        const filteredData = data.filter((item: any) => item.vesselID <= 0)
        const appendData = [
            { label: '--- Create Inventory ---', value: 'newInventory' },
            ...filteredData
                .filter(
                    (item: any) => item.archived == false && item.title != null,
                )
                .map((item: any) => {
                    return { label: item.title, value: item.id }
                }),
        ]
        setInventoryList(appendData)
    }

    getInventoryList(handlesSetInventoryList)

    const handlesSetMembersList = (data: any) => {
        const departmentList = vessel.departments?.nodes.flatMap(
            (department: any) => department.id,
        )
        const appendData = [
            { label: '--- Create Crew Member ---', value: 'newCrewMember' },
            ...data
                .filter(
                    (item: any) =>
                        item.archived == false &&
                        item.firstName !== null &&
                        (item.departments.nodes.length == 0 ||
                            item.departments.nodes.some((d: any) =>
                                departmentList.includes(d.id),
                            )),
                )
                .map((item: any) => {
                    return {
                        label: item.firstName + ' ' + item?.surname,
                        value: item.id,
                    }
                }),
        ]
        setMembersList(appendData)
    }
    getSeaLogsMembersList(handlesSetMembersList)

    // Uncomment the filter to only show non-archived inventory items.
    const handleSetVesselInventory = (data: any) => {
        if (vesselId > 0) {
            const appendData = data
                // .filter((item: any) => item.archived == false)
                .map((item: any) => {
                    return { label: item.title, value: item.id }
                })
            setVesselInventory(appendData)
        }
    }

    getInventoryByVesselId(createVesselID, handleSetVesselInventory)

    const [queryUpdateEngine] = useMutation(UPDATE_ENGINE, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.updateEngine
            if (data.id > 0) {
                setSelectedEngine(0)
                setOpenEngineDialog(false)
                const engineIds = vessel?.parentComponent_Components?.nodes
                    ? vessel?.parentComponent_Components?.nodes
                          .filter(
                              (item: any) =>
                                  item.basicComponent.componentCategory ===
                                  'Engine',
                          )
                          .map((item: any) => {
                              return item.basicComponent.id
                          })
                    : []
                engineIds.length > 0 && getEngines(engineIds)
            }
        },
        onError: (error: any) => {
            console.error('updateEngine error', error)
        },
    })
    const [queryAddEngine] = useMutation(CREATE_ENGINE, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.createEngine
            if (data.id > 0) {
                setOpenEngineDialog(false)
                const engineIds = [
                    data.id,
                    ...(vessel?.parentComponent_Components?.nodes
                        ? vessel.parentComponent_Components.nodes
                              .filter(
                                  (item: any) =>
                                      item.basicComponent.componentCategory ===
                                      'Engine',
                              )
                              .map((item: any) => {
                                  return item.basicComponent.id
                              })
                        : []),
                ]
                engineIds.length > 0 && getEngines(engineIds)
                createParentComponent(data.id)
            }
        },
        onError: (error: any) => {
            console.error('createEngine error', error)
        },
    })
    const handleAddNewEngine = async () => {
        const engineName = (
            document.getElementById('engine-title') as HTMLInputElement
        ).value
        const engineType = currentData['engine']
            ? currentData['engine'].type?.replaceAll('_', ' ')
            : ''
        const enginePower = (
            document.getElementById('engine-power') as HTMLInputElement
        ).value
        const engineDrive = currentData['engine']
            ? currentData['engine'].driveType?.replaceAll('_', ' ')
            : ''
        const enginePosition = currentData['engine']
            ? currentData['engine'].positionOnVessel
            : ''
        const engineHours = (
            document.getElementById('engine-hours') as HTMLInputElement
        ).value
        const engineIdentified = (
            document.getElementById('engine-identified') as HTMLInputElement
        ).value
        const engineMake = (
            document.getElementById('engine-make') as HTMLInputElement
        ).value
        const engineModel = (
            document.getElementById('engine-model') as HTMLInputElement
        ).value
        const engineKW = (
            document.getElementById('engine-kW') as HTMLInputElement
        ).value
        const engineKVA = (
            document.getElementById('engine-kVA') as HTMLInputElement
        ).value
        if (selectedEngine > 0) {
            await queryUpdateEngine({
                variables: {
                    input: {
                        id: selectedEngine,
                        title: engineName,
                        type: engineType,
                        maxPower: enginePower,
                        driveType: engineDrive,
                        positionOnVessel: enginePosition,
                        currentHours: +engineHours,
                        identifier: engineIdentified,
                        componentCategory: 'Engine',
                        make: engineMake,
                        model: engineModel,
                        kW: engineKW,
                        kVA: engineKVA,
                    },
                },
            })
        } else {
            await queryAddEngine({
                variables: {
                    input: {
                        title: engineName,
                        type: engineType,
                        maxPower: enginePower,
                        driveType: engineDrive,
                        positionOnVessel: enginePosition,
                        currentHours: +engineHours,
                        identifier: engineIdentified,
                        componentCategory: 'Engine',
                        make: engineMake,
                        model: engineModel,
                        kW: engineKW,
                        kVA: engineKVA,
                    },
                },
            })
        }
    }

    const handleAddNewFuelTank = async () => {
        const fuelTankName = (
            document.getElementById('fuel-tank-title') as HTMLInputElement
        ).value
        const fuelTankSafeCapacity = (
            document.getElementById(
                'fuel-tank-safeCapacity',
            ) as HTMLInputElement
        ).value
        const fuelTankCapacity = (
            document.getElementById('fuel-tank-capacity') as HTMLInputElement
        ).value
        const fuelTankIdentified = (
            document.getElementById('fuel-tank-identified') as HTMLInputElement
        ).value
        if (selectedFuelTank > 0) {
            await queryUpdateFuelTank({
                variables: {
                    input: {
                        id: selectedFuelTank,
                        title: fuelTankName,
                        safeFuelCapacity: +fuelTankSafeCapacity,
                        capacity: +fuelTankCapacity,
                        identifier: fuelTankIdentified,
                        fuelType: currentData['fuelTank']
                            ? currentData['fuelTank'].fuelType
                            : '',
                        dipType: currentData['fuelTank']
                            ? currentData['fuelTank'].dipType
                            : '',
                        componentCategory: 'FuelTank',
                        currentLevel: +currentData['fuelTank'].currentLevel,
                    },
                },
            })
        } else {
            await queryAddFuelTank({
                variables: {
                    input: {
                        title: fuelTankName,
                        safeFuelCapacity: +fuelTankSafeCapacity,
                        capacity: +fuelTankCapacity,
                        identifier: fuelTankIdentified,
                        fuelType: currentData['fuelTank']
                            ? currentData['fuelTank'].fuelType
                            : '',
                        dipType: currentData['fuelTank']
                            ? currentData['fuelTank'].dipType
                            : '',
                        componentCategory: 'FuelTank',
                    },
                },
            })
        }
    }

    const [queryAddWaterTank] = useMutation(CREATE_WATERTANK, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.createWaterTank
            if (data.id > 0) {
                setOpenWaterTankDialog(false)
                const waterTankIds = [
                    data.id,
                    ...(vessel?.parentComponent_Components?.nodes
                        ? vessel?.parentComponent_Components?.nodes
                              ?.filter(
                                  (item: any) =>
                                      item.basicComponent.componentCategory ===
                                      'WaterTank',
                              )
                              .map((item: any) => {
                                  return item.basicComponent.id
                              })
                        : []),
                ]
                waterTankIds.length > 0 && getWaterTanks(waterTankIds)
                createParentComponent(data.id)
            }
        },
        onError: (error: any) => {
            console.error('createWaterTank error', error)
        },
    })

    const handleAddNewWaterTank = async () => {
        const waterTankName = (
            document.getElementById('water-tank-title') as HTMLInputElement
        ).value
        const waterTankCapacity = (
            document.getElementById('water-tank-capacity') as HTMLInputElement
        ).value
        const waterTankIdentified = (
            document.getElementById('water-tank-identified') as HTMLInputElement
        ).value
        if (selectedWaterTank > 0) {
            await queryUpdateWaterTank({
                variables: {
                    input: {
                        id: selectedWaterTank,
                        title: waterTankName,
                        capacity: +waterTankCapacity,
                        identifier: waterTankIdentified,
                        componentCategory: 'WaterTank',
                    },
                },
            })
        } else {
            await queryAddWaterTank({
                variables: {
                    input: {
                        title: waterTankName,
                        capacity: +waterTankCapacity,
                        identifier: waterTankIdentified,
                        componentCategory: 'WaterTank',
                    },
                },
            })
        }
    }

    const handleAddNewSewageSystem = async () => {
        const sewageSystemName = (
            document.getElementById('sewage-system-title') as HTMLInputElement
        ).value
        const sewageSystemCapacity = (
            document.getElementById(
                'sewage-system-capacity',
            ) as HTMLInputElement
        ).value
        const sewageSystemIdentified = (
            document.getElementById(
                'sewage-system-identified',
            ) as HTMLInputElement
        ).value
        const numberOfTanks = (
            document.getElementById(
                'sewage-system-numberOfTanks',
            ) as HTMLInputElement
        ).value
        if (selectedSewageSystem > 0) {
            await queryUpdateSewageSystem({
                variables: {
                    input: {
                        id: selectedSewageSystem,
                        title: sewageSystemName,
                        capacity: +sewageSystemCapacity,
                        identifier: sewageSystemIdentified,
                        numberOfTanks: +numberOfTanks,
                        componentCategory: 'SewageSystem',
                    },
                },
            })
        } else {
            await queryAddSewageSystem({
                variables: {
                    input: {
                        title: sewageSystemName,
                        capacity: +sewageSystemCapacity,
                        identifier: sewageSystemIdentified,
                        numberOfTanks: +numberOfTanks,
                        componentCategory: 'SewageSystem',
                    },
                },
            })
        }
    }

    const [queryUpdateWaterTank] = useMutation(UPDATE_WATERTANK, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.updateWaterTank
            if (data.id > 0) {
                setSelectedWaterTank(0)
                setOpenWaterTankDialog(false)
                const waterTankIds = vessel?.parentComponent_Components?.nodes
                    ? vessel?.parentComponent_Components?.nodes
                          .filter(
                              (item: any) =>
                                  item.basicComponent.componentCategory ===
                                  'WaterTank',
                          )
                          .map((item: any) => {
                              return item.basicComponent.id
                          })
                    : []
                waterTankIds.length > 0 && getWaterTanks(waterTankIds)
            }
        },
        onError: (error: any) => {
            console.error('updateWaterTank error', error)
        },
    })

    const [queryAddSewageSystem] = useMutation(CREATE_SEWAGESYSTEM, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.createSewageSystem
            if (data.id > 0) {
                setOpenSewageSystemDialog(false)
                const sewageSystemIds = [
                    data.id,
                    ...(vessel?.parentComponent_Components?.nodes
                        ? vessel?.parentComponent_Components?.nodes
                              .filter(
                                  (item: any) =>
                                      item.basicComponent.componentCategory ===
                                      'SewageSystem',
                              )
                              .map((item: any) => {
                                  return item.basicComponent.id
                              })
                        : []),
                ]
                sewageSystemIds.length > 0 && getSewageSystems(sewageSystemIds)
                createParentComponent(data.id)
            }
        },
        onError: (error: any) => {
            console.error('createSewageSystem error', error)
        },
    })

    const [queryUpdateSewageSystem] = useMutation(UPDATE_SEWAGESYSTEM, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.updateSewageSystem
            if (data.id > 0) {
                setSelectedSewageSystem(0)
                setOpenSewageSystemDialog(false)
                const sewageSystemIds = vessel?.parentComponent_Components
                    ?.nodes
                    ? vessel?.parentComponent_Components?.nodes
                          .filter(
                              (item: any) =>
                                  item.basicComponent.componentCategory ===
                                  'SewageSystem',
                          )
                          .map((item: any) => {
                              return item.basicComponent.id
                          })
                    : []
                sewageSystemIds.length > 0 && getSewageSystems(sewageSystemIds)
            }
        },
        onError: (error: any) => {
            console.error('updateSewageSystem error', error)
        },
    })

    const [queryAddFuelTank] = useMutation(CREATE_FUELTANK, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.createFuelTank
            if (data.id > 0) {
                setOpenFuelTankDialog(false)
                const fuelTankIds = [
                    data.id,
                    ...(vessel?.parentComponent_Components?.nodes
                        ? vessel?.parentComponent_Components?.nodes
                              .filter(
                                  (item: any) =>
                                      item.basicComponent.componentCategory ===
                                      'FuelTank',
                              )
                              .map((item: any) => {
                                  return item.basicComponent.id
                              })
                        : []),
                ]
                fuelTankIds.length > 0 && getFuelTanks(fuelTankIds)
                createParentComponent(data.id)
            }
        },
        onError: (error: any) => {
            console.error('createFuelTank error', error)
        },
    })

    const [queryUpdateFuelTank] = useMutation(UPDATE_FUELTANK, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.updateFuelTank
            if (data.id > 0) {
                setSelectedFuelTank(0)
                setOpenFuelTankDialog(false)
                const fuelTankIds = vessel?.parentComponent_Components?.nodes
                    ? vessel?.parentComponent_Components?.nodes
                          .filter(
                              (item: any) =>
                                  item.basicComponent.componentCategory ===
                                  'FuelTank',
                          )
                          .map((item: any) => {
                              return item.basicComponent.id
                          })
                    : []
                fuelTankIds.length > 0 && getFuelTanks(fuelTankIds)
            }
        },
        onError: (error: any) => {
            console.error('updateFuelTank error', error)
        },
    })

    const handleUpdate = async (vesselSpecificsID = 0) => {
        const Title = (
            document.getElementById('vessel-title') as HTMLInputElement
        ).value
        const AuthNo = (
            document.getElementById('vessel-authNo') as HTMLInputElement
        ).value
        const MMSI = (
            document.getElementById('vessel-mmsi') as HTMLInputElement
        ).value
        const TransitId = (
            document.getElementById('vessel-transitId') as HTMLInputElement
        ).value
        const Country = currentData['countryofoperation']
            ? currentData['countryofoperation']
            : vessel?.countryOfOperation
        let vesselType = currentData['vesseltype']
            ? currentData['vesseltype'] || defaultVesselType.value
            : vessel?.vesselType || defaultVesselType.value
        vesselType = vesselType.replaceAll('_', ' ') // replace underscores with spaces for vessel type before saving
        const vesselDescription = (
            document.getElementById('vessel-description') as HTMLInputElement
        ).value
        const minCrew = (
            document.getElementById('vessel-minCrew') as HTMLInputElement
        ).value
        const maxPax = (
            document.getElementById('vessel-maxPax') as HTMLInputElement
        ).value
        const maxPOB = (
            document.getElementById('vessel-maxPOB') as HTMLInputElement
        ).value
        const callSign = (
            document.getElementById('vessel-callSign') as HTMLInputElement
        ).value
        // Vessel Specifics
        const beam = (
            document.getElementById('vessel-beam') as HTMLInputElement
        ).value
        const overallLength = (
            document.getElementById('vessel-overallLength') as HTMLInputElement
        ).value
        const draft = (
            document.getElementById('vessel-draft') as HTMLInputElement
        ).value
        const hullConstruction = (
            document.getElementById(
                'vessel-hullConstruction',
            ) as HTMLInputElement
        ).value
        const hullColor = (
            document.getElementById('vessel-hullColor') as HTMLInputElement
        ).value
        const primaryHarbour = (
            document.getElementById('vessel-primaryHarbour') as HTMLInputElement
        ).value

        const vID = await createNewVessel()
        if (vesselSpecificsID > 0) {
            await queryUpdateVessel({
                variables: {
                    input: {
                        id: vID,
                        mmsi: MMSI,
                        registration: AuthNo,
                        title: Title,
                        countryOfOperation: Country,
                        transitID: TransitId,
                        showOnDashboard: displayOnDashboard,
                        vesselType: vesselType,
                        vesselTypeDescription: vesselDescription,
                        callSign: callSign,
                        minCrew: +minCrew,
                        maxPax: +maxPax,
                        maxPOB: +maxPOB,
                        vesselSpecificsID: vesselSpecificsID,
                        seaLogsMembers: vesselMembers
                            ?.map((member: any) => member.value)
                            .join(','),
                        departments: selectedDepartments.join(','),
                        bannerImageID: uploadImagedID,
                    },
                },
            })
        }
        if (vesselSpecificsID == 0) {
            if (vessel?.vesselSpecifics?.id > 0) {
                await queryUpdateVesselSpecifics({
                    variables: {
                        input: {
                            id: vessel?.vesselSpecifics.id,
                            beam: beam,
                            overallLength: overallLength,
                            dateOfBuild: dateOfBuild,
                            draft: draft,
                            carriesDangerousGoods:
                                vessel?.vesselSpecifics?.carriesDangerousGoods,
                            hullConstruction: hullConstruction,
                            hullColor: hullColor,
                            primaryHarbour: primaryHarbour,
                        },
                    },
                })
            } else {
                await queryCreateVesselSpecifics({
                    variables: {
                        input: {
                            beam: beam,
                            overallLength: overallLength,
                            dateOfBuild: dateOfBuild,
                            draft: draft,
                            hullConstruction: hullConstruction,
                            hullColor: hullColor,
                            carriesDangerousGoods:
                                vessel?.vesselSpecifics?.carriesDangerousGoods,
                            primaryHarbour: primaryHarbour,
                            vesselID: vID,
                        },
                    },
                })
            }
        }
    }

    const [queryCreateVesselSpecifics] = useMutation(CREATE_VESSEL_SPECIFICS, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.createVesselSpecifics
            if (data.id > 0) {
                handleUpdate(data.id)
            }
        },
        onError: (error: any) => {
            console.error('createVesselSpecifics error', error)
        },
    })

    const [queryUpdateVesselSpecifics] = useMutation(UPDATE_VESSEL_SPECIFICS, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.updateVesselSpecifics
            if (data.id > 0) {
                handleUpdate(data.id)
            }
        },
        onError: (error: any) => {
            console.error('updateVesselSpecifics error', error)
        },
    })

    const [queryUpdateVessel] = useMutation(UPDATE_VESSEL, {
        onCompleted: (response: any) => {
            const data = response.updateVessel
            if (data.id > 0) {
                router.push(
                    `/vessel/info?id=${vesselId > 0 ? vesselId : data.id}`,
                )
            }
        },
        onError: (error: any) => {
            console.error('updateVessel error', error)
        },
    })

    const [queryUpdateVesselWithoutReload] = useMutation(UPDATE_VESSEL, {
        onCompleted: (response: any) => {
            const data = response.updateVessel
        },
        onError: (error: any) => {
            console.error('updateVessel error', error)
        },
    })

    const handleDelete = async () => {
        if (isAdmin()) {
            const vID = await createNewVessel()
            await queryArchiveVessel({
                variables: {
                    input: {
                        id: vID,
                        archived: true,
                    },
                },
            })
        } else {
            alert('You do not have permission to archive vessel')
        }
    }

    const [queryArchiveVessel] = useMutation(UPDATE_VESSEL, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.updateVessel
            if (data.id > 0) {
                router.push('/vessel')
            }
        },
        onError: (error: any) => {
            console.error('archiveVessel error', error)
        },
    })

    const handleSetSelectedEngine = (engineId: number) => {
        setSelectedEngine(engineId)
        const appendData = {
            ...currentData,
            engine: engineList.find((engine: any) => engine.id == engineId),
        }
        setCurrentData(appendData)
    }

    const handleSetSelectedFuelTank = (fuelTankId: number) => {
        setSelectedFuelTank(fuelTankId)
        const appendData = {
            ...currentData,
            fuelTank: fuelTankList.find(
                (fuelTank: any) => fuelTank.id == fuelTankId,
            ),
        }
        setCurrentData(appendData)
    }

    const handleSetSelectedWaterTank = (waterTankId: number) => {
        setSelectedWaterTank(waterTankId)
        const appendData = {
            ...currentData,
            waterTank: waterTankList.find(
                (waterTank: any) => waterTank.id == waterTankId,
            ),
        }
        setCurrentData(appendData)
    }

    const handleSetSelectedSewageSystem = (sewageSystemId: number) => {
        setSelectedSewageSystem(sewageSystemId)
        const appendData = {
            ...currentData,
            sewageSystem: sewageSystemList.find(
                (sewageSystem: any) => sewageSystem.id == sewageSystemId,
            ),
        }
        setCurrentData(appendData)
    }

    const handleInventoryChange = (value: any) => {
        if (value.find((option: any) => option.value === 'newInventory')) {
            setOpenCreateInventoryDialog(true)
        } else {
            setVesselInventory(value)
            const deletedValues = vesselInventories?.filter((inventory: any) =>
                value.every((option: any) => option.value !== inventory.value),
            )
            deletedValues &&
                deletedValues.length > 0 &&
                deletedValues.map((inventory: any) => {
                    unsetVesselInventory(inventory.value)
                })
            const addedValues = value.filter((inventory: any) =>
                vesselInventories?.every(
                    (option: any) => option.value !== inventory.value,
                ),
            )
            addedValues &&
                addedValues.length > 0 &&
                addedValues.map((inventory: any) => {
                    setInventoryToVessel(inventory.value)
                })
        }
    }

    const setInventoryToVessel = async (inventoryId: number) => {
        const vID = await createNewVessel()
        await queryUpdateInventory({
            variables: {
                input: {
                    id: inventoryId,
                    vesselID: vID,
                },
            },
        })
    }

    const unsetVesselInventory = async (inventoryId: number) => {
        await queryUpdateInventory({
            variables: {
                input: {
                    id: inventoryId,
                    vesselID: null,
                },
            },
        })
    }

    const [queryUpdateInventory] = useMutation(UPDATE_INVENTORY, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.updateInventory
            if (data.id > 0) {
                console.log('Inventory updated')
            }
        },
        onError: (error: any) => {
            console.error('updateInventory error', error)
        },
    })

    const handleAddNewInventory = async () => {
        const vID = await createNewVessel()
        const variables = {
            input: {
                item: (
                    document.getElementById(
                        'inventory-item',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-item',
                          ) as HTMLInputElement
                      ).value
                    : null,
                description: (
                    document.getElementById(
                        'inventory-short-description',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-short-description',
                          ) as HTMLInputElement
                      ).value
                    : null,
                quantity: (
                    document.getElementById('inventory-qty') as HTMLInputElement
                ).value
                    ? parseInt(
                          (
                              document.getElementById(
                                  'inventory-qty',
                              ) as HTMLInputElement
                          ).value,
                      )
                    : null,
                productCode: (
                    document.getElementById(
                        'inventory-code',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-code',
                          ) as HTMLInputElement
                      ).value
                    : null,
                costingDetails: (
                    document.getElementById(
                        'inventory-cost',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-cost',
                          ) as HTMLInputElement
                      ).value
                    : null,
                location: (
                    document.getElementById(
                        'inventory-location',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'inventory-location',
                          ) as HTMLInputElement
                      ).value
                    : null,
                categories: currentData?.inventory?.category
                    ? currentData.inventory.category
                    : null,
                vesselID: vID,
            },
        }
        await queryAddInventory({
            variables: variables,
        })
    }

    const [queryAddInventory] = useMutation(CREATE_INVENTORY, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.createInventory
            if (data.id > 0) {
                setOpenCreateInventoryDialog(false)
                setInventoryList([
                    ...inventoryList,
                    { label: data.item, value: data.id },
                ])
                setVesselInventory([
                    ...vesselInventories,
                    { label: data.item, value: data.id },
                ])
            }
        },
        onError: (error: any) => {
            console.error('createInventory error', error)
        },
    })

    const handleMemberChange = (value: any) => {
        if (value.find((option: any) => option.value === 'newCrewMember')) {
            setOpenCreateMemberDialog(true)
        } else {
            setVesselMembers(value)
        }
    }

    const handleAddNewMember = async () => {
        const vID = await createNewVessel()
        const variables = {
            input: {
                firstName: (
                    document.getElementById(
                        'crew-firstName',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-firstName',
                          ) as HTMLInputElement
                      ).value
                    : null,
                surname: (
                    document.getElementById('crew-surname') as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-surname',
                          ) as HTMLInputElement
                      ).value
                    : null,
                email: (
                    document.getElementById('crew-email') as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-email',
                          ) as HTMLInputElement
                      ).value
                    : null,
                phoneNumber: (
                    document.getElementById(
                        'crew-phoneNumber',
                    ) as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-phoneNumber',
                          ) as HTMLInputElement
                      ).value
                    : null,
                username: (
                    document.getElementById('crew-username') as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-username',
                          ) as HTMLInputElement
                      ).value
                    : null,
                password: (
                    document.getElementById('crew-password') as HTMLInputElement
                ).value
                    ? (
                          document.getElementById(
                              'crew-password',
                          ) as HTMLInputElement
                      ).value
                    : null,
                vehicles: [vID].join(','),
            },
        }
        await queryAddMember({
            variables: variables,
        })
    }

    const [queryAddMember] = useMutation(CREATE_USER, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.createSeaLogsMember
            if (data.id > 0) {
                setOpenCreateMemberDialog(false)
                setMembersList([
                    ...membersList,
                    {
                        label: data.firstName + ' ' + data.surname,
                        value: data.id,
                    },
                ])
                setVesselMembers([
                    ...vesselMembers,
                    {
                        label: data.firstName + ' ' + data.surname,
                        value: data.id,
                    },
                ])
                setError(false)
            }
        },
        onError: (error: any) => {
            console.error('createUser error', error.message)
            setError(error)
        },
    })

    const handleDateofBuildChange = (date: any) => {
        const dateOfBuild = dayjs(date).format('DD/MM/YYYY')
        setDateOfBuild(dateOfBuild)
    }

    const handleDisplayOnDashboard = (e: any) => {
        setDisplayOnDashboard(e.target.checked)
    }

    const defaultVesselType = { label: 'Recreation', value: 'Recreation' }
    const vesselTypes = [
        { label: 'SLALL', value: 'SLALL' },
        { label: 'Rescue Vessel', value: 'Rescue Vessel' },
        { label: 'Tug Boat', value: 'Tug Boat' },
        { label: 'Pilot Vessel', value: 'Pilot Vessel' },
        { label: 'Recreation', value: 'Recreation' },
        { label: 'Passenger Ferry', value: 'Passenger Ferry' },
        { label: 'Water Taxi', value: 'Water Taxi' },
        { label: 'Sailing Vessel', value: 'Sailing Vessel' },
        { label: 'Large Motor Yacht', value: 'Large Motor Yacht' },
        { label: 'JetBoat', value: 'JetBoat' },
    ]

    const handleSetInventoryCategory = (value: any) => {
        if (value.value === 'newCategory') {
            setOpenCreateInventoryCategoryDialog(true)
        }
        setCurrentData({
            ...currentData,
            inventory: {
                ...currentData['inventory'],
                category: value.value,
            },
        })
    }

    const handleAddNewInventoryCategory = async () => {
        await queryAddInventoryCategory({
            variables: {
                input: {
                    name: (
                        document.getElementById(
                            'inventory-category-title',
                        ) as HTMLInputElement
                    ).value,
                    abbreviation: (
                        document.getElementById(
                            'inventory-category-abbreviation',
                        ) as HTMLInputElement
                    ).value,
                },
            },
        })
    }

    const [queryAddInventoryCategory] = useMutation(CREATE_INVENTORY_CATEGORY, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.createInventoryCategory
            if (data.id > 0) {
                setOpenCreateInventoryCategoryDialog(false)
                setInventoryCategories([
                    ...inventoryCategories,
                    { label: data.name, value: data.id },
                ])
                setCurrentData({
                    ...currentData,
                    inventory: {
                        ...currentData['inventory'],
                        category: data.id,
                    },
                })
                setSelectedInventoryCategory({
                    label: data.name,
                    value: data.id,
                })
            }
        },
        onError: (error: any) => {
            console.error('createInventoryCategory error', error)
        },
    })

    const handleDepartmentChange = (departments: any) => {
        setSelectedDepartments(departments.map((d: any) => d.value))
    }
    useEffect(() => {
        if (isLoading) {
            loadVesselInfo()
            setIsLoading(false)
        }
    }, [isLoading])

    function handleImageChange(e: any) {
        setImageLoader(true)
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            for (let i = 0; i < e.target.files['length']; i++) {
                setFiles((prevState: any) => [...prevState, e.target.files[i]])
                uploadFile(e.target.files[i])
            }
            // console.log(1, e.target.files)
        }
    }

    async function uploadFile(file: any) {
        const formData = new FormData()
        formData.append('FileData', file, file.name.replace(/\s/g, ''))
        try {
            const response = await fetch(
                process.env.API_BASE_URL + 'v2/upload',
                {
                    method: 'POST',
                    headers: {
                        Authorization:
                            'Bearer ' + localStorage.getItem('sl-jwt'),
                    },
                    body: formData,
                },
            )
            const data = await response.json()
            setUploadImagedUrl(data[0].location)
            setUploadImagedID(data[0].id)
            setImageLoader(false)
        } catch (err) {
            console.error(err)
            setImageLoader(false)
        }
    }

    const [getFileDetails, { data, loading }] = useLazyQuery(GET_FILES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const data = response.readFiles.nodes
            setUploadImagedUrl(process.env.FILE_BASE_URL + data[0].fileFilename)
        },
        onError: (error) => {
            console.error(error)
        },
    })

    const handleVesselIcon = async (e: any) => {
        queryUpdateVesselWithoutReload({
            variables: {
                input: {
                    id: vessel?.id,
                    icon: vesselIcon ? vesselIcon.replaceAll(' ', '-') : null,
                    iconMode: vesselIconMode,
                    photoID: vesselPhoto.length > 0 ? vesselPhoto[0].id : null,
                },
            },
        })
        setOpenVesselImageDialog(false)
    }

    const [permissions, setPermissions] = useState<any>(false)

    useEffect(() => {
        setPermissions(getPermissions)
    }, [])

    if (!permissions || !hasPermission('VIEW_VESSEL', permissions)) {
        return !permissions ? (
            <Loading />
        ) : (
            <Loading errorMessage="Oops! You do not have the permission to view this section." />
        )
    }

    return (
        <div className="w-full p-0 dark:text-white border border-slblue-100 dark:border-0 rounded-t-lg bg-sllightblue-50 dark:bg-sldarkblue-800">
            <div className="flex justify-between px-8 py-3 items-center bg-sldarkblue-900 rounded-t-lg">
                <Heading className="font-light font-monasans text-2xl text-white">
                    <span className="font-semibold mr-2">{`${vesselId > 0 ? 'Updating Vessel:' : 'Creating new vessel'}`}</span>{' '}
                    {vessel?.title}
                </Heading>
            </div>
            <div className="px-0 md:px-4 py-8 border-t border-slblue-200 ">
                <div className="grid md:grid-cols-3 lg:grid-cols-3 grid-cols-1 gap-6 px-4">
                    <div className="mb-4 text-l">
                        Vessel Details
                        <p className="text-xs pl-2 mt-4 max-w-[25rem] leading-loose font-light">
                            Record details such as the vessels name, size,
                            registration, etc. Make sure everything listed is
                            correct and kept up-to-date.
                        </p>
                        <p className="text-xs pl-2 mt-2 max-w-[25rem] leading-loose font-light">
                            These fields can be exported with reports for the
                            likes of survey reports and certification documents.
                        </p>
                        <div className="my-4">
                            <div className="inline-flex items-center">
                                <label
                                    className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                    htmlFor="display-on-dashboard"
                                    data-ripple="true"
                                    data-ripple-color="dark"
                                    data-ripple-dark="true">
                                    <input
                                        readOnly={
                                            !permissions ||
                                            !hasPermission(
                                                'EDIT_VESSEL',
                                                permissions,
                                            )
                                        }
                                        type="checkbox"
                                        id="display-on-dashboard"
                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-slblue-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-slblue-800 checked:bg-sllightblue-1000 before:bg-slblue-300 hover:before:opacity-10 mt-3"
                                        onChange={handleDisplayOnDashboard}
                                        checked={displayOnDashboard}
                                    />
                                    <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                    <span className="ml-3 text-sm font-semibold uppercase pt-3">
                                        Display on dashboard
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-2 block bg-white pt-8 pb-5 px-7 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800">
                        <div className="md:flex lg:flex gap-4">
                            <input
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                id={`vessel-title`}
                                type="text"
                                className={`${classes.input} w-full lg:!py-4 md:!w-1/2 font-medium text-xl mb-2 md:mb-0 lg:mb-0`}
                                placeholder="Vessel Title"
                                defaultValue={vessel?.title}
                            />
                            <Select
                                id="task-links"
                                isClearable
                                options={CountriesList}
                                value={CountriesList.filter(
                                    (country: any) =>
                                        country.value ===
                                        currentData?.countryofoperation,
                                )}
                                defaultValue={CountriesList.filter(
                                    (country: any) =>
                                        country.value ===
                                        vessel?.countryOfOperation,
                                )}
                                closeMenuOnSelect={true}
                                menuPlacement="bottom"
                                placeholder="Country of Operation"
                                onChange={(value: any) =>
                                    setCurrentData({
                                        ...currentData,
                                        countryofoperation: value.value,
                                    })
                                }
                                className={`
                                    ${(!permissions || !hasPermission('EDIT_VESSEL', permissions)) && 'pointer-events-none'}
                                    w-full md:w-1/2 lg:w-1/2 bg-slblue-50 rounded-lg text-sm border border-slblue-200 p-4 dark:bg-sldarkblue-900`}
                                classNames={{
                                    control: () =>
                                        'flex items-center py-1 w-full !text-sm !text-slblue-700 !bg-transparent !border-0 !rounded-lg dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-blue-500',
                                    singleValue: () =>
                                        'dark:!text-white !text-slblue-700',
                                    dropdownIndicator: () => '!p-0 !hidden',
                                    indicatorSeparator: () => '!hidden',
                                    multiValue: () =>
                                        '!bg-slblue-50 inline-block rounded p-1 m-0 !mr-1.5 border border-slbule-200 !rounded-md  font-normal mr-2',
                                    clearIndicator: () => '!py-0',
                                    valueContainer: () => '!py-0',
                                    menu: () => classes.selectMenu,
                                    option: () => classes.selectOption,
                                }}
                            />
                        </div>
                        <div className="my-4 flex gap-4">
                            <input
                                id={`vessel-primaryHarbour`}
                                type="text"
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                className={classes.input}
                                placeholder="Home port"
                                defaultValue={
                                    vessel?.vesselSpecifics?.primaryHarbour
                                }
                            />
                        </div>
                        <div className="flex flex-col lg:flex-row md:flex-row lg:gap-3 md:gap-3 my-4 pb-2">
                            <div className="w-full lg:w-1/4 md:w-1/4">
                                <label
                                    htmlFor="vessel-authNo"
                                    className="text-xs font-light">
                                    Authority No.
                                </label>
                                <input
                                    id={`vessel-authNo`}
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    type="text"
                                    className={`${classes.input} !text-xs`}
                                    placeholder="(MNZ, AMSA)"
                                    defaultValue={vessel?.registration}
                                />
                            </div>
                            <div className="w-full lg:w-1/4 md:w-1/4">
                                <label
                                    htmlFor="vessel-transitId"
                                    className="text-xs font-light">
                                    Transit identifier
                                </label>
                                <input
                                    id={`vessel-transitId`}
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    type="text"
                                    className={`${classes.input} !text-xs`}
                                    placeholder="(AIS)"
                                    defaultValue={vessel?.transitID}
                                />
                            </div>
                            <div className="w-full lg:w-1/4 md:w-1/4">
                                <label
                                    htmlFor="vessel-mmsi"
                                    className="text-xs font-light">
                                    MMSI
                                </label>
                                <input
                                    id={`vessel-mmsi`}
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    type="text"
                                    className={`${classes.input} !text-xs`}
                                    placeholder="For marine traffic maps"
                                    defaultValue={vessel?.mmsi}
                                />
                            </div>
                            <div className="w-full lg:w-1/4 md:w-1/4">
                                <label
                                    htmlFor="vessel-callSign"
                                    className="mb-1 text-xs font-light">
                                    Call sign
                                </label>
                                <input
                                    id={`vessel-callSign`}
                                    type="text"
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    className={`${classes.input} !text-xs`}
                                    placeholder="Call sign"
                                    defaultValue={vessel?.callSign}
                                />
                            </div>
                        </div>
                        <div className="border-t border-slblue-100 flex flex-col lg:flex-row md:flex-row lg:gap-3 md:gap-3 my-4 pt-3">
                            <div className="w-full lg:w-1/4 md:w-1/4">
                                <label
                                    htmlFor="vessel-beam"
                                    className="text-xs font-light">
                                    Vessel beam
                                </label>
                                <input
                                    id={`vessel-beam`}
                                    type="text"
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    className={classes.input}
                                    placeholder="Beam"
                                    defaultValue={vessel?.vesselSpecifics?.beam}
                                />
                            </div>
                            <div className="w-full lg:w-1/4 md:w-1/4">
                                <label
                                    htmlFor="vessel-overallLength"
                                    className="text-xs font-light">
                                    Length overall
                                </label>
                                <input
                                    id={`vessel-overallLength`}
                                    type="text"
                                    className={classes.input}
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    placeholder="L.O.A"
                                    defaultValue={
                                        vessel?.vesselSpecifics?.overallLength
                                    }
                                />
                            </div>
                            <div className="w-full lg:w-1/4 md:w-1/4 flex flex-col">
                                <label
                                    htmlFor="vessel-dateOfBuild"
                                    className="text-xs font-light lg:mb-1 md:mb-1">
                                    Date of build
                                </label>
                                <DialogTrigger>
                                    <Button
                                        className={` ${(!permissions || !hasPermission('EDIT_VESSEL', permissions)) && 'pointer-events-none'}`}>
                                        <input
                                            id="vessel-dateOfBuild"
                                            name="vessel-dateOfBuild"
                                            type="text"
                                            readOnly
                                            placeholder="D.O.B"
                                            defaultValue={dateOfBuild}
                                            className={classes.input}
                                            required
                                        />
                                    </Button>
                                    <ModalOverlay
                                        className={({
                                            isEntering,
                                            isExiting,
                                        }) => `
                                        fixed inset-0 z-[15002] overflow-y-auto bg-black/25 flex min-h-full justify-center p-4 text-center backdrop-blur
                                        ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                                        ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                                        `}>
                                        <Modal>
                                            <Dialog
                                                role="alertdialog"
                                                className="border border-slblue-200 rounded-lg bg-white relative shadow-lg">
                                                {({ close }) => (
                                                    <LocalizationProvider
                                                        dateAdapter={
                                                            AdapterDayjs
                                                        }>
                                                        <StaticDatePicker
                                                            className={`p-1 my-2`}
                                                            onAccept={
                                                                handleDateofBuildChange
                                                            }
                                                            onClose={close}
                                                        />
                                                    </LocalizationProvider>
                                                )}
                                            </Dialog>
                                        </Modal>
                                    </ModalOverlay>
                                </DialogTrigger>
                                {/* <input id={`vessel-dateOfBuild`} type="text" className={classes.input} placeholder='Date of Build' defaultValue={vessel?.vesselSpecifics?.dateOfBuild} /> */}
                            </div>
                            <div className="w-full lg:w-1/4 md:w-1/4">
                                <label
                                    htmlFor="vessel-draft"
                                    className="text-xs font-light">
                                    Draft
                                </label>
                                <input
                                    id={`vessel-draft`}
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    type="text"
                                    className={classes.input}
                                    placeholder="Draft"
                                    defaultValue={
                                        vessel?.vesselSpecifics?.draft
                                    }
                                />
                            </div>
                        </div>
                        <div className="my-4 flex gap-4 font-light flex-col lg:flex-row">
                            <div className="w-full lg:w-1/4 md:w-1/4">
                                <label
                                    htmlFor="vessel-hullConstruction"
                                    className="text-xs font-light">
                                    Hull construction
                                </label>
                                <input
                                    id={`vessel-hullConstruction`}
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    type="text"
                                    className={classes.input}
                                    placeholder="(Steel, fibreglass, carbon etc)"
                                    defaultValue={
                                        vessel?.vesselSpecifics
                                            ?.hullConstruction
                                    }
                                />
                            </div>
                            <div className="w-full lg:w-1/4 md:w-1/4">
                                <label
                                    htmlFor="vessel-hullColor"
                                    className="text-xs font-light">
                                    Hull color
                                </label>
                                <input
                                    id={`vessel-hullColor`}
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    type="text"
                                    className={classes.input}
                                    placeholder="Color"
                                    defaultValue={
                                        vessel?.vesselSpecifics?.hullColor
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-0 md:px-4 py-8 border-t border-slblue-200">
                <div className="grid lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 px-4 grid-cols-1">
                    <div className="text-l">
                        Vessel configuration
                        <p className="text-xs pl-2 mt-4 max-w-[25rem] leading-loose font-light">
                            Select a vessel type from the dropdown. We use this
                            to help with constructing your logbook
                            configuration. If a vessel type does not adequately
                            describe your vessel contact support and we can add
                            this for you.
                        </p>
                        <p className="text-xs pl-2 mt-2 max-w-[25rem] leading-loose font-light">
                            Add engines, fuel and water tanks, and sullage
                            configuration for this vessel.
                        </p>
                    </div>
                    <div className="col-span-2 block bg-white pt-8 px-7 border border-slblue-200 rounded-lg dark:bg-sldarkblue-800">
                        <div
                            className={`lg:flex md:flex lg:gap-4 md:gap-4 flex flex-col lg:flex-row  ${(!permissions || !hasPermission('EDIT_VESSEL', permissions)) && 'pointer-events-none'}`}>
                            <Select
                                id="vessel-type"
                                options={vesselTypes}
                                closeMenuOnSelect={true}
                                value={
                                    vessel?.vesselType
                                        ? vesselTypes.filter(
                                              (type: any) =>
                                                  type.value ===
                                                  currentData?.vesseltype.replaceAll(
                                                      '_',
                                                      ' ',
                                                  ),
                                          )
                                        : defaultVesselType
                                }
                                defaultValue={
                                    vessel?.vesselType
                                        ? vesselTypes.filter(
                                              (type: any) =>
                                                  type.value ===
                                                  vessel?.vesselType.replaceAll(
                                                      '_',
                                                      ' ',
                                                  ),
                                          )
                                        : defaultVesselType
                                }
                                required
                                placeholder="Vessel Type*"
                                onChange={(value: any) => {
                                    setCurrentData({
                                        ...currentData,
                                        vesseltype: value.value,
                                    })
                                    setVessel({
                                        ...vessel,
                                        vesselType: value.value,
                                    })
                                }}
                                className="lg:w-1/2 md:w-1/2 w-full bg-slblue-50 rounded-lg dark:bg-sldarkblue-900 text-sm border border-slblue-200 mb-2 lg:mb-0 md:mb-0"
                                classNames={{
                                    control: () =>
                                        'block py-1 w-full !text-sm !text-slblue-700 !bg-transparent !rounded-lg !border-0 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-slblue-500 !dark:focus:border-slblue-500',
                                    singleValue: () =>
                                        'dark:!text-white !text-slblue-700',
                                    dropdownIndicator: () => '!p-0 !hidden',
                                    indicatorSeparator: () => '!hidden',
                                    multiValue: () =>
                                        '!bg-slblue-50 inline-flex rounded p-1 m-0 !mr-1.5 border border-slblue-200 !rounded-md !text-slblue-700 font-normal mr-2',
                                    clearIndicator: () => '!py-0',
                                    valueContainer: () => '!py-0',
                                }}
                            />
                            <input
                                id={`vessel-description`}
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                type="text"
                                className={`${classes.input} lg:!w-1/2 md:!w-1/2 w-full`}
                                placeholder="Vessel type description"
                                defaultValue={vessel?.vesselTypeDescription}
                            />
                        </div>
                        <div className="lg:my-6 lg:flex md:my-6 md:flex flex-col lg:flex-row md:flex-row">
                            <div className="lg:w-1/3 md:w-1/3 w-full">
                                <div className="flex gap-4 items-center">
                                    <div className="w-full">
                                        <label
                                            htmlFor="vesselIcon"
                                            className="text-xs font-light block">
                                            Vessel Icon / Photo
                                        </label>
                                        <div className="flex items-center gap-x-3">
                                            {vesselIconMode === 'Icon' &&
                                                vessel.icon !== null && (
                                                    <img
                                                        className="w-16 p-1 border rounded-full border-sl-200 bg-sllightblue-100"
                                                        src={`/vessel-icons/${vessel.icon}.svg`}
                                                    />
                                                )}
                                            {vesselIconMode === 'Photo' &&
                                                vesselPhoto.length > 0 && (
                                                    <img
                                                        className="w-16 h-16 object-cover p-1 border rounded-full border-sl-200 bg-sllightblue-100"
                                                        src={
                                                            process.env
                                                                .FILE_BASE_URL +
                                                            vesselPhoto[0]
                                                                .fileFilename
                                                        }
                                                    />
                                                )}
                                            {vessel.icon == null &&
                                                vesselPhoto.length == 0 && (
                                                    <SealogsVesselsIcon className="w-16 p-1 border rounded-full border-sl-200 bg-sllightblue-100" />
                                                )}
                                            <Button
                                                className="w-32 inline-flex justify-center items-center rounded-md bg-white p-1 md:px-5 text-sm shadow-sm ring-1 ring-inset ring-slblue-300 hover:bg-sldarkblue-1000 hover:text-white dark:bg-sldarkblue-900 dark:text-white"
                                                onPress={() =>
                                                    permissions &&
                                                    hasPermission(
                                                        'EDIT_VESSEL',
                                                        permissions,
                                                    ) &&
                                                    setOpenVesselImageDialog(
                                                        true,
                                                    )
                                                }>
                                                Change
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-1/3 md:w-1/3 w-full">
                                <div className="flex gap-4 items-center">
                                    <div className="col-span-full">
                                        <label
                                            htmlFor="vesselBanner"
                                            className="text-xs font-light block">
                                            Banner Image
                                        </label>
                                        <div className="flex items-center gap-x-3 h-16">
                                            <div className="w-32" role="status">
                                                {imageLoader ? (
                                                    <div
                                                        className="cst_loader flex justify-center"
                                                        role="status">
                                                        <svg
                                                            aria-hidden="true"
                                                            className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                                            viewBox="0 0 100 101"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path
                                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                                fill="currentColor"
                                                            />
                                                            <path
                                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                                fill="currentFill"
                                                            />
                                                        </svg>
                                                        <span className="sr-only">
                                                            Loading...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <img
                                                        className="w-full h-16 p-1 border rounded-[4px] bg-slblue-50 border-slblue-200"
                                                        src={
                                                            uploadImagedUrl
                                                                ? uploadImagedUrl
                                                                : 'https://www.coastguard.nz/media/419474/img_20220716_110744.jpg'
                                                        }
                                                    />
                                                )}
                                            </div>
                                            <label
                                                className="w-full inline-flex justify-center items-center rounded-md bg-white p-1 md:px-5 text-sm shadow-sm ring-1 ring-inset ring-slblue-300 hover:bg-sldarkblue-1000 hover:text-white cursor-pointer dark:bg-sldarkblue-900 dark:text-white"
                                                htmlFor="fileUpload">
                                                <input
                                                    type="file"
                                                    id="fileUpload"
                                                    readOnly={
                                                        !permissions ||
                                                        !hasPermission(
                                                            'EDIT_VESSEL',
                                                            permissions,
                                                        )
                                                    }
                                                    className="hidden"
                                                    onChange={(event) =>
                                                        handleImageChange(event)
                                                    }
                                                />
                                                Upload
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:my-4 lg:flex lg:gap-4 lg:pb-2 md:my-4 md:flex md:gap-4 md:pb-2 flex-col lg:flex-row md:flex-row">
                            <div className="lg:w-1/3 md:w-1/3 w-full mt-2 lg:mt-0 md:mt-0">
                                <label
                                    htmlFor="vessel-minCrew"
                                    className="text-xs font-light block">
                                    Minimum required crew
                                </label>
                                <input
                                    id={`vessel-minCrew`}
                                    type="text"
                                    className={classes.input}
                                    placeholder="Minimum crew"
                                    defaultValue={vessel?.minCrew}
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                />
                                <p className="text-xs">
                                    <small>
                                        Please include the skipper/master in
                                        this number. If a vessel can operate
                                        with 1 crew + the master then this
                                        number should be 2
                                    </small>
                                </p>
                            </div>
                            <div className="lg:w-1/3 md:w-1/3 w-full mt-2 lg:mt-0 md:mt-0">
                                <label
                                    htmlFor="vessel-maxPax"
                                    className="text-xs font-light block">
                                    Maximum passengers allowed
                                </label>
                                <input
                                    id={`vessel-maxPax`}
                                    type="text"
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    className={classes.input}
                                    placeholder="Maximum passengers"
                                    defaultValue={vessel?.maxPax}
                                />
                            </div>
                            <div className="lg:w-1/3 md:w-1/3 w-full mt-2 lg:mt-0 md:mt-0">
                                <label
                                    htmlFor="vessel-maxPOB"
                                    className="text-xs font-light block">
                                    Maximum people on board
                                </label>
                                <input
                                    id={`vessel-maxPOB`}
                                    type="text"
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    className={classes.input}
                                    placeholder="Max P.O.B"
                                    defaultValue={vessel?.maxPOB}
                                />
                                <p className="text-xs">
                                    <small>
                                        This is the maximum people on board
                                        including the skpper/master.
                                    </small>
                                </p>
                            </div>
                        </div>
                        {/* Engines */}
                        <div className="inline-flex items-center ">
                            <label
                                className="relative flex items-center pr-3 rounded-full cursor-pointer"
                                htmlFor="task-onChangeComplete"
                                data-ripple="true"
                                data-ripple-color="dark"
                                data-ripple-dark="true">
                                <input
                                    type="checkbox"
                                    id="task-onChangeComplete"
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-sky-400 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-sky-500 before:opacity-0 before:transition-opacity checked:border-sky-700 checked:bg-sky-700 before:bg-sky-700 hover:before:opacity-10"
                                    checked={
                                        vessel?.vesselSpecifics
                                            ?.carriesDangerousGoods
                                            ? true
                                            : false
                                    }
                                    onChange={(e: any) => {
                                        setVessel({
                                            ...vessel,
                                            vesselSpecifics: {
                                                ...vessel.vesselSpecifics,
                                                carriesDangerousGoods:
                                                    e.target.checked,
                                            },
                                        })
                                    }}
                                />
                                <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                <span className="ml-3 text-sm font-semibold uppercase">
                                    This vessel is able to carry legally
                                    classified dangerous goods
                                </span>
                            </label>
                        </div>
                        <div className="my-4 pt-4 border-t border-slblue-100">
                            <Heading className="text-xs uppercase font-light ">
                                Engine, fuel, water and sullage configuration
                            </Heading>
                        </div>
                        <div className="my-4">
                            <div className="flex gap-4">
                                <label className="text-xs mb-1 font-light">
                                    Engines / motors
                                </label>
                            </div>
                            <div className="px-4">
                                {vessel?.parentComponent_Components?.nodes
                                    .length > 0 &&
                                    engineList && (
                                        <div className="">
                                            {vessel?.parentComponent_Components?.nodes
                                                .filter(
                                                    (item: any) =>
                                                        item.basicComponent
                                                            .componentCategory ===
                                                        'Engine',
                                                )
                                                .map(
                                                    (
                                                        item: any,
                                                        index: number,
                                                    ) => (
                                                        <Button
                                                            className="flex justify-between text-xs bg-slblue-50 border rounded-lg px-2 py-2 mb-2.5 border-slblue-200 w-1/2 text-sllightblue-800 dark:bg-sldarkblue-900 dark:text-white"
                                                            key={index}
                                                            onPress={() => (
                                                                setOpenEngineDialog(
                                                                    true,
                                                                ),
                                                                handleSetSelectedEngine(
                                                                    item
                                                                        .basicComponent
                                                                        .id,
                                                                )
                                                            )}>
                                                            {
                                                                engineList?.find(
                                                                    (
                                                                        engine: any,
                                                                    ) =>
                                                                        engine.id ==
                                                                        item
                                                                            .basicComponent
                                                                            .id,
                                                                ).title
                                                            }
                                                        </Button>
                                                    ),
                                                )}
                                        </div>
                                    )}
                                <div className="border-t lg:w-1/2 md:w-1/2 w-full border-slblue-100 pt-2">
                                    <SeaLogsButton
                                        text="Add Engine"
                                        type="text"
                                        icon="plus"
                                        isDisabled={
                                            !permissions ||
                                            !hasPermission(
                                                'EDIT_VESSEL',
                                                permissions,
                                            )
                                        }
                                        action={() => (
                                            setOpenEngineDialog(true),
                                            setSelectedEngine(0)
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Fuel Tanks */}
                        <div className="my-4">
                            <div className="flex gap-4">
                                <label className="mb-1 text-xs font-light">
                                    Fuel tanks
                                </label>
                            </div>
                            <div className="px-4">
                                {vessel?.parentComponent_Components?.nodes
                                    .length > 0 &&
                                    fuelTankList && (
                                        <div className="">
                                            {vessel?.parentComponent_Components?.nodes
                                                .filter(
                                                    (item: any) =>
                                                        item.basicComponent
                                                            .componentCategory ===
                                                        'FuelTank',
                                                )
                                                .map(
                                                    (
                                                        item: any,
                                                        index: number,
                                                    ) => (
                                                        <Button
                                                            className="flex w-1/2 justify-between text-xs bg-slblue-50 border rounded-lg px-2 py-2 mb-2.5 border-slblue-200 text-sllightblue-800 dark:bg-sldarkblue-900 dark:text-white"
                                                            key={index}
                                                            onPress={() => (
                                                                setOpenFuelTankDialog(
                                                                    true,
                                                                ),
                                                                handleSetSelectedFuelTank(
                                                                    item
                                                                        .basicComponent
                                                                        .id,
                                                                )
                                                            )}>
                                                            {
                                                                fuelTankList?.find(
                                                                    (
                                                                        fuelTank: any,
                                                                    ) =>
                                                                        fuelTank.id ==
                                                                        item
                                                                            .basicComponent
                                                                            .id,
                                                                )?.title
                                                            }
                                                        </Button>
                                                    ),
                                                )}
                                        </div>
                                    )}
                                <div className="border-t lg:w-1/2 md:w-1/2 w-full border-slblue-100 pt-2">
                                    <SeaLogsButton
                                        text="Add Fuel Tank"
                                        type="text"
                                        isDisabled={
                                            !permissions ||
                                            !hasPermission(
                                                'EDIT_VESSEL',
                                                permissions,
                                            )
                                        }
                                        icon="plus"
                                        action={() => (
                                            setOpenFuelTankDialog(true),
                                            setSelectedFuelTank(0)
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Water Tanks */}
                        <div className="my-4">
                            <div className="flex gap-4">
                                <label className="mb-1 text-xs font-light">
                                    Water tanks
                                </label>
                            </div>
                            <div className="px-4">
                                {vessel?.parentComponent_Components?.nodes
                                    .length > 0 &&
                                    waterTankList && (
                                        <div className="">
                                            {vessel?.parentComponent_Components?.nodes
                                                .filter(
                                                    (item: any) =>
                                                        item.basicComponent
                                                            .componentCategory ===
                                                        'WaterTank',
                                                )
                                                .map(
                                                    (
                                                        item: any,
                                                        index: number,
                                                    ) => (
                                                        <Button
                                                            className="flex w-1/2 justify-between text-xs bg-slblue-50 border rounded-lg px-2 py-2 mb-2.5 border-slblue-200 text-sllightblue-800 dark:bg-sldarkblue-900 dark:text-white"
                                                            key={index}
                                                            onPress={() => (
                                                                setOpenWaterTankDialog(
                                                                    true,
                                                                ),
                                                                handleSetSelectedWaterTank(
                                                                    item
                                                                        .basicComponent
                                                                        .id,
                                                                )
                                                            )}>
                                                            {
                                                                waterTankList?.find(
                                                                    (
                                                                        waterTank: any,
                                                                    ) =>
                                                                        waterTank.id ==
                                                                        item
                                                                            .basicComponent
                                                                            .id,
                                                                ).title
                                                            }
                                                        </Button>
                                                    ),
                                                )}
                                        </div>
                                    )}
                                <div className="border-t lg:w-1/2 md:w-1/2 w-full border-slblue-100 pt-2">
                                    <SeaLogsButton
                                        text="Add Water Tank"
                                        isDisabled={
                                            !permissions ||
                                            !hasPermission(
                                                'EDIT_VESSEL',
                                                permissions,
                                            )
                                        }
                                        type="text"
                                        icon="plus"
                                        action={() => (
                                            setOpenWaterTankDialog(true),
                                            setSelectedWaterTank(0)
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Sewage Systems */}
                        <div className="my-4">
                            <div className="flex gap-4">
                                <label className="mb-1 text-xs font-light">
                                    Sewage system
                                </label>
                            </div>
                            <div className="px-4">
                                {vessel?.parentComponent_Components?.nodes.filter(
                                    (item: any) =>
                                        item.basicComponent
                                            .componentCategory ===
                                        'SewageSystem',
                                ).length > 0 && sewageSystemList ? (
                                    <div className="">
                                        {vessel?.parentComponent_Components?.nodes
                                            .filter(
                                                (item: any) =>
                                                    item.basicComponent
                                                        .componentCategory ===
                                                    'SewageSystem',
                                            )
                                            .map((item: any, index: number) => (
                                                <Button
                                                    className="flex w-1/2 justify-between text-xs bg-slblue-50 border rounded-lg px-2 py-2 mb-2.5 border-slblue-200 text-sllightblue-800 dark:bg-sldarkblue-900 dark:text-white"
                                                    key={index}
                                                    onPress={() => (
                                                        setOpenSewageSystemDialog(
                                                            true,
                                                        ),
                                                        handleSetSelectedSewageSystem(
                                                            item.basicComponent
                                                                .id,
                                                        )
                                                    )}>
                                                    {
                                                        sewageSystemList?.find(
                                                            (
                                                                sewageSystem: any,
                                                            ) =>
                                                                sewageSystem.id ==
                                                                item
                                                                    .basicComponent
                                                                    .id,
                                                        ).title
                                                    }
                                                </Button>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="border-t lg:w-1/2 md:w-1/2 w-full border-slblue-100 pt-2">
                                        <SeaLogsButton
                                            text="Add Sewage System"
                                            type="text"
                                            isDisabled={
                                                !permissions ||
                                                !hasPermission(
                                                    'EDIT_VESSEL',
                                                    permissions,
                                                )
                                            }
                                            icon="plus"
                                            action={() => (
                                                setOpenSewageSystemDialog(true),
                                                setSelectedSewageSystem(0)
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-0 md:px-4 pt-4 border-t">
                <div className="grid cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 lg:pb-4 md:pb-4 lg:pt-3 md:pt-3 px-4">
                    <div className="">
                        <div className="my-4 text-l">
                            Inventory
                            <p className="text-xs mt-4 max-w-[25rem] leading-loose pl-4">
                                Attach inventory items to this vessel. Record
                                uses, create maintenance tasks (one-off and
                                recurring), add manuals and documentation.
                            </p>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <div className="my-4">
                            <div className="flex gap-4">
                                {inventoryList && (
                                    <Select
                                        id="task-inventory"
                                        isClearable
                                        isMulti
                                        isDisabled={
                                            !permissions ||
                                            !hasPermission(
                                                'EDIT_VESSEL',
                                                permissions,
                                            )
                                        }
                                        options={inventoryList}
                                        closeMenuOnSelect={true}
                                        value={vesselInventories}
                                        placeholder="Select Inventory"
                                        onChange={handleInventoryChange}
                                        className={classes.selectMain}
                                        classNames={{
                                            control: () =>
                                                classes.selectControl,
                                            singleValue: () =>
                                                classes.selectSingleValue,
                                            dropdownIndicator: () =>
                                                classes.selectDropdownIndicator,
                                            indicatorSeparator: () =>
                                                classes.selectIndicatorSeparator,
                                            multiValue: () =>
                                                classes.selectMultiValue,
                                            clearIndicator: () =>
                                                classes.selectClearIndicator,
                                            valueContainer: () =>
                                                classes.selectValueContainer +
                                                ' min-h-20 flex !items-start flex-wrap',
                                            menu: () => classes.selectMenu,
                                            option: () => classes.selectOption,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-0 md:px-4 pt-4 border-t">
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 lg:pb-4 md:pb-4 lg:pt-3 md:pt-3 px-4">
                    <div className="">
                        <div className="my-4 text-xl">
                            Crew
                            <p className="text-xs mt-4 max-w-[25rem] leading-loose pl-4">
                                Add or update crew members to this vessel crew
                                list. Linking your crew here will make it faster
                                to add crew to your logbook entries and will
                                help you track the status of your crew's
                                training and qualifications.
                            </p>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <div className="my-4">
                            <div className="flex gap-4">
                                {membersList && (
                                    <Select
                                        id="task-crew"
                                        isClearable
                                        isMulti
                                        isDisabled={
                                            !permissions ||
                                            !hasPermission(
                                                'EDIT_VESSEL',
                                                permissions,
                                            )
                                        }
                                        options={membersList}
                                        closeMenuOnSelect={true}
                                        value={vesselMembers}
                                        placeholder="Select Crew Members"
                                        onChange={handleMemberChange}
                                        className={classes.selectMain}
                                        classNames={{
                                            control: () =>
                                                classes.selectControl,
                                            singleValue: () =>
                                                classes.selectSingleValue,
                                            dropdownIndicator: () =>
                                                classes.selectDropdownIndicator,
                                            indicatorSeparator: () =>
                                                classes.selectIndicatorSeparator,
                                            multiValue: () =>
                                                classes.selectMultiValue,
                                            clearIndicator: () =>
                                                classes.selectClearIndicator,
                                            valueContainer: () =>
                                                classes.selectValueContainer +
                                                ' min-h-20 flex !items-start flex-wrap',
                                            menu: () => classes.selectMenu,
                                            option: () => classes.selectOption,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {localStorage.getItem('useDepartment') === 'true' && (
                <div className="px-0 md:px-4 pt-4 border-t mb-5 lg:mb-0 md:mb-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 lg:gap-6 md:gap-6 lg:pb-4 md:pb-4 lg:pt-3 md:pt-3 px-4">
                        <div className="">
                            <div className="my-4 text-xl">
                                Department
                                <p className="text-xs mt-4 max-w-[25rem] leading-loose pl-4">
                                    lorem ipsum
                                </p>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <div className="my-4">
                                <div className="w-full">
                                    {departmentList && (
                                        <DepartmentMultiSelectDropdown
                                            value={selectedDepartments}
                                            onChange={handleDepartmentChange}
                                            allDepartments={departmentList}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <FooterWrapper>
                <SeaLogsButton
                    text="Cancel"
                    type="text"
                    action={() =>
                        vesselId > 0
                            ? router.push(`/vessel/info?id=${vesselId}`)
                            : router.push('/vessel')
                    }
                />
                {+vesselId > 0 && (
                    <SeaLogsButton
                        text="Archive vessel"
                        type="secondary"
                        icon="trash"
                        color="slred"
                        action={() => setOpenArchiveVesselDialog(true)}
                    />
                )}
                <SeaLogsButton
                    text={`${vesselId > 0 ? 'Update' : 'Create'} vessel`}
                    type="primary"
                    icon="check"
                    color="slblue"
                    action={() => handleUpdate(0)}
                />
            </FooterWrapper>
            <AlertDialog
                openDialog={openEngineDialog}
                setOpenDialog={setOpenEngineDialog}
                handleCreate={handleAddNewEngine}
                actionText={`${selectedEngine > 0 ? 'Update Engine' : 'Add Engine'}`}>
                <div className="bg-slblue-1000 -m-6">
                    <Heading className="text-xl text-white font-medium p-6">
                        {`${selectedEngine > 0 ? 'Update Engine' : 'New Engine'}`}
                    </Heading>
                </div>
                <div className="grid grid-cols-1 gap-4 pt-6 mt-6 text-slblue-700">
                    <div className="flex gap-4">
                        <input
                            id={`engine-title`}
                            type="text"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Title"
                            defaultValue={
                                selectedEngine > 0
                                    ? engineList
                                          .filter(
                                              (engine: any) =>
                                                  engine.id == selectedEngine,
                                          )
                                          .map((engine: any) => engine.title)
                                    : ''
                            }
                        />
                        <input
                            id={`engine-identified`}
                            type="text"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Identifier (abbreviation)"
                            defaultValue={
                                selectedEngine > 0
                                    ? engineList
                                          .filter(
                                              (engine: any) =>
                                                  engine.id == selectedEngine,
                                          )
                                          .map(
                                              (engine: any) =>
                                                  engine?.identifier,
                                          )
                                    : ''
                            }
                        />
                    </div>
                    <div>
                        <Select
                            id="engine-type"
                            isClearable
                            isDisabled={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            options={[
                                { value: 'Main', label: 'Main' },
                                { value: 'Auxiliary', label: 'Auxiliary' },
                                { value: 'Generator', label: 'Generator' },
                            ]}
                            closeMenuOnSelect={true}
                            defaultValue={
                                selectedEngine > 0 &&
                                engineList
                                    .filter(
                                        (engine: any) =>
                                            engine.id == selectedEngine,
                                    )
                                    .map((engine: any) => {
                                        return {
                                            value: engine.type,
                                            label: engine.type,
                                        }
                                    })[0]
                            }
                            placeholder="Type"
                            onChange={(value: any) =>
                                setCurrentData({
                                    ...currentData,
                                    engine: {
                                        ...currentData['engine'],
                                        type: value?.value,
                                    },
                                })
                            }
                            className="w-full bg-slblue-100 rounded dark:bg-gray-800 text-sm"
                            classNames={{
                                control: () =>
                                    'block py-1 w-full !text-sm !text-slblue-700 !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () =>
                                    'dark:!text-white !text-slblue-700',
                                dropdownIndicator: () => '!p-0 !hidden',
                                indicatorSeparator: () => '!hidden',
                                multiValue: () =>
                                    '!bg-slblue-100 inline-block rounded p-1 m-0 !mr-1.5 border border-slblue-200 !rounded-md !text-slblue-700 font-normal mr-2',
                                clearIndicator: () => '!py-0',
                                valueContainer: () => '!py-0',
                            }}
                        />
                    </div>
                    <div className="flex gap-4">
                        <Select
                            id="engine-drive"
                            isDisabled={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            options={[
                                { value: 'Stern drive', label: 'Stern drive' },
                                { value: 'Jet', label: 'Jet' },
                                { value: 'Outboard', label: 'Outboard' },
                                { value: 'Inboard', label: 'Inboard' },
                            ]}
                            closeMenuOnSelect={true}
                            menuPlacement="top"
                            defaultValue={
                                selectedEngine > 0 &&
                                engineList
                                    .filter(
                                        (engine: any) =>
                                            engine.id == selectedEngine,
                                    )
                                    .map((engine: any) => {
                                        return {
                                            value: engine.driveType?.replaceAll(
                                                '_',
                                                ' ',
                                            ),
                                            label: engine.driveType?.replaceAll(
                                                '_',
                                                ' ',
                                            ),
                                        }
                                    })[0]
                            }
                            placeholder="Drive type"
                            onChange={(value: any) =>
                                setCurrentData({
                                    ...currentData,
                                    engine: {
                                        ...currentData['engine'],
                                        driveType: value.value,
                                    },
                                })
                            }
                            className="w-1/2 bg-slblue-100 rounded-lg dark:bg-gray-800 text-sm border border-slblue-200"
                            classNames={{
                                control: () =>
                                    'flex items-center py-1 w-full !text-sm !text-slblue-700 !bg-transparent !rounded-lg !border-0 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () =>
                                    'dark:!text-white !text-slblue-700',
                                dropdownIndicator: () => '!p-0 !hidden',
                                indicatorSeparator: () => '!hidden',
                                multiValue: () =>
                                    '!bg-slblue-100 inline-block rounded p-1 m-0 !mr-1.5 border border-slblue-200 !rounded-md !text-slblue-700 font-normal mr-2',
                                clearIndicator: () => '!py-0',
                                valueContainer: () => '!py-0',
                            }}
                        />
                        <Select
                            id="engine-position"
                            isClearable
                            isDisabled={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            options={[
                                { value: 'Port', label: 'Port' },
                                { value: 'Starboard', label: 'Starboard' },
                                { value: 'Centre', label: 'Centre' },
                            ]}
                            closeMenuOnSelect={true}
                            menuPlacement="top"
                            onChange={(value: any) =>
                                setCurrentData({
                                    ...currentData,
                                    engine: {
                                        ...currentData['engine'],
                                        positionOnVessel: value.value,
                                    },
                                })
                            }
                            defaultValue={
                                selectedEngine > 0 &&
                                engineList
                                    .filter(
                                        (engine: any) =>
                                            engine.id == selectedEngine,
                                    )
                                    .map((engine: any) => {
                                        return {
                                            value: engine.positionOnVessel,
                                            label: engine.positionOnVessel,
                                        }
                                    })[0]
                            }
                            placeholder="Position on vessel"
                            className="w-1/2 bg-slblue-100 rounded-lg dark:bg-gray-800 text-sm border border-slblue-200"
                            classNames={{
                                control: () =>
                                    'flex items-center py-1 w-full !text-sm !text-slblue-700 !bg-transparent !rounded-lg !border-0 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () =>
                                    'dark:!text-white !text-slblue-700',
                                dropdownIndicator: () => '!p-0 !hidden',
                                indicatorSeparator: () => '!hidden',
                                multiValue: () =>
                                    '!bg-slblue-100 inline-block rounded p-1 m-0 !mr-1.5 border border-slblue-200 !rounded-md !text-slblue-700 font-normal mr-2',
                                clearIndicator: () => '!py-0',
                                valueContainer: () => '!py-0',
                            }}
                        />
                    </div>
                    <div className="flex gap-4 border-t border-slblue-100 mt-2 pt-4">
                        <div className="w-1/2">
                            <label
                                htmlFor="engine-make"
                                className="text-xs font-light">
                                Engine make
                            </label>
                            <input
                                id={`engine-make`}
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                type="text"
                                className={classes.input}
                                placeholder="Make"
                                defaultValue={
                                    selectedEngine > 0 &&
                                    engineList
                                        .filter(
                                            (engine: any) =>
                                                engine.id == selectedEngine,
                                        )
                                        .map((engine: any) => engine.make)
                                }
                            />
                        </div>
                        <div className="w-1/2">
                            <label
                                htmlFor="engine-model"
                                className="text-xs font-light">
                                and model
                            </label>
                            <input
                                id={`engine-model`}
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                type="text"
                                className={classes.input}
                                placeholder="Model"
                                defaultValue={
                                    selectedEngine > 0 &&
                                    engineList
                                        .filter(
                                            (engine: any) =>
                                                engine.id == selectedEngine,
                                        )
                                        .map((engine: any) => engine.model)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label
                                htmlFor="engine-kW"
                                className="text-xs font-light">
                                Engine kilowatts
                            </label>
                            <input
                                id={`engine-kW`}
                                type="number"
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                className={classes.input}
                                placeholder="kW"
                                defaultValue={
                                    selectedEngine > 0 &&
                                    engineList
                                        .filter(
                                            (engine: any) =>
                                                engine.id == selectedEngine,
                                        )
                                        .map((engine: any) => engine.kW)
                                }
                            />
                        </div>
                        <div className="w-1/2">
                            <label
                                htmlFor="engine-model"
                                className="text-xs font-light">
                                Genset kilovolt-amperes
                            </label>
                            <input
                                id={`engine-kVA`}
                                type="number"
                                className={classes.input}
                                placeholder="kVA"
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                defaultValue={
                                    selectedEngine > 0 &&
                                    engineList
                                        .filter(
                                            (engine: any) =>
                                                engine.id == selectedEngine,
                                        )
                                        .map((engine: any) => engine.kVA)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label
                                htmlFor="engine-hours"
                                className="text-xs font-light">
                                Current engine hours
                            </label>
                            <input
                                id={`engine-hours`}
                                type="number"
                                className={classes.input}
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                placeholder="Current hours"
                                defaultValue={
                                    selectedEngine > 0 &&
                                    engineList
                                        .filter(
                                            (engine: any) =>
                                                engine.id == selectedEngine,
                                        )
                                        .map(
                                            (engine: any) =>
                                                engine?.currentHours,
                                        )
                                }
                            />
                        </div>
                        <div className="w-1/2">
                            <label
                                htmlFor="engine-power"
                                className="text-xs font-light">
                                Max engine powers
                            </label>
                            <input
                                id={`engine-power`}
                                type="number"
                                className={classes.input}
                                placeholder="Max power"
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                defaultValue={
                                    selectedEngine > 0 &&
                                    engineList
                                        .filter(
                                            (engine: any) =>
                                                engine.id == selectedEngine,
                                        )
                                        .map((engine: any) => engine?.maxPower)
                                }
                            />
                        </div>
                    </div>
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openFuelTankDialog}
                setOpenDialog={setOpenFuelTankDialog}
                handleCreate={handleAddNewFuelTank}
                actionText={`${selectedFuelTank > 0 ? 'Update Fuel Tank' : 'Add Fuel Tank'}`}>
                <div className="bg-slblue-1000 -m-6">
                    <Heading className="text-xl text-white font-medium p-6">
                        {`${selectedFuelTank > 0 ? 'Update Fuel Tank' : 'New Fuel Tank'}`}
                    </Heading>
                </div>
                <div className="grid grid-cols-1 gap-4 text-slblue-700 mt-6 pt-6">
                    <div className="flex gap-4">
                        <input
                            id={`fuel-tank-title`}
                            type="text"
                            className={`${classes.input} !text-slblue-700`}
                            placeholder="Title"
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            defaultValue={
                                selectedFuelTank > 0
                                    ? fuelTankList
                                          .filter(
                                              (fuelTank: any) =>
                                                  fuelTank.id ==
                                                  selectedFuelTank,
                                          )
                                          .map(
                                              (fuelTank: any) => fuelTank.title,
                                          )
                                    : ''
                            }
                        />
                        <input
                            id={`fuel-tank-identified`}
                            type="text"
                            className={classes.input}
                            placeholder="Identifier (abbreviation)"
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            defaultValue={
                                selectedFuelTank > 0
                                    ? fuelTankList
                                          .filter(
                                              (fuelTank: any) =>
                                                  fuelTank.id ==
                                                  selectedFuelTank,
                                          )
                                          .map(
                                              (fuelTank: any) =>
                                                  fuelTank.identifier,
                                          )
                                    : ''
                            }
                        />
                    </div>
                    <div className="flex gap-4">
                        {/* safeFuelCapacity */}
                        <div className="w-1/2">
                            <label className="block font-light text-xs">
                                Safe fuel capacity
                            </label>
                            <input
                                id={`fuel-tank-safeCapacity`}
                                type="number"
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                className={`${classes.input} grow`}
                                placeholder="Safe fuel level"
                                defaultValue={
                                    selectedFuelTank > 0
                                        ? fuelTankList
                                              .filter(
                                                  (fuelTank: any) =>
                                                      fuelTank.id ==
                                                          selectedFuelTank &&
                                                      fuelTank.safeFuelCapacity >
                                                          0,
                                              )
                                              .map(
                                                  (fuelTank: any) =>
                                                      fuelTank.safeFuelCapacity,
                                              )
                                        : ''
                                }
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block font-light text-xs">
                                Maximum fuel capacity
                            </label>
                            <input
                                id={`fuel-tank-capacity`}
                                type="number"
                                className={`${classes.input} grow`}
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                placeholder="Max fuel level"
                                defaultValue={
                                    selectedFuelTank > 0
                                        ? fuelTankList
                                              .filter(
                                                  (fuelTank: any) =>
                                                      fuelTank.id ==
                                                          selectedFuelTank &&
                                                      fuelTank.capacity > 0,
                                              )
                                              .map(
                                                  (fuelTank: any) =>
                                                      fuelTank.capacity,
                                              )
                                        : ''
                                }
                            />
                        </div>
                        {/* <Select
                            id='fuel-tank-gauge'
                            isClearable
                            options={[
                                { value: 'Litres', label: 'Litres' },
                                { value: 'Gallons', label: 'Gallons' },
                            ]}
                            closeMenuOnSelect={true}
                            onChange={(value: any) => setCurrentData({ ...currentData, fuelTank: { ...currentData['fuelTank'], capacityUnit: value.value } })}
                            placeholder='Capacity Unit (does not exists in DB)'
                            className='w-1/2 bg-gray-100 rounded-lg grow dark:bg-gray-800 text-sm border border-gray-200'
                            classNames={{
                                control: () => "block py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border-0 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500",
                                singleValue: () => "dark:!text-white",
                                dropdownIndicator: () => "!p-0 !hidden",
                                indicatorSeparator: () => "!hidden",
                                multiValue: () => "!bg-sky-100 inline-block rounded p-1 m-0 !mr-1.5 !rounded-md !text-sky-900 font-normal mr-2",
                                clearIndicator: () => "!py-0",
                                valueContainer: () => "!py-0",
                            }}
                        /> */}
                        {/* </div> */}
                        {/* <div> */}
                        {/* DR: Agreed with Kylie that we will not use this at the moment

                        <Select
                            id="fuel-tank-engines"
                            isClearable
                            isMulti
                            options={engineList?.map((engine: any) => {
                                return { value: engine.id, label: engine.title }
                            })}
                            closeMenuOnSelect={true}
                            onChange={(value: any) =>
                                setCurrentData({
                                    ...currentData,
                                    fuelTank: {
                                        ...currentData['fuelTank'],
                                        engines: value.map(
                                            (item: any) => item.value,
                                        ),
                                    },
                                })
                            }
                            placeholder="Engines using this fuel tank (This does not exist in DB)"
                            className="w-full bg-gray-100 rounded dark:bg-gray-800 text-sm"
                            classNames={{
                                control: () =>
                                    'block py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () => 'dark:!text-white',
                                dropdownIndicator: () => '!p-0 !hidden',
                                indicatorSeparator: () => '!hidden',
                                multiValue: () =>
                                    '!bg-sky-100 inline-block rounded p-1 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                                clearIndicator: () => '!py-0',
                                valueContainer: () => '!py-0 h-20 !items-start',
                            }}
                        /> */}
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block font-light text-xs">
                                Fuel type
                            </label>
                            <Select
                                id="fuel-tank-type"
                                isClearable
                                isDisabled={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                options={[
                                    {
                                        value: 'Unleaded 91',
                                        label: 'Unleaded 91',
                                    },
                                    {
                                        value: 'Unleaded 95',
                                        label: 'Unleaded 95',
                                    },
                                    { value: 'Diesel', label: 'Diesel' },
                                    { value: 'Other', label: 'Other' },
                                ]}
                                closeMenuOnSelect={true}
                                placeholder="Select"
                                onChange={(value: any) =>
                                    setCurrentData({
                                        ...currentData,
                                        fuelTank: {
                                            ...currentData['fuelTank'],
                                            fuelType: value.value,
                                        },
                                    })
                                }
                                defaultValue={
                                    selectedFuelTank > 0
                                        ? fuelTankList
                                              .filter(
                                                  (fuelTank: any) =>
                                                      fuelTank.id ==
                                                          selectedFuelTank &&
                                                      fuelTank.fuelType != null,
                                              )
                                              .map((fuelTank: any) => {
                                                  return {
                                                      value: fuelTank.fuelType,
                                                      label: fuelTank.fuelType,
                                                  }
                                              })[0]
                                        : ''
                                }
                                className={classes.selectMain}
                                classNames={{
                                    control: () =>
                                        'flex py-0.5 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                    singleValue: () => 'dark:!text-white',
                                    menu: () => 'dark:bg-gray-800',
                                    option: () => classes.selectOption,
                                }}
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block font-light text-xs">
                                Current fuel level
                            </label>
                            <input
                                type="number"
                                className={`${classes.input} grow`}
                                readOnly={
                                    !permissions ||
                                    !hasPermission('EDIT_VESSEL', permissions)
                                }
                                value={
                                    currentData['fuelTank']?.currentLevel
                                    // selectedFuelTank > 0
                                    //     ? fuelTankList
                                    //           .filter(
                                    //               (fuelTank: any) =>
                                    //                   fuelTank.id ==
                                    //                       selectedFuelTank &&
                                    //                   fuelTank.currentLevel > 0,
                                    //           )
                                    //           .map((fuelTank: any) => {
                                    //               return fuelTank.currentLevel
                                    //           })[0]
                                    //     : ''
                                }
                                onChange={(e) =>
                                    setCurrentData({
                                        ...currentData,
                                        fuelTank: {
                                            ...currentData['fuelTank'],
                                            currentLevel: e.target.value,
                                        },
                                    })
                                }
                            />
                            {/* <Select
                                id="fuel-tank-dip"
                                isClearable
                                options={[
                                    {
                                        value: 'Centimetres',
                                        label: 'Centimetres',
                                    },
                                    { value: 'Percent', label: 'Percent' },
                                ]}
                                closeMenuOnSelect={true}
                                placeholder="CHANGE THIS"
                                onChange={(value: any) =>
                                    setCurrentData({
                                        ...currentData,
                                        fuelTank: {
                                            ...currentData['fuelTank'],
                                            dipType: value.value,
                                        },
                                    })
                                }
                                defaultValue={
                                    selectedFuelTank > 0
                                        ? fuelTankList
                                              .filter(
                                                  (fuelTank: any) =>
                                                      fuelTank.id ==
                                                          selectedFuelTank &&
                                                      fuelTank.dipType != null,
                                              )
                                              .map((fuelTank: any) => {
                                                  return {
                                                      value: fuelTank.dipType,
                                                      label: fuelTank.dipType,
                                                  }
                                              })[0]
                                        : ''
                                }
                                className="w-full bg-gray-100 rounded dark:bg-gray-800 text-sm"
                                classNames={{
                                    control: () =>
                                        'block py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                    singleValue: () => 'dark:!text-white',
                                    dropdownIndicator: () => '!p-0 !hidden',
                                    indicatorSeparator: () => '!hidden',
                                    multiValue: () =>
                                        '!bg-sky-100 inline-block rounded p-1 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                                    clearIndicator: () => '!py-0',
                                    valueContainer: () => '!py-0',
                                }}
                            /> */}
                        </div>
                    </div>
                    {/* <div>
                            DR: I commented this out for the timebeing while I confirm with Kylie
                            <label className="mb-1 text-sm">
                                Upload a Conversion CSV file
                            </label>
                            <input
                                id={`fuel-tank-csv`}
                                type="file"
                                className={classes.input}
                                placeholder="Conversion CSV file"
                            />
                        </div> */}
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openWaterTankDialog}
                setOpenDialog={setOpenWaterTankDialog}
                handleCreate={handleAddNewWaterTank}
                actionText={`${selectedWaterTank > 0 ? 'Update Water Tank' : 'Add Water Tank'}`}>
                <div className="bg-slblue-1000 -m-6">
                    <Heading className="text-xl text-white font-medium p-6">
                        {`${selectedWaterTank > 0 ? 'Update Water Tank' : 'New Water Tank'}`}
                    </Heading>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-6 pt-6 text-slblue-700">
                    <div className="flex gap-4">
                        <input
                            id={`water-tank-title`}
                            type="text"
                            className={`${classes.input} !text-slblue-700`}
                            placeholder="Title"
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            defaultValue={
                                selectedWaterTank > 0
                                    ? waterTankList
                                          .filter(
                                              (waterTank: any) =>
                                                  waterTank.id ==
                                                  selectedWaterTank,
                                          )
                                          .map(
                                              (waterTank: any) =>
                                                  waterTank.title,
                                          )
                                    : ''
                            }
                        />
                        <input
                            id={`water-tank-identified`}
                            type="text"
                            className={classes.input}
                            placeholder="Identifier (abbreviation)"
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            defaultValue={
                                selectedWaterTank > 0
                                    ? waterTankList
                                          .filter(
                                              (waterTank: any) =>
                                                  waterTank.id ==
                                                  selectedWaterTank,
                                          )
                                          .map(
                                              (waterTank: any) =>
                                                  waterTank.identifier,
                                          )
                                    : ''
                            }
                        />
                    </div>
                    <div className="flex gap-4">
                        <input
                            id={`water-tank-capacity`}
                            type="number"
                            className={`${classes.input}`}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Fresh Water Capacity"
                            defaultValue={
                                selectedWaterTank > 0
                                    ? waterTankList
                                          .filter(
                                              (waterTank: any) =>
                                                  waterTank.id ==
                                                      selectedWaterTank &&
                                                  waterTank.capacity > 0,
                                          )
                                          .map(
                                              (waterTank: any) =>
                                                  waterTank.capacity,
                                          )
                                    : ''
                            }
                        />
                    </div>
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openSewageSystemDialog}
                setOpenDialog={setOpenSewageSystemDialog}
                handleCreate={handleAddNewSewageSystem}
                actionText={`${selectedSewageSystem > 0 ? 'Update Sewage System' : 'Add Sewage System'}`}>
                <div className="bg-slblue-1000 -m-6">
                    <Heading className="text-xl text-white font-medium p-6">
                        {`${selectedSewageSystem > 0 ? 'Update Sewage System' : 'New Sewage System'}`}
                    </Heading>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-6 pt-6 text-slblue-700">
                    <div className="flex gap-4">
                        <input
                            id={`sewage-system-title`}
                            type="text"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Title"
                            defaultValue={
                                selectedSewageSystem > 0
                                    ? sewageSystemList
                                          .filter(
                                              (sewageSystem: any) =>
                                                  sewageSystem.id ==
                                                  selectedSewageSystem,
                                          )
                                          .map(
                                              (sewageSystem: any) =>
                                                  sewageSystem.title,
                                          )
                                    : ''
                            }
                        />
                        <input
                            id={`sewage-system-identified`}
                            type="text"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Identified (abbreviation)"
                            defaultValue={
                                selectedSewageSystem > 0
                                    ? sewageSystemList
                                          .filter(
                                              (sewageSystem: any) =>
                                                  sewageSystem.id ==
                                                  selectedSewageSystem,
                                          )
                                          .map(
                                              (sewageSystem: any) =>
                                                  sewageSystem.identifier,
                                          )
                                    : ''
                            }
                        />
                    </div>
                    <div className="flex gap-4">
                        <input
                            id={`sewage-system-numberOfTanks`}
                            type="number"
                            className={`${classes.input}`}
                            placeholder="Number of Tanks"
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            defaultValue={
                                selectedSewageSystem > 0
                                    ? sewageSystemList
                                          .filter(
                                              (sewageSystem: any) =>
                                                  sewageSystem.id ==
                                                      selectedSewageSystem &&
                                                  sewageSystem.numberOfTanks >
                                                      0,
                                          )
                                          .map(
                                              (sewageSystem: any) =>
                                                  sewageSystem.numberOfTanks,
                                          )
                                    : ''
                            }
                        />
                        <input
                            id={`sewage-system-capacity`}
                            type="number"
                            className={`${classes.input}`}
                            placeholder="Capacity"
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            defaultValue={
                                selectedSewageSystem > 0
                                    ? sewageSystemList
                                          .filter(
                                              (sewageSystem: any) =>
                                                  sewageSystem.id ==
                                                      selectedSewageSystem &&
                                                  sewageSystem.capacity > 0,
                                          )
                                          .map(
                                              (sewageSystem: any) =>
                                                  sewageSystem.capacity,
                                          )
                                    : ''
                            }
                        />
                    </div>
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openCreateInventoryDialog}
                setOpenDialog={setOpenCreateInventoryDialog}
                handleCreate={handleAddNewInventory}
                actionText="Add Inventory">
                <Heading className="text-xl font-medium mb-4">
                    Add Inventory
                </Heading>
                <div className="grid grid-cols-1 gap-4 border-t pt-6">
                    <div className="flex gap-4">
                        <input
                            id={`inventory-item`}
                            type="text"
                            className={classes.input}
                            placeholder="Title"
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                        />
                        <input
                            id={`inventory-code`}
                            type="text"
                            className={classes.input}
                            placeholder="Product Code"
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                        />
                    </div>
                    <div className="flex gap-4">
                        <input
                            id={`inventory-qty`}
                            type="number"
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            className={classes.input}
                            placeholder="Quantity"
                        />
                        <input
                            id={`inventory-cost`}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            type="text"
                            className={classes.input}
                            placeholder="Costing Details"
                        />
                    </div>
                    {/* inventoryCategories */}
                    <div>
                        <Select
                            id="inventory-category"
                            isClearable
                            options={inventoryCategories}
                            isDisabled={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            closeMenuOnSelect={true}
                            placeholder="Category"
                            value={selectedInventoryCategory}
                            onChange={handleSetInventoryCategory}
                            className="w-full bg-gray-100 rounded dark:bg-gray-800 text-sm"
                            classNames={{
                                control: () =>
                                    'block py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-slblue-200 focus:ring-slblue-500 focus:border-slblue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500',
                                singleValue: () => 'dark:!text-white',
                                dropdownIndicator: () => '!p-0 !hidden',
                                indicatorSeparator: () => '!hidden',
                                multiValue: () =>
                                    '!bg-sky-100 inline-block rounded p-1 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2',
                                clearIndicator: () => '!py-0',
                                valueContainer: () => '!py-0',
                            }}
                        />
                    </div>
                    <div>
                        <input
                            id={`inventory-location`}
                            type="text"
                            className={classes.input}
                            placeholder="Location"
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                        />
                    </div>
                    <div>
                        <textarea
                            id={`inventory-short-description`}
                            className={classes.textarea}
                            placeholder="Description"
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                        />
                    </div>
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openCreateMemberDialog}
                setOpenDialog={setOpenCreateMemberDialog}
                handleCreate={handleAddNewMember}
                actionText="Add Crew Member">
                <Heading className="text-xl font-medium mb-4">
                    Add Crew Member
                </Heading>
                <div className="grid grid-cols-1 gap-4 border-t pt-6">
                    <div className="flex gap-4">
                        <input
                            id={`crew-firstName`}
                            type="text"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="First Name"
                        />
                        <input
                            id={`crew-surname`}
                            type="text"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Surname"
                        />
                    </div>
                    <div className="flex gap-4">
                        <input
                            id={`crew-username`}
                            type="text"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Username"
                        />
                        <input
                            id={`crew-password`}
                            type="password"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Password"
                        />
                    </div>
                    <div className="flex gap-4">
                        <input
                            id={`crew-email`}
                            type="email"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Email"
                        />
                        <input
                            id={`crew-phoneNumber`}
                            type="text"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Phone Number"
                        />
                    </div>
                    {error && (
                        <div className="text-xs text-rose-600">
                            {error.message}
                        </div>
                    )}
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openCreateInventoryCategoryDialog}
                setOpenDialog={setOpenCreateInventoryCategoryDialog}
                actionText="Create Category"
                handleCreate={handleAddNewInventoryCategory}>
                <Heading className="text-xl font-medium mb-4">
                    Create Inventory Category
                </Heading>
                <div className="grid grid-cols-1 gap-4 border-t pt-6">
                    <div>
                        <input
                            id={`inventory-category-title`}
                            type="text"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Title"
                        />
                    </div>
                    <div>
                        <input
                            id={`inventory-category-abbreviation`}
                            type="text"
                            className={classes.input}
                            readOnly={
                                !permissions ||
                                !hasPermission('EDIT_VESSEL', permissions)
                            }
                            placeholder="Abbreviation"
                        />
                    </div>
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openArchiveVesselDialog}
                setOpenDialog={setOpenArchiveVesselDialog}
                handleCreate={handleDelete}
                actionText="Archive Vessel">
                <Heading
                    slot="title"
                    className="text-2xl font-light leading-6 my-2 text-gray-700 dark:text-white">
                    Archive Vessel
                </Heading>
                <div className="my-4 flex items-center">
                    Are you sure you want to archive this vessel?
                </div>
            </AlertDialog>
            <AlertDialog
                openDialog={openVesselImageDialog}
                setOpenDialog={setOpenVesselImageDialog}
                handleCreate={handleVesselIcon}
                actionText="Save">
                <div className="my-4 flex items-center w-full">
                    <Button
                        onPress={() => setVesselIconMode('Icon')}
                        className={`flex items-center w-1/2 justify-center hover:bg-sldarkblue-800 hover:text-white p-4 cursor-pointer border ${vesselIconMode === 'Icon' ? 'bg-sldarkblue-800 text-white' : 'bg-slblue-300'}`}>
                        Icon
                    </Button>
                    <Button
                        onPress={() => setVesselIconMode('Photo')}
                        className={`flex items-center w-1/2 justify-center hover:bg-sldarkblue-800 hover:text-white p-4 cursor-pointer border ${vesselIconMode === 'Photo' ? 'bg-sldarkblue-800 text-white' : 'bg-slblue-300'}`}>
                        Photo
                    </Button>
                </div>
                {vesselIconMode === 'Icon' && (
                    <div className="h-56 overflow-auto">
                        {vesselIconList.map((icon: any, index: number) => (
                            <label
                                className="relative flex items-center px-3 cursor-pointer w-full border-b"
                                htmlFor={`vesselIcon${icon.title}-onChangeComplete`}
                                data-ripple="true"
                                data-ripple-color="dark"
                                data-ripple-dark="true">
                                <input
                                    type="checkbox"
                                    id={`vesselIcon${icon.title}-onChangeComplete`}
                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-sky-400 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-sky-500 before:opacity-0 before:transition-opacity checked:border-sky-700 checked:bg-sky-700 before:bg-sky-700 hover:before:opacity-10"
                                    checked={vesselIcon == icon.title}
                                    readOnly={
                                        !permissions ||
                                        !hasPermission(
                                            'EDIT_VESSEL',
                                            permissions,
                                        )
                                    }
                                    onChange={(e: any) => {
                                        setVesselIcon(
                                            e.target.checked && icon.title,
                                        )
                                    }}
                                />
                                <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                <span className="ml-4 text-sm font-semibold uppercase w-full">
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-2 w-full">
                                        <div className="flex items-center gap-4 w-full">
                                            <img
                                                src={`/vessel-icons/${icon.icon}`}
                                                alt="icon"
                                                className="w-6 h-6"
                                            />
                                            <div>{icon.title}</div>
                                        </div>
                                    </div>
                                </span>
                            </label>
                        ))}
                    </div>
                )}
                {vesselIconMode === 'Photo' && (
                    <div className="flex w-full gap-4">
                        {vesselPhoto.length > 0 &&
                            vesselPhoto.map((photo: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between w-1/2">
                                    <div className="flex items-center gap-4 w-full">
                                        <img
                                            src={`${process.env.FILE_BASE_URL + photo.fileFilename}`}
                                            alt="icon"
                                            className="h-56 object-cover w-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        <div
                            className={`${vesselPhoto.length > 0 ? 'w-1/2' : 'w-full'}`}>
                            <FileUpload
                                setDocuments={setVesselPhoto}
                                text="Vessel Photo"
                                documents={vesselPhoto}
                                multipleUpload={false}
                            />
                        </div>
                    </div>
                )}
            </AlertDialog>
        </div>
    )
}
