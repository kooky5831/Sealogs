import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import { useEffect, useState } from 'react'
import { Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { usePathname } from 'next/navigation'
import { isEmpty } from 'lodash'
import VesselIcon from '@/app/ui/vessels/vesel-icon'
import {
    Button,
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from 'react-aria-components'
import { SeaLogsButton } from './Components'
import { useLazyQuery } from '@apollo/client'
import { GET_FILES } from '../lib/graphQL/query'

const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    {
        ssr: false,
    },
)
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    {
        ssr: false,
    },
)
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    {
        ssr: false,
    },
)
// Define custom icon using Leaflet's L.Icon
const customIcon = L.icon({
    iconUrl: '/vessel-location-marker.png',
    iconSize: [40, 40], // Adjust icon size as needed
})

const vesselIcon = (vessel: any) => {
    const [vesselPhoto, setVesselPhoto] = useState<any>([])

    useEffect(() => {
        if (vessel) {
            if (vessel.iconMode === 'Photo') {
                loadVesselPhoto(vessel.photoID)
            }
        }
    }, [vessel])

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
    
    let icon = ``
    if (vessel?.iconMode === 'Photo' && vesselPhoto.length > 0) {
        icon = `${process.env.FILE_BASE_URL}${vesselPhoto[0]?.fileFilename}`
    } else if (vessel?.iconMode === 'Icon' && vessel?.icon != null) {
        icon = `/vessel-icons/${vessel?.icon}.svg`
    } else {
        icon = `/vessel.svg`
    }
    
    return L.icon({
        iconUrl: icon,
        className: "bg-white ring-1 ring-slblue-200 rounded-full",
        iconSize: [40, 40], // Adjust the size as needed
    });
};

