import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { READ_ONE_CLIENT, GET_FILES } from '@/app/lib/graphQL/query'
import { useLazyQuery, useMutation } from '@apollo/client'

export default function SealogsLogo(props: any) {
    const { theme } = useTheme()
    const [uploadImagedUrl, setUploadImagedUrl] = useState<any>('')
    const [iconLogoUrl, setIconLogoUrl] = useState<any>('')

    useEffect(() => {
        loadCompanyDetails()
    }, [])
    const [readOneClient, { loading: readOneClientLoading }] = useLazyQuery(
        READ_ONE_CLIENT,
        {
            // fetchPolicy: 'cache-and-network',
            onCompleted: (response) => {
                const data = response.readOneClient
                if (data) {
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
    const [getFileDetails, { data, loading }] = useLazyQuery(GET_FILES, {
        // fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const data = response.readFiles.nodes
            setUploadImagedUrl(process.env.FILE_BASE_URL + data[0].fileFilename)
        },
        onError: (error) => {
            console.log(error)
        },
    })
    const [getIconLogoDetails] = useLazyQuery(GET_FILES, {
        // fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const data = response.readFiles.nodes
            setIconLogoUrl(process.env.FILE_BASE_URL + data[0].fileFilename)
        },
        onError: (error) => {
            console.log(error)
        },
    })
    return (
        <div>
            <a href="/">
                <Image
                    src={
                        theme === 'dark'
                            ? uploadImagedUrl
                                ? uploadImagedUrl
                                : `/sealogs-horizontal-logo-white.png`
                            : uploadImagedUrl
                              ? uploadImagedUrl
                              : `/sealogs-horizontal-logo.png`
                    }
                    width={160}
                    priority={true}
                    height={50}
                    className="hidden xl:inline-block p-4"
                    alt="Company Logo"
                />
                <Image
                    src={
                        theme === 'dark'
                            ? iconLogoUrl
                                ? iconLogoUrl
                                : `/sealogs-horizontal-logo-white.png`
                            : iconLogoUrl
                              ? iconLogoUrl
                              : `/sealogs-horizontal-logo.png`
                    }
                    width={160}
                    priority={true}
                    height={50}
                    className="block xl:hidden p-2"
                    alt="Icon Logo"
                />
            </a>
        </div>
    )
}
