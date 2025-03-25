'use client'
import TrainingScheduleInfo from '@/app/ui/training-type/info'
import { useSearchParams } from 'next/navigation'

const TrainingTypeInfoPage = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    return <TrainingScheduleInfo trainingTypeId={+id} />
}

export default TrainingTypeInfoPage
