import React from 'react'
import { NotificationCommentsProps } from './notification-comments.props'

export function NotificationComments(props: NotificationCommentsProps) {
    const formatDate = (unix_timestamp: any) => {
        const datedata = new Date(unix_timestamp * 1000)
        const year = datedata.getFullYear()
        const date = datedata.getDate()
        const hour = datedata.getHours() % 2
        const min = datedata.getMinutes()
        const time =
            (date < 10 ? `0${date}` : date) +
            '/' +
            (datedata.getMonth() + 1 < 10
                ? `0${datedata.getMonth() + 1}`
                : datedata.getMonth()) +
            '/' +
            year +
            ' ' +
            (hour < 10 ? `0${hour}` : hour) +
            ':' +
            min +
            (hour >= 12 ? 'pm' : 'am')
        return time
    }

    return (
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"></thead>
            <tbody>
                {props.notifications.map((notification) => (
                    <tr
                        key={notification.ID}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4">
                            <span className="ps-3">
                                <span className="text-base capitalize">
                                    {notification.VesselTitle}
                                </span>
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="ps-3">
                                <span className="text-base capitalize">
                                    {formatDate(notification.LastEdited)}
                                </span>
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="ps-3">
                                <span className="text-base capitalize">
                                    {notification.NiceCommentType.replace(
                                        'Field Comment',
                                        '',
                                    )}
                                </span>
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="ps-3">
                                <span className="text-base capitalize">
                                    {notification.EnteredBy}
                                </span>
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="ps-3">
                                <span className="text-base capitalize">
                                    {notification.Comment}
                                </span>
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
