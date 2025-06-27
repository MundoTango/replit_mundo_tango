'use client'
import PostDetails from "@/components/PostDetails/page"
import { useSearchParams } from "next/navigation"

export default function  Page() {
    const id = useSearchParams()?.get("q")
    return <PostDetails id={id}/>
  }