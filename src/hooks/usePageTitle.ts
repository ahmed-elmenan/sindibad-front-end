import { useEffect } from 'react'
import { useHeaderStore } from '@/stores/headerStore'

export function usePageTitle(title: string) {
  const setTitle = useHeaderStore((state) => state.setTitle)

  useEffect(() => {
    setTitle(title)
    // Optionally reset title when component unmounts
    return () => setTitle('dashboard')
  }, [title, setTitle])
}