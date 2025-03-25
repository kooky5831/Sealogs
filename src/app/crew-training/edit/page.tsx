'use client'
import TrainingForm from '@/app/ui/crew-training/form'
import { useSearchParams } from 'next/navigation'

const CrewTrainingEditPage = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    const memberId = searchParams.get('memberId') ?? 0
    const vesselId = searchParams.get('vesselId') ?? 0
    return (
        <TrainingForm
            trainingID={+id}
            memberId={+memberId}
            vesselId={+vesselId}
            trainingTypeId={0}
        />
    )
}

export default CrewTrainingEditPage
