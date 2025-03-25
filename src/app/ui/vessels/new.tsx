'use client'
import { Heading } from 'react-aria-components'
import { InputSkeleton } from '@/app/ui/skeletons'
import {
    FooterWrapper,
    SeaLogsButton,
    PopoverWrapper,
} from '@/app/components/Components'
import { useRouter } from 'next/navigation'
import Select from 'react-select'
import { CountriesList } from '@/app/lib/data'
import { useMutation } from '@apollo/client'
import { CREATE_VESSEL } from '@/app/lib/graphQL/mutation'
import { use, useEffect } from 'react'

export default function NewVessel() {
    const router = useRouter()
    const currentData: any = {}
    const handleCreate = async () => {
        // const Title = (document.getElementById('vessel-title') as HTMLInputElement).value
        // const AuthNo = (document.getElementById('vessel-authNo') as HTMLInputElement).value
        // const MMSI = (document.getElementById('vessel-mmsi') as HTMLInputElement).value
        // const TransitId = (document.getElementById('vessel-transitId') as HTMLInputElement).value
        // const Country = currentData['countryofoperation'] ? currentData['countryofoperation'] : null
        await queryCreateVessel({
            variables: {
                input: {
                    // mmsi: MMSI,
                    // registration: AuthNo,
                    title: 'New Vessel',
                    // countryOfOperation: Country,
                    // transitID: TransitId,
                },
            },
        })
    }

    const [queryCreateVessel] = useMutation(CREATE_VESSEL, {
        fetchPolicy: 'no-cache',
        onCompleted: (response: any) => {
            const data = response.createVessel
            if (data.id > 0) {
                router.push('/vessel/edit?id=' + data.id)
            }
        },
        onError: (error: any) => {
            console.error('createVessel error', error)
        },
    })

    useEffect(() => {
        handleCreate()
    }, [])

    return (
        <div className="w-full p-0 dark:text-white">
            <div className="flex justify-between pb-4 pt-3 items-center">
                <Heading className="font-light font-monasans text-3xl dark:text-white">
                    Creating New Vessel
                </Heading>
            </div>
            {/* <div className="px-0 md:px-4 pt-4 border-t">
                <div className='grid grid-cols-3 gap-6 pb-4 pt-3 px-4'>
                    <div className=''>
                        <div className='my-4 text-xl'>
                            Vessel Details
                            <p className='text-xs mt-4 max-w-[25rem] leading-loose'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis sint veritatis laboriosam quo autem error provident nulla, minima enim eveniet cupiditate. Reprehenderit perferendis aspernatur at tenetur maiores accusantium nostrum aliquid.</p>
                        </div>
                    </div>
                    <div className='col-span-2'>
                        <div className='my-4'>
                            <div className='flex gap-4'>
                                <input id={`vessel-title`} type="text" className={classes.input} placeholder='Vessel Title' />
                                <input id={`vessel-authNo`} type="text" className={classes.input} placeholder='Authority No. (MNZ, AMSA)' />
                            </div>
                        </div>
                        <div className='my-4'>
                            {!CountriesList ? <InputSkeleton /> :
                                <Select
                                    id='task-links'
                                    isClearable
                                    options={CountriesList}
                                    closeMenuOnSelect={true}
                                    menuPlacement="bottom"
                                    placeholder='Country of Operation'
                                    onChange={(value: any) => currentData['countryofoperation'] = value.value}
                                    className='w-full bg-gray-100 rounded dark:bg-gray-800 text-sm'
                                    classNames={{
                                        control: () => "block py-1 w-full !text-sm !text-gray-900 !bg-transparent !rounded-lg !border !border-gray-200 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 !dark:text-white !dark:focus:ring-blue-500 !dark:focus:border-blue-500",
                                        singleValue: () => "dark:!text-white",
                                        dropdownIndicator: () => "!p-0 !hidden",
                                        indicatorSeparator: () => "!hidden",
                                        multiValue: () => "!bg-sky-100 inline-block rounded p-1 m-0 !mr-1.5 border border-sky-300 !rounded-md !text-sky-900 font-normal mr-2",
                                        clearIndicator: () => "!py-0",
                                        valueContainer: () => "!py-0",
                                    }}
                                />
                            }
                        </div>
                        <div className='my-4'>
                            <input id={`vessel-mmsi`} type="text" className={classes.input} placeholder='MMSI' />
                        </div>
                        <div className='my-4'>
                            <input id={`vessel-transitId`} type="text" className={classes.input} placeholder='Transit Identifier' />
                        </div>
                    </div>
                </div>
            </div> */}
            {/* <FooterWrapper>
                <SeaLogsButton text='Cancel' type='text' action={() => router.back()} />
                <SeaLogsButton text='Create Vessel' type='primary' icon='check' color='sky' action={handleCreate} />
            </FooterWrapper> */}
        </div>
    )
}
