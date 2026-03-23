 "use client"

import { notFound } from "next/navigation"
import type { ComponentType } from "react"
import dynamic from "next/dynamic"
import { use } from "react"

const ALLOWED_PAGES = new Set([
  "alerts",
  "avatars",
  "badge",
  "bar-chart",
  "basic-tables",
  "blank",
  "buttons",
  "calendar",
  "form-elements",
  "images",
  "line-chart",
  "profile",
  "sidebar",
  "signin",
  "signup",
  "videos",
])

const DASHBOARD_COMPONENTS: Record<string, ComponentType> = {
  alerts: dynamic(() => import("@/dashboard-component/src/pages/UiElements/Alerts"), { ssr: false }),
  avatars: dynamic(() => import("@/dashboard-component/src/pages/UiElements/Avatars"), { ssr: false }),
  badge: dynamic(() => import("@/dashboard-component/src/pages/UiElements/Badges"), { ssr: false }),
  "bar-chart": dynamic(() => import("@/dashboard-component/src/pages/Charts/BarChart"), { ssr: false }),
  "basic-tables": dynamic(() => import("@/dashboard-component/src/pages/Tables/BasicTables"), { ssr: false }),
  blank: dynamic(() => import("@/dashboard-component/src/pages/Blank"), { ssr: false }),
  buttons: dynamic(() => import("@/dashboard-component/src/pages/UiElements/Buttons"), { ssr: false }),
  calendar: dynamic(() => import("@/dashboard-component/src/pages/Calendar"), { ssr: false }),
  "form-elements": dynamic(() => import("@/dashboard-component/src/pages/Forms/FormElements"), { ssr: false }),
  images: dynamic(() => import("@/dashboard-component/src/pages/UiElements/Images"), { ssr: false }),
  "line-chart": dynamic(() => import("@/dashboard-component/src/pages/Charts/LineChart"), { ssr: false }),
  profile: dynamic(() => import("@/dashboard-component/src/pages/UserProfiles"), { ssr: false }),
  sidebar: dynamic(() => import("@/dashboard-component/src/pages/Blank"), { ssr: false }),
  signin: dynamic(() => import("@/dashboard-component/src/pages/AuthPages/SignIn"), { ssr: false }),
  signup: dynamic(() => import("@/dashboard-component/src/pages/AuthPages/SignUp"), { ssr: false }),
  videos: dynamic(() => import("@/dashboard-component/src/pages/UiElements/Videos"), { ssr: false }),
}

export default function DashboardTailadminPage({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const { page } = use(params)
  if (!ALLOWED_PAGES.has(page)) {
    notFound()
  }

  const PageComponent = DASHBOARD_COMPONENTS[page]
  if (!PageComponent) {
    notFound()
  }

  return <PageComponent />
}

