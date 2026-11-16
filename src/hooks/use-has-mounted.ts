import { useLayoutEffect, useState } from "react"

export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false)

  useLayoutEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}