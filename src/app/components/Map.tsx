import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import { Tooltip, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { uniqueId } from 'lodash'
import { useLazyQuery } from '@apollo/client'
import { GET_FILES } from '../lib/graphQL/query'
import L from 'leaflet'

const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false },
)
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false },
)
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false },
)
// Define custom icon using Leaflet's L.Icon
// Esthon: I commented this out because of "windows not defined" build error
/* const customIcon = L.icon({
    iconUrl:'/vessel-location-marker.png',
    iconSize: [40, 40], // Adjust icon size as needed
  }); */

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

        // Dynamically load Leaflet on the client side
        const L = typeof window !== 'undefined' ? require('leaflet') : null;

        // Only create the icon if we are on the client side
        let icon = ``;
        if (vessel?.iconMode === 'Photo' && vesselPhoto.length > 0) {
            icon = `${process.env.FILE_BASE_URL}${vesselPhoto[0]?.fileFilename}`;
        } else if (vessel?.iconMode === 'Icon' && vessel?.icon != null) {
            icon = `/vessel-icons/${vessel?.icon}.svg`;
        } else {
            icon = `/vessel.svg`;
        }
    
        if (L) {
            // Create and return the icon only if L (Leaflet) is available
            return L.icon({
                iconUrl: icon,
                className: 'bg-white ring-1 ring-slblue-200 rounded-full',
                iconSize: [40, 40], // Adjust the size as needed
            });
        } else {
            return null; // During SSR, return null or a fallback
        }
};

export default function LocationMap(props: any) {
    const [position, setPosition] = useState(props.position)
    const [vessel, setVessel] = useState(props.vessel)
    const [zoom, setZoom] = useState(props.zoom)
    const handleMapClick = (e: any) => {
        const { lat, lng } = e.latlng
        props.onPositionChange?.([lat, lng])
    }
    const LocationMarker = (props: any) => {
        const { position } = props
        const { vessel } = props
        useMapEvents({
            click(e) {
                handleMapClick(e)
            },
        })

        if (typeof window === 'undefined') {
            return <Marker position={position}></Marker>
        } else {
            return <Marker position={position} icon={vesselIcon(vessel)}></Marker>
        }
    }

    return (
        <MapContainer
            key={uniqueId()}
            center={position}
            zoom={zoom}
            scrollWheelZoom={false}
            className="h-96">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker position={position} vessel={vessel}/>
        </MapContainer>
    )
}
