"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, List, Upload, Settings, FileText } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function DashboardNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const items = [
    {
      href: "/dashboard",
      title: "Panoramica",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/receipts",
      title: "Scontrini",
      icon: <List className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/upload",
      title: "Carica",
      icon: <Upload className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/compare",
      title: "Confronta",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/flyers",
      title: "Volantini",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/settings",
      title: "Impostazioni",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
