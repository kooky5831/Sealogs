'use client'
import { List } from '../skeletons'
import dayjs from 'dayjs'
import { TableWrapper } from '@/app/components/Components'
import { formatDate } from '@/app/helpers/dateHelper'
import { classes } from '@/app/components/GlobalClasses'

const CrewVoyages = ({ voyages }: { voyages?: any }) => {
    return (
        <div className="w-full p-0 overflow-auto">
            {!voyages ? (
                <List />
            ) : (
                <TableWrapper
                    headings={[

                    ]}>
                    <tr className='hidden md:table-row'>
                        <td className="text-left p-3">
                            <label className={classes.label}>
                                Date
                            </label>
                        </td>
                        <td className="text-left p-3 border-b border-slblue-200">
                            <label className={classes.label}>
                                Vessel
                            </label>
                        </td>
                        <td className="text-center p-3 border-b border-slblue-200 ">
                            <label className={classes.label}>
                                Duty performed
                            </label>
                        </td>
                        <td className="text-left p-3 border-b border-slblue-200">
                            <label className={classes.label}>
                                Sign in
                            </label>
                        </td>
                        <td className="text-left p-3 border-b border-slblue-200">
                            <label className={classes.label}>
                                Sign out
                            </label>
                        </td>
                        <td className="text-left p-3 border-b border-slblue-200">
                            <label className={classes.label}>
                                Total sea time
                            </label>
                        </td>
                    </tr>
                    {voyages.map((voyage: any) => (
                        <tr
                            key={voyage.id}
                            className={`group border-b dark:border-gray-400 hover:bg-white  dark:hover:bg-slblue-700 dark:bg-sldarkblue-800 dark:even:bg-sldarkblue-800/90`}>
                            <td className="px-2 py-3 dark:text-white">
                                {voyage.punchIn
                                        ? formatDate(voyage.punchIn)
                                        : formatDate(
                                              voyage.logBookEntry.startDate,
                                          )
                                }
                            </td>
                            <td className="px-2 py-3 dark:text-white">
                                {voyage.logBookEntry.vehicle.title}
                            </td>
                            <td className="px-2 py-3 dark:text-white">
                                {voyage.dutyPerformed.title}
                            </td>
                            <td className="px-2 py-3 dark:text-white">
                                {formatDate(voyage.punchIn)}
                            </td>
                            <td className="px-2 py-3 dark:text-white">
                                {formatDate(voyage.punchOut)}
                            </td>
                            <td className="px-2 py-3 dark:text-white">
                                {Math.floor(
                                    (dayjs(voyage.punchOut).valueOf() -
                                        dayjs(voyage.punchIn).valueOf()) /
                                        (1000 * 60 * 60),
                                )}{' '}
                                Hours
                            </td>
                        </tr>
                    ))}
                </TableWrapper>
            )}
        </div>
    )
}

export default CrewVoyages
