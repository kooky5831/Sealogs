'use client'
import CrewTrainingInfo from '@/app/ui/crew-training/info'
import { useSearchParams } from 'next/navigation'

const CrewTrainingInfoPage = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    return <CrewTrainingInfo trainingID={+id} />
}

export default CrewTrainingInfoPage
