"use client"

import { useTheme } from "next-themes"
import React from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({
  position,
  richColors,
  closeButton,
  style,
  ...rest
}: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position ?? "bottom-right"}   
      richColors={richColors ?? true}
      closeButton={closeButton ?? true}
      className="toaster group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        ...style,
      } as React.CSSProperties}
      {...rest}
    />
  )
}

export { Toaster }
