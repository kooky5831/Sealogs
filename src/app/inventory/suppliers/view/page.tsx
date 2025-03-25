'use client';

import Supplier from "@/app/ui/inventory/supplier";
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const supplierID = parseInt(searchParams.get('id') || '')
  return (
      <Supplier supplierID={supplierID}/>
  );
}