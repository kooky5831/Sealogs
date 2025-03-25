'use client'
import CrewDutyForm from '@/app/ui/crew-duty/form'
import { useSearchParams } from 'next/navigation'

const CrewDutyEditForm = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    return <CrewDutyForm crewDutyId={+id} />
}

export default CrewDutyEditForm
