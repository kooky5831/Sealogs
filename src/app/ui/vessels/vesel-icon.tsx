'use client'
import { useEffect, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import { GET_FILES } from '@/app/lib/graphQL/query'
export default function VesselIcon({ vessel }: { vessel: any }) {
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

    return (
        <>
            {vessel?.iconMode === 'Photo' && vesselPhoto.length > 0 && (
                <img
                    className="w-9 h-9 bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                    src={`${process.env.FILE_BASE_URL}${vesselPhoto[0]?.fileFilename}`}
                    alt={vessel?.title}
                />
            )}
            {vessel?.iconMode === 'Icon' && vessel?.icon != null && (
                <img
                    className="w-9 h-9 bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                    src={`/vessel-icons/${vessel?.icon}.svg`}
                    alt={vessel?.title}
                />
            )}
            {vessel?.icon == null && vesselPhoto.length == 0 && (
                <img
                    className="w-9 h-9 bg-slblue-50 ring-1 ring-slblue-200 p-0.5 rounded-full"
                    src="/vessel.svg"
                    alt={vessel?.title}
                />
            )}
        </>
    )
}
