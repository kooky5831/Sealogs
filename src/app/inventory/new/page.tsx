'use client';

import NewInventory from "@/app/ui/inventory/inventory-new";
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const vesselID = searchParams.get('vesselID') ?? 0

  return (
      <NewInventory vesselID={vesselID as number}/>
  );
}