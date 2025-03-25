'use client';
import { useSearchParams } from 'next/navigation'
import CompleteRecurringTask from '@/app/ui/maintenance/complete-recurring-task'

export default function Page() {
  const searchParams = useSearchParams()
  const taskID = searchParams.get('taskID') ?? 0
  const lastCompletedDate = searchParams.get('lastCompletedDate') ?? ''
  return (
      <CompleteRecurringTask taskID={taskID as number} lastCompletedDate={lastCompletedDate as any}/>
  );
}
