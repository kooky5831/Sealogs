'use client'
import CrewView from '@/app/ui/crew/view'
import { useSearchParams } from 'next/navigation'

const CrewMemberInfo = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get('id') ?? 0
    return (
        <div>
            <CrewView crewId={+id} />
        </div>
    )
}
export default CrewMemberInfo
