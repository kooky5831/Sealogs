'use client'
import {
    ExclamationTriangleIcon,
    ChatBubbleBottomCenterTextIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import {
    Button,
    Heading,
    Select as PopupSelect,
    DialogTrigger,
    Modal,
    ModalOverlay,
    Dialog,
    Popover,
    ListBox,
    ListBoxItem,
} from 'react-aria-components'
import { TableWrapper } from '@/app/components/Components'
export default function CrewQualification() {
    const trainings = [
        {
            id: '1',
            training_location: 'Pilot Boat',
            trainer_name: 'David',
            training_name: 'Fire',
            training_status: 'Overdue',
            training_due_date: '01/01/2024',
        },
        {
            id: '2',
            training_location: 'Tug Boat',
            trainer_name: 'Eve',
            training_name: 'Collision',
            training_status: 'Upcoming',
            training_due_date: '01/02/2024',
        },
        {
            id: '3',
            training_location: 'Big Fairy',
            trainer_name: 'Frank',
            training_name: 'Grounding',
            training_status: 'Overdue',
            training_due_date: '02/01/2024',
        },
    ]

    // Note: This is only for if the Date is in the format of DD/MM/YYYY.
    const dmytodate = (dateString: string) => {
        const [day, month, year] = dateString.split('/')
        return new Date(Number(year), Number(month) - 1, Number(day))
    }

    const sortedTrainings = trainings.sort(
        (a, b) =>
            dmytodate(a.training_due_date).getTime() -
            dmytodate(b.training_due_date).getTime(),
    )

    return (
        <>
            <div className="lg:flex p-4 lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <Heading className="font-semibold derk:text-white p-0">
                        Trainings
                    </Heading>
                </div>
                <div className="mt-5 flex lg:ml-4 lg:mt-0">
                    <span className="sm:ml-3">
                        <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                            Add Training
                        </button>
                    </span>
                </div>
            </div>
            <TableWrapper
                headings={[
                    'Date',
                    'Name of training',
                    'Trainer',
                    'Training Location',
                    '',
                ]}>
                {sortedTrainings.map((training) => (
                    <tr
                        key={training.id}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <th scope="row">
                            <div className="flex items-center px-6 py-2 text-gray-900 whitespace-nowrap dark:text-white">
                                {training.training_status === 'Upcoming' ? (
                                    <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                                ) : (
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                )}
                                <div className="ps-3">
                                    <div className="text-base font-semibold">
                                        {training.training_due_date}
                                    </div>
                                </div>
                            </div>
                        </th>
                        <td className="px-6 py-2">
                            <div className="text-base">
                                {training.training_name}
                            </div>
                        </td>
                        <td className="px-2 py-2">
                            <div className="text-base">
                                {training.trainer_name}
                            </div>
                        </td>
                        <td className="px-2 py-2">
                            <div className="text-base">
                                {training.training_location}
                            </div>
                        </td>
                        <td className="px-2 py-2">
                            <div className="flex justify-end flex-col md:flex-row">
                                <Button className="rounded mx-1 text-blue-600 bg-transparent flex justify-center items-center dark:text-white">
                                    Edit
                                </Button>
                                <Button className="rounded mx-1 text-blue-600 bg-transparent flex justify-center items-center dark:text-white">
                                    View
                                </Button>
                                <Button className="rounded mx-1 text-blue-600 bg-transparent flex justify-center items-center dark:text-white">
                                    Delete
                                </Button>
                                <Button className="rounded mx-1 text-blue-600 bg-transparent flex justify-center items-center dark:text-white">
                                    PDF
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </TableWrapper>
        </>
    )
}
