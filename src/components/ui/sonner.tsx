"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner"
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

type ToastProps = React.ComponentProps<typeof SonnerToaster> & {
  richColors?: boolean
}

export const Toaster = ({ richColors = true, ...props }: ToastProps) => {
  const { theme = "system" } = useTheme()

  return (
    <SonnerToaster
      theme={theme as "system" | "light" | "dark" | undefined}
      className="toaster group"
      closeButton
      richColors={richColors}
      expand={false}
      position="bottom-right"
      toastOptions={{
        duration: 6000,
        classNames: {
          toast: "group toast group flex w-full gap-3 rounded-lg border p-4 pr-8 shadow-lg",
          title: "text-sm font-semibold [&+div]:text-xs !text-base",
          description: "text-sm opacity-90 !text-sm", 
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "absolute right-2 top-2 p-1 rounded-full text-foreground/60 opacity-80 transition-transform transition-opacity hover:scale-125 hover:opacity-100 focus:ring-2 focus:ring-ring focus:outline-none disabled:pointer-events-none pointer-events-auto z-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-5",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--accent)",
          "--success-text": "var(--accent-foreground)",
          "--success-border": "var(--accent)",
          "--error-bg": "var(--destructive)",
          "--error-text": "#ffffff",
          "--error-border": "var(--destructive)",
          "--warning-bg": "var(--muted)",
          "--warning-text": "var(--muted-foreground)",
          "--warning-border": "var(--muted)",
          "--info-bg": "var(--primary)",
          "--info-text": "var(--primary-foreground)",
          "--info-border": "var(--primary)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export type ToastType = "success" | "error" | "warning" | "info" | "default"

interface ToastOptions {
  title?: string
  description?: string
  action?: React.ReactNode
  cancel?: React.ReactNode
  duration?: number
  id?: string
  important?: boolean
  onDismiss?: (id: string) => void
  onAutoClose?: (id: string) => void
  className?: string
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
}

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-accent-foreground" />
    case "error":
      return <AlertCircle className="h-5 w-5 text-white" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-muted-foreground" />
    case "info":
      return <Info className="h-5 w-5 text-primary-foreground" />
    default:
      return null
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
  success: (options: string | ToastOptions) => {
    if (typeof options === "string") {
      return sonnerToast.success(options, {
        icon: getToastIcon("success"),
      })
    }

    const { title, description, onDismiss, onAutoClose, ...rest } = options
    return sonnerToast.success(title, {
      description,
      icon: getToastIcon("success"),
      ...(onDismiss && { onDismiss: (toast) => onDismiss(String(toast.id)) }),
      ...(onAutoClose && { onAutoClose: (toast) => onAutoClose(String(toast.id)) }),
      ...rest,
    })
  },

  error: (options: string | ToastOptions) => {
    if (typeof options === "string") {
      return sonnerToast.error(options, {
        icon: getToastIcon("error"),
      })
    }

    const { title, description, onDismiss, onAutoClose, ...rest } = options
    return sonnerToast.error(title, {
      description,
      icon: getToastIcon("error"),
      ...(onDismiss && { onDismiss: (toast) => onDismiss(String(toast.id)) }),
      ...(onAutoClose && { onAutoClose: (toast) => onAutoClose(String(toast.id)) }),
      ...rest,
    })
  },

  warning: (options: string | ToastOptions) => {
    if (typeof options === "string") {
      return sonnerToast.warning(options, {
        icon: getToastIcon("warning"),
      })
    }

    const { title, description, onDismiss, onAutoClose, ...rest } = options
    return sonnerToast.warning(title, {
      description,
      icon: getToastIcon("warning"),
      ...(onDismiss && { onDismiss: (toast) => onDismiss(String(toast.id)) }),
      ...(onAutoClose && { onAutoClose: (toast) => onAutoClose(String(toast.id)) }),
      ...rest,
    })
  },

  info: (options: string | ToastOptions) => {
    if (typeof options === "string") {
      return sonnerToast.info(options, {
        icon: getToastIcon("info"),
      })
    }

    const { title, description, onDismiss, onAutoClose, ...rest } = options
    return sonnerToast.info(title, {
      description,
      icon: getToastIcon("info"),
      ...(onDismiss && { onDismiss: (toast) => onDismiss(String(toast.id)) }),
      ...(onAutoClose && { onAutoClose: (toast) => onAutoClose(String(toast.id)) }),
      ...rest,
    })
  },

  default: (options: string | ToastOptions) => {
    if (typeof options === "string") {
      return sonnerToast(options)
    }

    const { title, description, onDismiss, onAutoClose, ...rest } = options
    return sonnerToast(title, {
      description,
      ...(onDismiss && { onDismiss: (toast) => onDismiss(String(toast.id)) }),
      ...(onAutoClose && { onAutoClose: (toast) => onAutoClose(String(toast.id)) }),
      ...rest,
    })
  },

  dismiss: sonnerToast.dismiss,
  custom: sonnerToast.custom,
  promise: sonnerToast.promise,
  loading: sonnerToast.loading,
};
