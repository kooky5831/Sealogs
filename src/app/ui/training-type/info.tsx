'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TrainingTypeType } from '../../../../types/training-type'
import { TRAINING_TYPE_BY_ID } from '@/app/lib/graphQL/query'
import { useLazyQuery } from '@apollo/client'
import { TrainingTypeInfoSkeleton } from '../skeletons'
import { Button, Heading } from 'react-aria-components'
import { SeaLogsButton } from '@/app/components/Components'
import { getTrainingTypeByID } from '@/app/lib/actions'
import { getPermissions, hasPermission } from '@/app/helpers/userHelper'
import Loading from '@/app/loading'

const TrainingScheduleInfo = ({
    trainingTypeId,
}: {
    trainingTypeId: number
}) => {
    if (trainingTypeId <= 0) {
        redirect('/training-type')
    }

    const [trainingType, setTrainingType] = useState<any>()

    getTrainingTypeByID(trainingTypeId, setTrainingType)

    const [permissions, setPermissions] = useState<any>(false)

    useEffect(() => {
        setPermissions(getPermissions)
    }, [])

    if (
        !permissions ||
        !hasPermission(
            process.env.EDIT_TRAINING || 'EDIT_TRAINING',
            permissions,
        )
    ) {
        return !permissions ? (
            <Loading />
        ) : (
            <Loading errorMessage="Oops! You do not have the permission to view this section." />
        )
    }

    return (
        <div className="w-full p-0">
            {!trainingType ? (
                <TrainingTypeInfoSkeleton />
            ) : (
                <>
                    <div className="flex justify-between pb-4 pt-3 items-center">
                        <Heading className="font-light font-monasans text-3xl dark:text-white">
                            Training Types
                        </Heading>
                        <div className="flex items-center mr-1">
                            <SeaLogsButton
                                link={`/training-type/edit?id=${trainingTypeId}`}
                                text="Edit"
                                type="secondary"
                                color="sky"
                                icon="pencil"
                            />
                            <SeaLogsButton
                                link={`/crew-training/create?trainingTypeId=${trainingTypeId}`}
                                text="Record A Training"
                                type="primary"
                                color="sky"
                                icon="check"
                            />
                        </div>
                    </div>
                    <div className="px-0 md:px-4 py-4 border-t border-b dark:text-white">
                        <div className="group hover:bg-white dark:hover:bg-gray-800 w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                            <div>Nature Of Training</div>
                            <div className="col-span-2">
                                {trainingType?.title || ''}
                            </div>
                        </div>
                        <div className="group hover:bg-white dark:hover:bg-gray-800 w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                            <div>Occurs Every</div>
                            <div className="col-span-2">
                                {trainingType?.occursEvery}{' '}
                                {trainingType?.occursEvery > 1 ? 'days' : 'day'}
                            </div>
                        </div>
                        <div className="group hover:bg-white dark:hover:bg-gray-800 w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                            <div>Medium Warning Within</div>
                            <div className="col-span-2">
                                {trainingType?.mediumWarnWithin}{' '}
                                {trainingType?.mediumWarnWithin > 1
                                    ? 'days'
                                    : 'day'}
                            </div>
                        </div>
                        <div className="group hover:bg-white dark:hover:bg-gray-800 w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                            <div>High Warning Within</div>
                            <div className="col-span-2">
                                {trainingType?.highWarnWithin}{' '}
                                {trainingType?.highWarnWithin > 1
                                    ? 'days'
                                    : 'day'}
                            </div>
                        </div>
                        <div className="group hover:bg-white dark:hover:bg-gray-800 w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                            <div>Procedure</div>
                            <div
                                className="col-span-2"
                                dangerouslySetInnerHTML={{
                                    __html: trainingType?.procedure,
                                }}></div>
                        </div>
                        <div className="group hover:bg-white dark:hover:bg-gray-800 w-full grid grid-cols-3 gap-6 pb-4 pt-3 px-4">
                            <div>Vessels</div>
                            <div className="col-span-2">
                                {trainingType?.vessels?.nodes
                                    .map((v: any) => v.title)
                                    .join(', ')}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
export default TrainingScheduleInfo
