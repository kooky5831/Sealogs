import Link from 'next/link'
import { useState } from 'react'
import { Button } from 'react-aria-components'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Download from 'yet-another-react-lightbox/plugins/download'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'

const FileItem = ({ document, hideTitle = false }: any) => {
    const [openLightbox, setOpenLightbox] = useState(false)
    const isImage = () => {
        const fileExtension = document.fileFilename
            ?.split('.')
            .pop()
            .toLowerCase()
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif']

        return imageExtensions.includes(fileExtension)
    }

    const getFileIcon = () => {
        let icon = '/file-types/doc.svg'
        const fileExtension = document.fileFilename
            ?.split('.')
            .pop()
            .toLowerCase()
        if (fileExtension === 'pdf') {
            icon = '/file-types/pdf.svg'
        } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
            icon = '/file-types/xls.svg'
        } else if (fileExtension === 'ppt' || fileExtension === 'pptx') {
            icon = '/file-types/ppt.svg'
        } else if (fileExtension === 'txt') {
            icon = '/file-types/txt.svg'
        } else if (fileExtension === 'csv') {
            icon = '/file-types/csv.svg'
        }
        return icon
    }
    return (
        <>
            {isImage() ? (
                <>
                    <Button
                        onPress={() => {
                            setOpenLightbox(true)
                        }}
                        className="flex items-center">
                        <Image
                            src={
                                process.env.FILE_BASE_URL +
                                document.fileFilename
                            }
                            alt={document.title}
                            width={100}
                            height={100}
                            className="mr-2 h-50 w-50"
                        />
                        {!hideTitle && document.title}
                    </Button>
                    <Lightbox
                        open={openLightbox}
                        close={() => setOpenLightbox(false)}
                        slides={[
                            {
                                src:
                                    process.env.FILE_BASE_URL +
                                    document.fileFilename,
                                alt: document.title,
                                description: document.title,
                            },
                        ]}
                        render={{
                            buttonPrev: () => null,
                            buttonNext: () => null,
                        }}
                        controller={{
                            closeOnPullUp: true,
                            closeOnPullDown: true,
                            closeOnBackdropClick: true,
                        }}
                        plugins={[Captions, Fullscreen, Download, Zoom]}
                    />
                </>
            ) : (
                <>
                    <Link
                        href={process.env.FILE_BASE_URL + document.fileFilename}
                        target="_blank"
                        className="text-slblue-800 text-sm font-light hover:text-white flex items-center break-all">
                        <Image
                            src={getFileIcon()}
                            alt={document.title}
                            width={100}
                            height={100}
                            className="mr-2 h-50 w-50"
                        />
                        {!hideTitle && document.title}
                    </Link>
                </>
            )}
        </>
    )
}

export default FileItem
