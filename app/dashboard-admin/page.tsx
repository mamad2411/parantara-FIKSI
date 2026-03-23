"use client"

import dynamic from "next/dynamic"

const HomePage = dynamic(() => import("@/dashboard-component/src/pages/Dashboard/Home"), {
  ssr: false,
})

export default function DashboardPage() {
  return <HomePage />
}
