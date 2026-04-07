"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
        error: <OctagonX className="h-4 w-4" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#14417A] group-[.toaster]:text-white group-[.toaster]:border-[#0F2E52] group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-[#0F2E52] dark:group-[.toaster]:text-white dark:group-[.toaster]:border-[#14417A]",
          description: "group-[.toast]:text-white/80",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-[#0F2E52]",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white",
          icon: "group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
