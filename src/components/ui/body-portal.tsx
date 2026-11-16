import { useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

type BodyPortalProps = {
  children: ReactNode
}

export function BodyPortal({ children }: BodyPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return createPortal(children, document.body)
}