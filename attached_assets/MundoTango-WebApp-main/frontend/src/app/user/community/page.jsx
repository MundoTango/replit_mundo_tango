'use client'
import CommunityDetail from "@/components/Community/CommmunityDetails"
import { useSearchParams } from "next/navigation"

export default function  Page() {
    const id = useSearchParams()?.get("q")
    return <CommunityDetail id={id}/>
  }