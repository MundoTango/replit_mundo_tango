'use client'
import GroupDetails from "@/components/Groups/GroupDetails/GroupDetails"
import { useSearchParams } from "next/navigation"

export default function  Page() {
    const id = useSearchParams()?.get("q")
    return <GroupDetails id={id}/>
  }