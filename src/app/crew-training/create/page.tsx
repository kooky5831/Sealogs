'use client'
import TrainingForm from '@/app/ui/crew-training/form'
import { useSearchParams } from 'next/navigation'

const TrainingSessionCreatePage = () => {
    const searchParams = useSearchParams()
    const memberId = searchParams.get('memberId') ?? 0
    const vesselId = searchParams.get('vesselId') ?? 0
    const trainingTypeId = searchParams.get('trainingTypeId') ?? 0
    return (
        <TrainingForm
            trainingID={0}
            memberId={+memberId}
            vesselId={+vesselId}
            trainingTypeId={+trainingTypeId}
        />
    )
}

export default TrainingSessionCreatePage