export default function FullMap({ vessels, data }: any) {
    const pathname = usePathname()
    const [clientTitle, setClientTitle] = useState('')
    const [departmentTitle, setDepartmentTitle] = useState('')
    const [vesselsList, setVesselsList] = useState<any>(vessels)
    const [expandMap, setExpandMap] = useState(false)
    useEffect(() => {
        setClientTitle(localStorage.getItem('clientTitle') || '')
        const departmentTitle = localStorage.getItem('departmentTitle')
        setDepartmentTitle(
            departmentTitle === 'null' ? '' : departmentTitle || '',
        )
        setVesselsList(vessels)
    }, [vessels])
    const mapContainer = (mapHeight = 'h-96') => {
        return (
            <>
                {vesselsList.length > 0 && (
                    <>
                    <div className='block lg:hidden'>
                    <MapContainer
                        center={[
                            vesselsList[0]?.vehiclePositions?.nodes[0]?.lat ||
                                vesselsList[0]?.vehiclePositions?.nodes[0]
                                    ?.geoLocation?.lat ||
                                0,
                            vesselsList[0]?.vehiclePositions?.nodes[0]?.long ||
                                vesselsList[0]?.vehiclePositions?.nodes[0]
                                    ?.geoLocation?.long ||
                                0,
                        ]}
                        zoom={12}
                        scrollWheelZoom={false}
                        className={
                            pathname === '/location-overview'
                                ? 'h-svh'
                                : mapHeight
                        }
                        dragging={false}
                        tap={false}
                        >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {vesselsList
                            .filter(
                                (vessel: any) =>
                                    vessel.vehiclePositions?.nodes[0]?.lat !=
                                        0 ||
                                    vessel.vehiclePositions?.nodes[0]
                                        ?.geoLocation.id > 0,
                            )
                            .map(
                                (cordi: any, index: number) =>
                                    cordi?.vehiclePositions?.nodes?.length >
                                        0 && (
                                        <Marker
                                            key={index}
                                            position={[
                                                (cordi.vehiclePositions.nodes[0]
                                                    .lat ||
                                                    cordi.vehiclePositions
                                                        .nodes[0].geoLocation
                                                        .lat) +
                                                    0.001 +
                                                    Math.random() *
                                                        (0.005 - 0.001) || 0,
                                                cordi.vehiclePositions.nodes[0]
                                                    .long ||
                                                    cordi.vehiclePositions
                                                        .nodes[0].geoLocation
                                                        .long ||
                                                    0,
                                            ]}
                                            icon={vesselIcon(cordi)}>
                                            <Tooltip>{cordi.title}</Tooltip>
                                        </Marker>
                                    ),
                            )}
                    </MapContainer>
                    </div>
                    <div className='hidden lg:block'>
                    <MapContainer
                        center={[
                            vesselsList[0]?.vehiclePositions?.nodes[0]?.lat ||
                                vesselsList[0]?.vehiclePositions?.nodes[0]
                                    ?.geoLocation?.lat ||
                                0,
                            vesselsList[0]?.vehiclePositions?.nodes[0]?.long ||
                                vesselsList[0]?.vehiclePositions?.nodes[0]
                                    ?.geoLocation?.long ||
                                0,
                        ]}
                        zoom={12}
                        scrollWheelZoom={false}
                        className={
                            pathname === '/location-overview'
                                ? 'h-svh'
                                : mapHeight
                        }
                        dragging={true}
                        tap={true}
                        >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {vesselsList
                            .filter(
                                (vessel: any) =>
                                    vessel.vehiclePositions?.nodes[0]?.lat !=
                                        0 ||
                                    vessel.vehiclePositions?.nodes[0]
                                        ?.geoLocation.id > 0,
                            )
                            .map(
                                (cordi: any, index: number) =>
                                    cordi?.vehiclePositions?.nodes?.length >
                                        0 && (
                                        <Marker
                                            key={index}
                                            position={[
                                                (cordi.vehiclePositions.nodes[0]
                                                    .lat ||
                                                    cordi.vehiclePositions
                                                        .nodes[0].geoLocation
                                                        .lat) +
                                                    0.001 +
                                                    Math.random() *
                                                        (0.005 - 0.001) || 0,
                                                cordi.vehiclePositions.nodes[0]
                                                    .long ||
                                                    cordi.vehiclePositions
                                                        .nodes[0].geoLocation
                                                        .long ||
                                                    0,
                                            ]}
                                            icon={vesselIcon(cordi)}>
                                            <Tooltip>{cordi.title}</Tooltip>
                                        </Marker>
                                    ),
                            )}
                    </MapContainer>
                    </div>
                    </>
                )}
            </>
        )
    }
    return (
        <>
            <div className="rounded-lg overflow-hidden">
                <div className={`${expandMap ? 'hidden' : ''}`}>
                    {mapContainer()}
                </div>
                <div className="bg-slblue-100 flex justify-between">
                    <div className="p-4">{`${clientTitle} ${
                        !isEmpty(departmentTitle) ? ' - ' + departmentTitle : ''
                    }`}</div>
                    <div className="p-4">
                        <Button
                            onPress={() => {
                                setExpandMap(true)
                            }}>
                            Expand
                        </Button>
                    </div>
                </div>
            </div>
            <DialogTrigger isOpen={expandMap} onOpenChange={setExpandMap}>
                <ModalOverlay
                    className={`fixed inset-0 z-100 overflow-y-auto bg-black/25 flex items-center justify-center p-4 text-center backdrop-blur`}>
                    <Modal
                        className={`w-full h-fit rounded-lg bg-white dark:bg-sldarkblue-800 text-left align-middle shadow-xl`}>
                        <Dialog
                            role="alertdialog"
                            className="outline-none relative ">
                            {({ close }) => (
                                <div
                                    className={`flex h-screen justify-center flex-col px-6 py-6 bg-white dark:bg-sldarkblue-800 border rounded-lg border-slblue-800`}>
                                    {mapContainer('h-screen')}
                                    <hr className="my-6" />
                                    <div className="flex justify-end">
                                        <SeaLogsButton
                                            text="Close"
                                            type="text"
                                            action={close}
                                        />
                                    </div>
                                </div>
                            )}
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>
        </>
    )
}
