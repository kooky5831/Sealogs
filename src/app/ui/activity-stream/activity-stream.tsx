import React from 'react'
import { ActivityStreamProps } from './activity-stream.props'
import { ActivityStreamType } from '../../../../types/activity-stream'
import { Link } from 'react-aria-components'

export function ActivityStream(props: ActivityStreamProps) {
    const dateDiff = (created: any) => {
        const firstDate: Date = new Date(created.split(' ')[0])
        const secondDate: Date = new Date()
        var timeDiff = Math.abs(firstDate.getTime() - secondDate.getTime())
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))

        const msInHour = 1000 * 60 * 60
        const hours = Math.trunc(timeDiff / msInHour)

        if (hours > 24) {
            return `${diffDays} days ago.`
        } else {
            if (hours < 1) {
                return `${hours} minute(s) ago.`
            } else {
                return `${hours} hours ago.`
            }
        }
    }

    return (
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"></thead>
            <tbody>
                {props.activityStream.map(
                    (activityStream: ActivityStreamType) => (
                        <tr
                            key={activityStream.ID}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4">
                                <span className="ps-3">
                                    <Link
                                        href={`${activityStream.RefererURL}/${activityStream.TargetID}`}>
                                        <span className="text-base capitalize">
                                            {`${activityStream.Member?.FirstName} ${activityStream.Member?.Surname} ${activityStream.Title}, ${dateDiff(activityStream.Created)}`}
                                        </span>
                                    </Link>
                                </span>
                            </td>
                        </tr>
                    ),
                )}
            </tbody>
        </table>
    )
}
