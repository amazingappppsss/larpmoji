import { useEffect, useRef, useState } from 'react'

/**
 * useState that is mirrored to localStorage.
 * `onError` fires if the browser refuses to save (e.g. storage quota exceeded).
 */
export function useLocalStorage<T>(key: string, initial: T, onError?: (err: unknown) => void) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  const errRef = useRef(onError)
  useEffect(() => {
    errRef.current = onError
  }, [onError])

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      errRef.current?.(err)
    }
  }, [key, value])

  return [value, setValue] as const
}
