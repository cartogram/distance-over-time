import {useEffect, useState} from 'react'
import {useDebouncedCallback} from 'use-debounce'

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  function setSize() {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }

  const debounced = useDebouncedCallback(setSize, 200)

  useEffect(() => {
    window.addEventListener('resize', debounced)
    setSize()

    return () => window.removeEventListener('resize', debounced)
  }, [])

  return windowSize
}
