import { useEffect } from 'react'

/**
 * Hook to set page title dynamically
 * @param title - Page title to set
 * @param suffix - Optional suffix (defaults to " | Hearty")
 */
export const usePageTitle = (title: string, suffix: string = ' | Hearty') => {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title + suffix

    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle
    }
  }, [title, suffix])
}
