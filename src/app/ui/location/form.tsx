'use client'
import { useEffect, useState } from 'react'
import {
    Button,
    Dialog,
    DialogTrigger,
    Heading,
    Modal,
    ModalOverlay,
} from 'react-aria-components'
import { classes } from '@/app/components/GlobalClasses'
import { debounce, isEmpty, trim } from 'lodash'
import { FooterWrapper, SeaLogsButton } from '@/app/components/Components'
import Link from 'next/link'
import { useLazyQuery, useMutation } from '@apollo/client'
import { ReadOneGeoLocation } from '@/app/lib/graphQL/query'
import {
    CreateGeoLocation,
    DeleteGeoLocations,
    UpdateGeoLocation,
} from '@/app/lib/graphQL/mutation'
import { useRouter } from 'next/navigation'
import { InputSkeleton } from '../skeletons'
import LocationMap from '@/app/components/Map'

const GeoLocationForm = ({ id = 0 }: { id?: number }) => {
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const [geoLocation, setGeoLocation] = useState({} as any)
    const [hasFormErrors, setHasFormErrors] = useState(false)
    const [formErrors, setFormErrors] = useState({
        title: '',
    })
    const debouncedhandleInputChange = debounce(
        (name: string, value: string) => {
            setGeoLocation({
                ...geoLocation,
                [name]: value,
                id: +id,
            })
        },
        300,
    )

    const [updateGeoLocation, { loading: loadingUpdateGeoLocation }] =
        useMutation(UpdateGeoLocation, {
            onCompleted: (response: any) => {
                router.push(`/location/info?id=${id}`)
            },
            onError: (error: any) => {
                console.error('updateGeoLocation', error)
            },
        })
    const [createGeoLocation, { loading: loadingCreateGeoLocation }] =
        useMutation(CreateGeoLocation, {
            onCompleted: (response: any) => {
                router.push('/location')
            },
            onError: (error: any) => {
                console.error('createGeoLocation', error)
            },
        })
    const [deleteGeoLocation, { loading: loadingDeleteGeoLocation }] =
        useMutation(DeleteGeoLocations, {
            onCompleted: (response: any) => {
                router.push('/location')
            },
            onError: (error: any) => {
                console.error('deleteGeoLocation', error)
            },
        })
    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        debouncedhandleInputChange(name, value)
    }
    const handleSave = async () => {
        let hasErrors = false
        let errors = {
            title: '',
        }
        if (isEmpty(trim(geoLocation.title))) {
            hasErrors = true
            errors.title = 'Title is required'
        }

        if (hasErrors) {
            setHasFormErrors(true)
            setFormErrors(errors)
            return
        }

        const variables = {
            input: {
                id: +id,
                title: geoLocation.title,
                lat: parseFloat(geoLocation.lat) || 0,
                long: parseFloat(geoLocation.long) || 0,
            },
        }
        if (id === 0) {
            await createGeoLocation({ variables })
        } else {
            await updateGeoLocation({ variables })
        }
    }
    const handleDeleteLocation = async () => {
        await deleteGeoLocation({ variables: { ids: [+id] } })
    }

    const [readOneGeoLocation, { loading: loadingReadOneGeoLocation }] =
        useLazyQuery(ReadOneGeoLocation, {
            fetchPolicy: 'cache-and-network',
            onCompleted: (data: any) => {
                setGeoLocation(data.readOneGeoLocation)
            },
            onError: (error: any) => {
                console.error('readOneGeoLocation', error)
            },
        })
    const loadGeoLocation = async () => {
        await readOneGeoLocation({
            variables: {
                id: id,
            },
        })
    }
    const handlePositionChange = (position: any) => {
        setGeoLocation({
            ...geoLocation,
            lat: position[0],
            long: position[1],
        })
    }
    useEffect(() => {
        if (isLoading) {
            loadGeoLocation()
            setIsLoading(false)
        }
    }, [isLoading])
    return (
        <div className="w-full p-0">
            <div className="flex justify-between pb-4 pt-3 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    {id === 0 ? 'Create' : 'Edit'} Location
                </Heading>
            </div>
            <div className="px-0 md:px-4 pt-4 border-t dark:text-white">
                <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                    <div className="my-4 text-xl">
                        Location details
                        <p className="text-xs mt-4 max-w-[25rem] leading-loose">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Esse minima maxime enim, consectetur hic est
                            perferendis explicabo suscipit rem reprehenderit
                            vitae ex sunt corrupti obcaecati aliquid natus et
                            inventore tenetur?
                        </p>
                    </div>
                    <div className="col-span-2 flex flex-col">
                        <div className="my-4">
                            <label>Location Name</label>
                            {loadingReadOneGeoLocation ? (
                                <InputSkeleton />
                            ) : (
                                <input
                                    name="title"
                                    type="text"
                                    className={classes.input}
                                    required
                                    defaultValue={geoLocation?.title || ''}
                                    onChange={handleInputChange}
                                    placeholder="Location Name"
                                />
                            )}
                            <small className="text-red-500">
                                {hasFormErrors && formErrors.title}
                            </small>
                        </div>
                        <div className="mb-4">
                            <label>Latitude</label>
                            {loadingReadOneGeoLocation ? (
                                <InputSkeleton />
                            ) : (
                                <input
                                    name="lat"
                                    type="text"
                                    className={classes.input}
                                    placeholder="Latitude"
                                    required
                                    defaultValue={geoLocation?.lat || ''}
                                    onChange={handleInputChange}
                                />
                            )}
                            <small>
                                Alternatively, you can click on the map to
                                update the coordinates.
                            </small>
                        </div>
                        <div className="mb-4">
                            <label>Longitude</label>
                            {loadingReadOneGeoLocation ? (
                                <InputSkeleton />
                            ) : (
                                <input
                                    name="long"
                                    type="text"
                                    className={classes.input}
                                    placeholder="Longitude"
                                    required
                                    defaultValue={geoLocation?.long || ''}
                                    onChange={handleInputChange}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    {!loadingReadOneGeoLocation && !isEmpty(geoLocation) && (
                        <LocationMap
                            position={[
                                geoLocation?.lat || 0,
                                geoLocation?.long || 0,
                            ]}
                            zoom={19}
                            onPositionChange={handlePositionChange}
                        />
                    )}
                </div>
            </div>
            <FooterWrapper>
                <Link
                    href={id > 0 ? `/location/info?id=${id}` : '/location'}
                    className="group inline-flex justify-center items-center">
                    <Button className="mr-6 text-sm text-gray-600 hover:text-gray-600 dark:text-white">
                        Cancel
                    </Button>
                </Link>

                {id > 0 && (
                    <DialogTrigger>
                        <SeaLogsButton
                            type="secondary"
                            color="rose"
                            icon="trash"
                            text="Delete"
                            isDisabled={
                                loadingReadOneGeoLocation ||
                                loadingUpdateGeoLocation ||
                                loadingCreateGeoLocation ||
                                loadingDeleteGeoLocation
                            }
                        />
                        <ModalOverlay
                            className={({ isEntering, isExiting }) => `
                            fixed inset-0 z-[401] overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur
                            ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
                            ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
                        `}>
                            <Modal
                                className={({ isEntering, isExiting }) => `
                                w-full max-w-md overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl
                                ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
                                ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
                            `}>
                                <Dialog
                                    role="alertdialog"
                                    className="outline-none relative">
                                    {({ close }) => (
                                        <div className="flex justify-center flex-col px-6 py-6">
                                            <Heading
                                                slot="title"
                                                className="text-2xl font-light leading-6 my-2 text-gray-700">
                                                Delete Location
                                            </Heading>
                                            <p className="mt-3 text-slate-500">
                                                Are you sure you want to delete
                                                "{geoLocation.title}"?
                                            </p>
                                            <hr className="my-6" />
                                            <div className="flex justify-end">
                                                <Button
                                                    className="mr-8 text-sm text-gray-600 hover:text-gray-600"
                                                    onPress={close}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    className="group inline-flex justify-center items-center rounded-md bg-sky-700 px-4 py-2 text-sm text-white shadow-sm hover:bg-white hover:text-sky-800 ring-1 ring-sky-700"
                                                    onPress={() => {
                                                        close()
                                                        handleDeleteLocation()
                                                    }}>
                                                    <svg
                                                        className="-ml-0.5 mr-1.5 h-5 w-5 border rounded-full bg-sky-300 group-hover:bg-sky-700 group-hover:text-white"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        aria-hidden="true">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                            clipRule="evenodd"></path>
                                                    </svg>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Dialog>
                            </Modal>
                        </ModalOverlay>
                    </DialogTrigger>
                )}
                <SeaLogsButton
                    type="primary"
                    icon="check"
                    text={`${id === 0 ? 'Create' : 'Update'} Location`}
                    color="sky"
                    action={handleSave}
                    isDisabled={
                        loadingReadOneGeoLocation ||
                        loadingUpdateGeoLocation ||
                        loadingCreateGeoLocation ||
                        loadingDeleteGeoLocation
                    }
                />
            </FooterWrapper>
        </div>
    )
}

export default GeoLocationForm
