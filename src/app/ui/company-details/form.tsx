import {
    FooterWrapper,
    SeaLogsButton,
    TableWrapper,
} from '@/app/components/Components'
import CountryDropdown from '@/app/components/CountryDropdown'
import { classes } from '@/app/components/GlobalClasses'
import TimezoneDropdown from '@/app/components/TimezoneDropdown'
import { UPDATE_ADDRESS, UPDATE_CLIENT } from '@/app/lib/graphQL/mutation'
import { READ_ONE_CLIENT, GET_FILES } from '@/app/lib/graphQL/query'
import { useLazyQuery, useMutation } from '@apollo/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Heading, ListBox, ListBoxItem } from 'react-aria-components'
import Image from 'next/image'
import FileUpload from '../file-upload'
import FileItem from '@/app/components/FileItem'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { isAdmin } from '@/app/helpers/userHelper'
import Loading from '@/app/loading'
import { formatDate } from '@/app/helpers/dateHelper'

const CompanyDetailsForm = () => {
    const [isUserAdmin, setIsUserAdmin] = useState<any>(-1)
    const [uploadImagedUrl, setUploadImagedUrl] = useState<any>('')
    const [uploadImagedID, setUploadImagedID] = useState<any>(null)
    const [uploadIconLogoUrl, setUploadIconLogoUrl] = useState<any>('')
    const [useDepartment, setUseDepartment] = useState<any>(false)
    const [uploadIconLogoID, setUploadIconLogoID] = useState<any>(null)
    const [Files, setFiles] = useState<any>([])
    const [imageLoader, setImageLoader] = useState(false)
    const [iconLogoLoader, setIconLogoLoader] = useState(false)
    const [documents, setDocuments] = useState<Array<Record<string, any>>>([])
    const router = useRouter()
    useEffect(() => {
        setIsUserAdmin(isAdmin())
    }, [])
    const notifications = [
        'Notifications for New Log Entries',
        'Notifications for New Trip Reports',
        'Notifications for New Trip Events',
        'Notifications for New Field Comments',
        'Notifications for New Tasks',
        'Notifications for New SMU Meter Readings',
    ]
    const [selectedTab, setSelectedTab] = useState('detail')

    const [companyDetails, setCompanyDetails] = useState<any>({})
    const [updateClient, { loading: updateClientLoading }] = useMutation(
        UPDATE_CLIENT,
        {
            onCompleted: (response) => {
                const data = response.updateClient
                localStorage.setItem('clientTitle', companyDetails.title)
                localStorage.setItem('clientId', companyDetails.id)
            },
            onError: (error) => {
                console.error('updateClient error', error)
            },
        },
    )
    const [updateAddress, { loading: updateAddressLoading }] = useMutation(
        UPDATE_ADDRESS,
        {
            onCompleted: (response) => {
                const data = response.updateAddress
            },
            onError: (error) => {
                console.error('updateAddress error', error)
            },
        },
    )
    const handleSaveDetails = async () => {
        if (selectedTab === 'detail') {
            const details = {
                ...companyDetails,
                documents: companyDetails.documents.nodes
                    .map((doc: any) => doc.id)
                    .join(','),
            }
            delete details.__typename
            delete details.hqAddress

            await updateClient({
                variables: {
                    input: details,
                },
            })
            const hqAddress = { ...companyDetails.hqAddress }
            if (hqAddress) {
                if (hqAddress.__typename) delete hqAddress.__typename
                await updateAddress({
                    variables: {
                        input: hqAddress,
                    },
                })
            }
        }
        if (selectedTab === 'setup') {
            const maritimeTrafficFleetEmail = (
                document.querySelector(
                    'input[name=maritimeTrafficFleetEmail]',
                ) as HTMLInputElement
            ).value
            const masterTerm = (
                document.querySelector(
                    'input[name=masterTerm]',
                ) as HTMLInputElement
            ).value

            await updateClient({
                variables: {
                    input: {
                        id: companyDetails.id,
                        maritimeTrafficFleetEmail: maritimeTrafficFleetEmail
                            ? maritimeTrafficFleetEmail
                            : companyDetails.maritimeTrafficFleetEmail,
                        masterTerm: masterTerm
                            ? masterTerm
                            : companyDetails.masterTerm,
                        useDepartment: useDepartment,
                    },
                },
            })
        }

        if (selectedTab === 'document') {
            await updateClient({
                variables: {
                    input: {
                        id: companyDetails.id,
                        documents: documents
                            .map((doc: any) => doc.id)
                            .join(','),
                    },
                },
            })
        }
    }
    const [readOneClient, { loading: readOneClientLoading }] = useLazyQuery(
        READ_ONE_CLIENT,
        {
            fetchPolicy: 'cache-and-network',
            onCompleted: (response) => {
                const data = response.readOneClient
                if (data) {
                    setCompanyDetails(data)
                    getFileDetails({
                        variables: {
                            id: [data.logoID],
                        },
                    })
                    getIconLogoDetails({
                        variables: {
                            id: [data.iconLogoID],
                        },
                    })
                    setDocuments(data.documents.nodes)
                    setUseDepartment(data.useDepartment)
                }
            },
            onError: (error) => {
                console.error('readOneClient error', error)
            },
        },
    )
    const loadCompanyDetails = async () => {
        await readOneClient({
            variables: {
                filter: {
                    id: { eq: +(localStorage.getItem('clientId') ?? 0) },
                },
            },
        })
    }
    const handleCountryChange = (country: any) => {
        setCompanyDetails({
            ...companyDetails,
            hqAddress: {
                ...companyDetails.hqAddress,
                country: country.value,
            },
        })
    }
    const handleTimezoneChange = (timezone: any) => {
        setCompanyDetails({
            ...companyDetails,
            hqAddress: {
                ...companyDetails.hqAddress,
                timeZone: timezone.value,
            },
        })
    }
    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        setCompanyDetails({
            ...companyDetails,
            [name]: value,
        })
    }
    const handleAddressChange = (e: any) => {
        const { name, value } = e.target
        setCompanyDetails({
            ...companyDetails,
            hqAddress: {
                ...companyDetails.hqAddress,
                [name]: value,
            },
        })
    }

    function handleImageChange(e: any) {
        setImageLoader(true)
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            for (let i = 0; i < e.target.files['length']; i++) {
                setFiles((prevState: any) => [...prevState, e.target.files[i]])
                uploadFile(e.target.files[i])
            }
        }
    }
    function handleIconLogoChange(e: any) {
        setIconLogoLoader(true)
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            for (let i = 0; i < e.target.files['length']; i++) {
                setFiles((prevState: any) => [...prevState, e.target.files[i]])
                uploadIconLogoFile(e.target.files[i])
            }
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
            setCompanyDetails({
                ...companyDetails,
                ['logoID']: JSON.stringify(data[0].id),
            })
            setImageLoader(false)
        } catch (err) {
            console.error(err)
            setImageLoader(false)
        }
    }

    async function uploadIconLogoFile(file: any) {
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
            setUploadIconLogoUrl(data[0].location)
            setUploadIconLogoID(data[0].id)
            setCompanyDetails({
                ...companyDetails,
                ['iconLogoID']: data[0].id,
            })
            setIconLogoLoader(false)
        } catch (err) {
            console.error(err)
            setIconLogoLoader(false)
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
    const [getIconLogoDetails] = useLazyQuery(GET_FILES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const data = response.readFiles.nodes
            setUploadIconLogoUrl(
                process.env.FILE_BASE_URL + data[0].fileFilename,
            )
        },
        onError: (error) => {
            console.error(error)
        },
    })

    const deleteFile = async (fileId: number) => {
        const newDocuments = documents.filter((doc: any) => doc.id !== fileId)
        setDocuments(newDocuments)
        await updateClient({
            variables: {
                input: {
                    id: companyDetails.id,
                    documents: newDocuments.map((doc: any) => doc.id).join(','),
                },
            },
        })
    }

    const handleSetUseDepartment = (e: any) => {
        localStorage.setItem('useDepartment', e.toString())
        setUseDepartment(e)
    }

    useEffect(() => {
        loadCompanyDetails()
    }, [])

    return (
        <div className="w-full p-0 dark:text-white border border-slblue-50 bg-blue-50 dark:bg-sldarkblue-800">
            {isUserAdmin === false ? (
                <Loading errorMessage="Oops! You do not have the permission to view this section." />
            ) : (
                <>
                    <div className="flex justify-between px-8 py-3 items-center bg-sldarkblue-900 rounded-t-lg">
                        <Heading className="font-light font-monasans text-2xl text-white">
                            <span className="font-medium">Company</span>
                            {companyDetails?.title
                                ? ': ' + companyDetails?.title
                                : ''}
                        </Heading>
                    </div>
                    <div className="py-5 ml-[1px]">
                        <div className="flex justify-start flex-col md:flex-row items-start px-3">
                            <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-100 gap-2">
                                <li>
                                    <Button
                                        className={`${selectedTab === 'detail' ? classes.active : classes.inactive}`}
                                        onPress={() =>
                                            setSelectedTab('detail')
                                        }>
                                        Details
                                    </Button>
                                </li>
                                <li>
                                    <Button
                                        className={`${selectedTab === 'subscription' ? classes.active : classes.inactive}`}
                                        onPress={() =>
                                            setSelectedTab('subscription')
                                        }>
                                        Subscription
                                    </Button>
                                </li>
                                <li>
                                    <Button
                                        className={`${selectedTab === 'setup' ? classes.active : classes.inactive}`}
                                        onPress={() => setSelectedTab('setup')}>
                                        SeaLogs Setup
                                    </Button>
                                </li>
                                <li>
                                    <Button
                                        className={`${selectedTab === 'notification' ? classes.active : classes.inactive}`}
                                        onPress={() =>
                                            setSelectedTab('notification')
                                        }>
                                        Notifications
                                    </Button>
                                </li>
                                <li>
                                    <Button
                                        className={`${selectedTab === 'document' ? classes.active : classes.inactive}`}
                                        onPress={() =>
                                            setSelectedTab('document')
                                        }>
                                        Company-Wide Documents
                                    </Button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="w-full dark:text-white">
                        {selectedTab === 'detail' && (
                            <>
                                <div className="border-t py-4">
                                    <div className="grid grid-cols-3 gap-4 pb-4 pt-3 px-4 mb-2">
                                        <div className="my-4 text-l">
                                            Company Details
                                            <p className="text-xs mt-4 max-w-[25rem] leading-loose font-light">
                                                Lorem ipsum dolor sit amet
                                                consectetur adipisicing elit.
                                                Facilis possimus harum eaque
                                                itaque est id reprehenderit
                                                excepturi eius temporibus, illo
                                                officia amet nobis sapiente
                                                dolorem ipsa earum adipisci
                                                recusandae cumque.
                                            </p>
                                        </div>
                                        <div className="col-span-2 block pb-3 px-7 bg-white border-slblue-200 rounded-lg dark:bg-sldarkblue-800 dark:border">
                                            <div className="mb-4 text-center">
                                                {/* <small className="text-red-500">
                                                {hasFormErrors &&
                                                    formErrors.response}
                                            </small> */}
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex grow flex-col mb-4">
                                                    <div className="flex items-center">
                                                        <input
                                                            name="title"
                                                            placeholder="Title"
                                                            type="text"
                                                            className={
                                                                classes.input
                                                            }
                                                            required
                                                            defaultValue={
                                                                companyDetails?.title ||
                                                                ''
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                        />
                                                    </div>
                                                    {/* <small className="text-red-500">
                                                    {hasFormErrors &&
                                                        formErrors.firstName}
                                                </small> */}
                                                </div>
                                                <div className="flex grow flex-col mb-4">
                                                    <div className="flex items-center">
                                                        <input
                                                            name="phone"
                                                            placeholder="Phone Number"
                                                            type="tel"
                                                            className={
                                                                classes.input
                                                            }
                                                            defaultValue={
                                                                companyDetails?.phone ||
                                                                ''
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex grow flex-col mb-4">
                                                    <div className="flex items-center">
                                                        <input
                                                            name="adminEmail"
                                                            type="email"
                                                            placeholder="Admin Email"
                                                            className={
                                                                classes.input
                                                            }
                                                            defaultValue={
                                                                companyDetails?.adminEmail ||
                                                                ''
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex grow flex-col mb-4">
                                                    <div className="flex items-center">
                                                        <input
                                                            name="accountsEmail"
                                                            type="email"
                                                            placeholder="Accounts Email"
                                                            className={
                                                                classes.input
                                                            }
                                                            defaultValue={
                                                                companyDetails?.accountsEmail ||
                                                                ''
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="mb-1 text-sm font-light">
                                                    Business Address
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center">
                                                    <input
                                                        name="streetNumber"
                                                        placeholder="Street Number"
                                                        type="text"
                                                        className={
                                                            classes.input
                                                        }
                                                        required
                                                        defaultValue={
                                                            companyDetails
                                                                ?.hqAddress
                                                                ?.streetNumber ||
                                                            ''
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                    />
                                                </div>
                                                {/* <small className="text-red-500">
                                                    {hasFormErrors &&
                                                        formErrors.firstName}
                                                </small> */}

                                                <div className="flex items-center">
                                                    <input
                                                        name="street"
                                                        placeholder="Street"
                                                        type="text"
                                                        className={
                                                            classes.input
                                                        }
                                                        defaultValue={
                                                            companyDetails
                                                                ?.hqAddress
                                                                ?.street || ''
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        name="locality"
                                                        placeholder="Suburb"
                                                        type="text"
                                                        className={
                                                            classes.input
                                                        }
                                                        required
                                                        defaultValue={
                                                            companyDetails
                                                                ?.hqAddress
                                                                ?.locality || ''
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                    />
                                                </div>
                                                {/* <small className="text-red-500">
                                                    {hasFormErrors &&
                                                        formErrors.firstName}
                                                </small> */}
                                                <div className="flex items-center">
                                                    <input
                                                        name="administrative1"
                                                        placeholder="City"
                                                        type="text"
                                                        className={
                                                            classes.input
                                                        }
                                                        defaultValue={
                                                            companyDetails
                                                                ?.hqAddress
                                                                ?.administrative1 ||
                                                            ''
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        name="postalCode"
                                                        placeholder="Post Code"
                                                        type="text"
                                                        className={
                                                            classes.input
                                                        }
                                                        required
                                                        defaultValue={
                                                            companyDetails
                                                                ?.hqAddress
                                                                ?.postalCode ||
                                                            ''
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                    />
                                                </div>
                                                {/* <small className="text-red-500">
                                                    {hasFormErrors &&
                                                        formErrors.firstName}
                                                </small> */}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="flex items-center">
                                                    <CountryDropdown
                                                        value={
                                                            companyDetails
                                                                ?.hqAddress
                                                                ?.country
                                                        }
                                                        onChange={
                                                            handleCountryChange
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center">
                                                    <TimezoneDropdown
                                                        value={
                                                            companyDetails
                                                                ?.hqAddress
                                                                ?.timeZone
                                                        }
                                                        countryCode={
                                                            companyDetails
                                                                ?.hqAddress
                                                                ?.country
                                                        }
                                                        onChange={
                                                            handleTimezoneChange
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                {/* <div className="lg:w-1/2 md:w-1/2 w-full"> */}
                                                <div className="flex gap-4">
                                                    <div className="col-span-full">
                                                        <label
                                                            htmlFor="vesselBanner"
                                                            className="text-xs font-light block">
                                                            Company Logo
                                                        </label>
                                                        <div className="flex items-center gap-x-3 h-16">
                                                            <div
                                                                className="w-32"
                                                                role="status">
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
                                                                    <div className="w-18 h-12 border rounded-[4px] bg-slblue-50 p-1 border-slblue-200 flex align-middle">
                                                                        <Image
                                                                            alt="Company logo"
                                                                            width={
                                                                                100
                                                                            }
                                                                            height={
                                                                                100
                                                                            }
                                                                            src={
                                                                                uploadImagedUrl
                                                                                    ? uploadImagedUrl
                                                                                    : '/sealogs-horizontal-logo.png'
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <label
                                                                className="w-full inline-flex justify-center items-center rounded-md bg-white dark:bg-sldarkblue-800 p-1 md:px-5 text-sm shadow-sm ring-1 ring-inset ring-slblue-300 hover:bg-sldarkblue-1000 hover:text-white cursor-pointer"
                                                                htmlFor="fileUpload">
                                                                <input
                                                                    type="file"
                                                                    id="fileUpload"
                                                                    className="hidden"
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        handleImageChange(
                                                                            event,
                                                                        )
                                                                    }
                                                                />
                                                                Upload
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="col-span-full">
                                                        <label className="text-xs font-light block">
                                                            Icon Logo
                                                        </label>
                                                        <div className="flex items-center gap-x-3 h-16">
                                                            <div
                                                                className="w-32"
                                                                role="status">
                                                                {iconLogoLoader ? (
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
                                                                    <div className="w-18 h-12 border rounded-[4px] bg-slblue-50 p-1 border-slblue-200 flex align-middle">
                                                                        <Image
                                                                            alt="Icon logo"
                                                                            width={
                                                                                100
                                                                            }
                                                                            height={
                                                                                100
                                                                            }
                                                                            src={
                                                                                uploadIconLogoUrl
                                                                                    ? uploadIconLogoUrl
                                                                                    : '/sealogs-horizontal-logo.png'
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <label
                                                                className="w-full inline-flex justify-center items-center rounded-md bg-white dark:bg-sldarkblue-800 p-1 md:px-5 text-sm shadow-sm ring-1 ring-inset ring-slblue-300 hover:bg-sldarkblue-1000 hover:text-white cursor-pointer"
                                                                htmlFor="iconLogoUpload">
                                                                <input
                                                                    type="file"
                                                                    id="iconLogoUpload"
                                                                    className="hidden"
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        handleIconLogoChange(
                                                                            event,
                                                                        )
                                                                    }
                                                                />
                                                                Upload
                                                            </label>
                                                        </div>
                                                        {/* </div> */}
                                                        <div>
                                                            <small>
                                                                The recommended
                                                                size is 150px
                                                                150px
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {selectedTab === 'subscription' && (
                            <div className="border-t pt-4">
                                <div className="flex justify-center items-center h-96">
                                    <div className="flex flex-col items-center">
                                        <div className="text-3xl font-light dark:text-white">
                                            Subscription
                                        </div>
                                        <div className="text-2xl font-light dark:text-white">
                                            No data available
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedTab === 'setup' && (
                            <>
                                <div className="border-t pt-4">
                                    <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                                        <div className="my-4 text-l">
                                            SeaLogs Setup
                                            <p className="text-xs mt-4 max-w-[25rem] leading-loose font-light">
                                                Lorem ipsum dolor sit amet
                                                consectetur adipisicing elit.
                                                Facilis possimus harum eaque
                                                itaque est id reprehenderit
                                                excepturi eius temporibus, illo
                                                officia amet nobis sapiente
                                                dolorem ipsa earum adipisci
                                                recusandae cumque.
                                            </p>
                                        </div>
                                        <div className="col-span-2 block pt-3 pb-3 px-7 bg-white dark:bg-sldarkblue-800 dark:border-white dark:border border-slblue-200 rounded-lg">
                                            {/* <div className="mb-4 text-center">
                                                    <small className="text-red-500">
                                                            {hasFormErrors &&
                                                                formErrors.response}
                                                        </small>
                                                </div> */}
                                            <div className="flex gap-4">
                                                <div className="flex grow flex-col mb-4">
                                                    <div className="flex items-center">
                                                        <input
                                                            name="maritimeTrafficFleetEmail"
                                                            placeholder="Maritime Fleet Email"
                                                            type="email"
                                                            className={
                                                                classes.input
                                                            }
                                                            required
                                                            defaultValue={
                                                                companyDetails?.maritimeTrafficFleetEmail ??
                                                                ''
                                                            }
                                                        />
                                                    </div>
                                                    {/* <small className="text-red-500">
                                                    {hasFormErrors &&
                                                        formErrors.firstName}
                                                </small> */}
                                                </div>
                                                <div className="flex grow flex-col mb-4">
                                                    <div className="flex items-center">
                                                        <input
                                                            name="masterTerm"
                                                            placeholder="Master/captain preferred field name"
                                                            type="text"
                                                            className={
                                                                classes.input
                                                            }
                                                            defaultValue={
                                                                companyDetails?.masterTerm ??
                                                                ''
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={`flex items-center my-4 w-full`}>
                                                <label
                                                    className={`relative flex items-center pr-3 rounded-full cursor-pointer`}
                                                    htmlFor="client-use-department"
                                                    data-ripple="true"
                                                    data-ripple-color="dark"
                                                    data-ripple-dark="true">
                                                    <input
                                                        type="checkbox"
                                                        id="client-use-department"
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer p-3 appearance-none rounded-full border border-sky-400 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-sky-500 before:opacity-0 before:transition-opacity checked:border-sky-700 checked:bg-sky-700 before:bg-sky-700 hover:before:opacity-10"
                                                        checked={useDepartment}
                                                        onChange={(e: any) => {
                                                            handleSetUseDepartment(
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }}
                                                    />
                                                    <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-1/3 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"></span>
                                                    <span className="ml-3 text-sm font-semibold uppercase">
                                                        Use departments
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {selectedTab === 'notification' && (
                            <>
                                <TableWrapper headings={['Title']}>
                                    {notifications.map((notification: any) => (
                                        <tr
                                            key={notification}
                                            className={`group border-b dark:border-gray-400 hover:bg-white dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                                            <td className="px-2 py-3 lg:px-6">
                                                <Link
                                                    href="/company-details"
                                                    className="text-gray-800 dark:text-gray-100 group-hover:text-emerald-600 text-medium font-normal">
                                                    {notification}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </TableWrapper>
                            </>
                        )}
                        {selectedTab === 'document' && (
                            <div className="grid-cols-2 gap-6 pb-4 pt-3 px-4 sm:grid hidden">
                                <div className="flex flex-col">
                                    <FileUpload
                                        setDocuments={setDocuments}
                                        text=""
                                        subText="Drag files here or upload"
                                        documents={documents}
                                    />
                                    <span className="mt-3 text-sm mx-auto block">
                                        "To securely save your files, click the
                                        'Save' button below."
                                    </span>
                                </div>
                                <div className="block pb-3">
                                    <div className="px-4 pb-4">
                                        {documents.length > 0 ? (
                                            <ListBox
                                                aria-label="Documents"
                                                className={``}>
                                                {documents.map(
                                                    (document: any) => (
                                                        <ListBoxItem
                                                            key={document.id}
                                                            textValue={
                                                                document.name
                                                            }
                                                            className="flex items-center gap-8 justify-between p-2.5 bg-slblue-50 rounded-lg border border-slblue-300 dark:bg-slblue-800 dark:border-slblue-600 dark:placeholder-slblue-400 dark:text-white mb-4 hover:bg-slblue-1000">
                                                            <FileItem
                                                                document={
                                                                    document
                                                                }
                                                            />
                                                            <Button
                                                                className="flex gap-2 items-center"
                                                                onPress={() =>
                                                                    deleteFile(
                                                                        document.id,
                                                                    )
                                                                }>
                                                                <span className="ml-4 text-xs text-slblue-400">
                                                                    {formatDate(
                                                                        document.created,
                                                                    )}
                                                                </span>
                                                                <XCircleIcon className="w-5 h-5 text-red-500 cursor-pointer" />
                                                            </Button>
                                                        </ListBoxItem>
                                                    ),
                                                )}
                                            </ListBox>
                                        ) : (
                                            <div className="flex justify-center items-center h-40">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-3xl font-light dark:text-white">
                                                        Documents
                                                    </div>
                                                    <div className="text-2xl font-light dark:text-white">
                                                        No documents available
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <FooterWrapper>
                        <SeaLogsButton
                            text="Cancel"
                            type="text"
                            action={() => router.back()}
                        />
                        {(selectedTab === 'detail' ||
                            selectedTab === 'setup' ||
                            selectedTab === 'document') && (
                            <SeaLogsButton
                                text={
                                    updateClientLoading ? 'Saving...' : 'Save'
                                }
                                type="primary"
                                color="sky"
                                icon="check"
                                action={handleSaveDetails}
                                loading={updateClientLoading}
                            />
                        )}
                    </FooterWrapper>
                </>
            )}
        </div>
    )
}

export default CompanyDetailsForm
