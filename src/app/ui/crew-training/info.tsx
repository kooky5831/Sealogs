'use client'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { TrainingSessionInfoSkeleton } from '../skeletons'
import { Heading, Button } from 'react-aria-components'
import Image from 'next/image'
import { getTrainingSessionByID } from '@/app/lib/actions'
import { formatDate } from '@/app/helpers/dateHelper'

const CrewTrainingInfo = ({ trainingID }: { trainingID: number }) => {
    // TODO: check if training data is not found. Example: user entered a non existent training ID
    if (trainingID <= 0) {
        redirect('/crew-training')
    }
    const [training, setTraining] = useState<any>()

    getTrainingSessionByID(trainingID, setTraining)

    return (
        <>
            {!training ? (
                <TrainingSessionInfoSkeleton />
            ) : (
                <div className="w-full p-0">
                    <div className="flex justify-between pb-4 pt-3 items-center">
                        <Heading className="flex items-center font-light font-monasans text-3xl dark:text-white">
                            <span className="font-medium mr-2">
                                Training Session:
                            </span>
                            {training?.vessel.title}
                            <span className="inline-block rounded px-3 py-1 ml-3 font-semibold bg-green-100 text-green-700 text-sm ring-1 ring-green-700">
                                {training?.date && formatDate(training.date)}
                            </span>
                        </Heading>
                        <Link
                            href={`/crew-training/edit?id=${training.id}`}
                            className="group block m-1">
                            <Button className="group inline-flex justify-center items-center mr-2 rounded-md bg-sky-100 px-3 py-2 text-sm text-sky-600 shadow-sm hover:bg-white hover:text-sky-600 ring-1 ring-sky-600">
                                <svg
                                    className="-ml-0.5 mr-1.5 h-5 w-5 group-hover:border-white"
                                    viewBox="0 0 36 36"
                                    fill="currentColor"
                                    aria-hidden="true">
                                    <path d="M33.87,8.32,28,2.42a2.07,2.07,0,0,0-2.92,0L4.27,23.2l-1.9,8.2a2.06,2.06,0,0,0,2,2.5,2.14,2.14,0,0,0,.43,0L13.09,32,33.87,11.24A2.07,2.07,0,0,0,33.87,8.32ZM12.09,30.2,4.32,31.83l1.77-7.62L21.66,8.7l6,6ZM29,13.25l-6-6,3.48-3.46,5.9,6Z"></path>
                                </svg>
                                Edit
                            </Button>
                        </Link>
                    </div>
                    <div className="px-0 md:px-4 pt-4 border-t border-b dark:text-gray-100">
                        <div className="grid grid-cols-3 gap-6 py-4 px-4">
                            <div>Trainer</div>
                            <div className="col-span-2">{`${training?.trainer?.firstName || ''} ${training?.trainer?.surname || ''}`}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                            <div>Nature of Training</div>
                            <div className="col-span-2">
                                {training?.trainingTypes?.nodes
                                    .map((t: any) => t.title)
                                    .join(', ')}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                            <div>Members</div>
                            <div className="col-span-2">
                                {training?.members?.nodes
                                    .map(
                                        (m: any) =>
                                            `${m.firstName || ''} ${m.surname || ''}`,
                                    )
                                    .join(', ')}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                            <div>Summary</div>
                            <div className="whitespace-pre-line col-span-2">
                                {training.trainingSummary}
                            </div>
                        </div>
                        <hr className="my-4" />
                        <div className="grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                            <div className="my-4 text-xl">Signatures</div>
                            <div className="col-span-2 flex flex-wrap justify-between">
                                {training.signatures?.nodes.map((s: any) => {
                                    return (
                                        <div
                                            key={s.memberID}
                                            className="flex flex-col">
                                            <div className="">
                                                {' '}
                                                {s.member.firstName}{' '}
                                                {s.member.surname}{' '}
                                            </div>
                                            <div className="border my-2">
                                                {s.signatureData && (
                                                    <Image
                                                        src={s.signatureData}
                                                        alt="Signature"
                                                        width={300}
                                                        height={300}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CrewTrainingInfo
