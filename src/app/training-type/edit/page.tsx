'use client'
import TrainingTypeForm from '@/app/ui/training-type/form'
import { useSearchParams } from 'next/navigation'

const TrainingTypeEditPage = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    return <TrainingTypeForm trainingTypeId={+id} />
}

export default TrainingTypeEditPage
