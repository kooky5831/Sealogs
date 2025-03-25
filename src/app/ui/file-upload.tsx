'use client'

import { useEffect, useRef, useState } from 'react'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { GET_FILES } from '@/app/lib/graphQL/query'
import { UPDATE_FILE } from '@/app/lib/graphQL/mutation'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
    SeaLogsButton,
    FooterWrapper,
    AlertDialog,
    PopoverWrapper,
} from '@/app/components/Components'
import { Heading } from 'react-aria-components'
import { update } from 'lodash'
import Image from 'next/image'

export default function FileUpload({
    setDocuments = false,
    text = 'Documents and Images',
    subText,
    bgClass = 'bg-white',
    documents,
    multipleUpload = true,
}: {
    setDocuments: any
    text: string
    subText?: string
    bgClass?: string
    documents: Array<Record<string, any>>
    multipleUpload?: boolean
}) {
    const [dragActive, setDragActive] = useState<boolean>(false)
    const inputRef = useRef<any>(null)
    const [files, setFiles] = useState<Array<Record<string, any>>>([])
    const [currentFiles, setCurrentFiles] = useState<any>([])
    const [openFileNameDialog, setOpenFileNameDialog] = useState<boolean>(false)
    const [imageLoader, setImageLoader] = useState(false)
    var bufferFiles: any = []
    var bufferDocuments: any = []

    function handleChange(e: any) {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            for (let i = 0; i < e.target.files['length']; i++) {
                const file = e.target.files[i]
                const fileUrl = URL.createObjectURL(file)
                setFiles((prevState: any) => [...prevState, e.target.files[i]])
                uploadFile(e.target.files[i])
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

            getFileDetails({
                variables: {
                    id: [data[0].id],
                },
            }).then((res) => {
                bufferFiles.push(res.data.readFiles.nodes[0])
                setCurrentFiles(bufferFiles)
                setImageLoader(false)
            })
        } catch (err) {
            console.error(err)
        }
    }

    const [getFileDetails, { data, loading, error }] = useLazyQuery(GET_FILES, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (response) => {
            const data = response.readFiles.nodes
            setOpenFileNameDialog(true)
        },
        onError: (error) => {
            console.error(error)
        },
    })
    function handleSubmitFile(e: any) {
        if (files.length === 0) {
            // no file has been submitted
        } else {
            // write submit logic here
        }
    }

    function handleDrop(e: any) {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            for (let i = 0; i < e.dataTransfer.files['length']; i++) {
                setFiles((prevState: any) => [
                    ...prevState,
                    e.dataTransfer.files[i],
                ])
                uploadFile(e.dataTransfer.files[i])
                setImageLoader(true)
            }
        }
    }

    function handleDragLeave(e: any) {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
    }

    function handleDragOver(e: any) {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
    }

    function handleDragEnter(e: any) {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
    }

    function removeFile(fileName: any, idx: any) {
        const newArr = [...files]
        newArr.splice(idx, 1)
        setFiles([])
        setFiles(newArr)
    }

    function openFileExplorer() {
        inputRef.current.value = ''
        inputRef.current.click()
    }

    const handleUpdateFileName = () => {
        currentFiles.map((file: any, index: number) => {
            const newFileName = (
                document.getElementById(
                    `file-name-${index}`,
                ) as HTMLInputElement
            ).value
            updateFile({
                variables: {
                    input: {
                        id: file.id,
                        title: newFileName,
                    },
                },
            }).then((res) => {
                bufferDocuments.push(res.data.updateFile)
                if (multipleUpload) {
                    setDocuments((prevState: any) => [
                        ...prevState,
                        res.data.updateFile,
                    ])
                } else {
                    setDocuments([res.data.updateFile])
                }
            })
        })
        setOpenFileNameDialog(false)
    }

    const [updateFile, { data: updateData }] = useMutation(UPDATE_FILE, {
        onCompleted: (response) => {
            const data = response.updateFile
            setFiles([])
        },
        onError: (error) => {
            console.error(error)
        },
    })

    useEffect(() => {
        setFiles((prevFiles) => [...prevFiles, ...documents])
    }, [documents])

    return (
        <div className="w-full">
            <div className="flex items-center justify-center">
                <form
                    className={`${
                        dragActive ? 'bg-slorange-400' : 'bg-slorange-300'
                    }  p-4 w-full rounded-lg  min-h-[10rem] text-sm text-slorange-1000 text-center flex relative flex-col items-center justify-center border-dashed border border-slorange-1000 hover:border-slblue-50 hover:ring-sldarkblue-1000 hover:bg-sldarkblue-1000 hover:text-white h-56`}
                    onDragEnter={handleDragEnter}
                    onSubmit={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}>
                    <span className="absolute top-4 left-4 flex text-base font-bold uppercase dark:text-slblue-800">
                        {text}
                    </span>
                    <input
                        placeholder="fileInput"
                        className="hidden"
                        ref={inputRef}
                        type="file"
                        multiple={multipleUpload}
                        onChange={handleChange}
                        accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"
                    />
                    <span
                        className="flex flex-col items-center cursor-pointer"
                        onClick={openFileExplorer}>
                        <Image
                            src="/sealogs-document_upload.svg"
                            alt="img"
                            width={100}
                            height={100}
                            className="mb-3"
                        />
                        {subText && (
                            <span className="flex-col items-center text-sm font-light">
                                {subText}
                            </span>
                        )}
                    </span>
                </form>

                {/* loader */}
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
                        <span className="sr-only">Loading...</span>
                    </div>
                ) : (
                    <AlertDialog
                        openDialog={openFileNameDialog}
                        setOpenDialog={setOpenFileNameDialog}
                        handleCreate={handleUpdateFileName}
                        actionText="Save">
                        <Heading
                            slot="title"
                            className="text-2xl font-light leading-6 my-2">
                            File Name
                        </Heading>
                        <div slot="content" className="">
                            {currentFiles &&
                                currentFiles.map((file: any, index: number) => {
                                    return (
                                        <input
                                            key={index}
                                            type="text"
                                            id={`file-name-${index}`}
                                            placeholder="File Name"
                                            className="border border-slblue-200 bg-slblue-100  p-2 rounded-lg w-full my-2"
                                            defaultValue={file?.title}
                                        />
                                    )
                                })}
                        </div>
                    </AlertDialog>
                )}
            </div>
        </div>
    )
}
