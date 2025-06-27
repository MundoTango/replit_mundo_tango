'use client'
import EventDetail from "@/components/Events/EventDetails/EventDetail"
import { useSearchParams } from "next/navigation"

export default function  Page() {
    const id = useSearchParams()?.get("q")
    return <EventDetail id={id}/>
  }