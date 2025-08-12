import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import React, { useMemo, useCallback, useRef, useEffect, useState } from "react"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// ⚡ Performance: Memoized className utility
export function useMemoizedClassName(className, dependencies = []) {
  return useMemo(() => cn(className), dependencies)
}

// ⚡ Performance: Debounced function utility
export function useDebounce(callback, delay) {
  const timeoutRef = useRef()
  
  return useCallback((...args) => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => callback(...args), delay)
  }, [callback, delay])
}

// ⚡ Performance: Throttled function utility
export function useThrottle(callback, delay) {
  const timeoutRef = useRef()
  const lastExecRef = useRef(0)
  
  return useCallback((...args) => {
    const now = Date.now()
    
    if (now - lastExecRef.current > delay) {
      callback(...args)
      lastExecRef.current = now
    } else {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        callback(...args)
        lastExecRef.current = Date.now()
      }, delay - (now - lastExecRef.current))
    }
  }, [callback, delay])
}

// ⚡ Performance: Intersection Observer hook for lazy loading
export function useIntersectionObserver(options = {}) {
  const [entry, setEntry] = useState()
  const [node, setNode] = useState()
  
  const { threshold, rootMargin, root } = options
  
  useEffect(() => {
    if (!node) return
    
    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, rootMargin, root }
    )
    
    observer.observe(node)
    
    return () => observer.disconnect()
  }, [node, threshold, rootMargin, root])
  
  return [setNode, entry]
}

// ⚡ Performance: Previous value hook for change detection
export function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

// ⚡ Performance: Stable callback hook
export function useStableCallback(callback) {
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  })
  
  return useCallback((...args) => {
    return callbackRef.current(...args)
  }, [])
}

// ⚡ Performance: Memoized object to prevent unnecessary re-renders
export function useMemoizedObject(obj, deps = []) {
  return useMemo(() => obj, deps)
}

// ⚡ Performance: Event delegation utility
export function createEventDelegator(rootElement, eventType, selector) {
  const handlers = new Map()
  
  const delegatedHandler = (event) => {
    const target = event.target.closest(selector)
    if (target && handlers.has(target)) {
      handlers.get(target)(event)
    }
  }
  
  rootElement.addEventListener(eventType, delegatedHandler)
  
  return {
    add: (element, handler) => handlers.set(element, handler),
    remove: (element) => handlers.delete(element),
    destroy: () => {
      rootElement.removeEventListener(eventType, delegatedHandler)
      handlers.clear()
    }
  }
}

// ⚡ Performance: Lazy import utility
export function lazyImport(importFn, componentName = 'default') {
  return React.lazy(async () => {
    const module = await importFn()
    return { default: module[componentName] }
  })
}

// ⚡ Performance: Batch state updates utility
export function createBatchUpdater() {
  const updates = []
  let isScheduled = false
  
  const flush = () => {
    const currentUpdates = [...updates]
    updates.length = 0
    isScheduled = false
    
    currentUpdates.forEach(update => update())
  }
  
  const schedule = (update) => {
    updates.push(update)
    
    if (!isScheduled) {
      isScheduled = true
      requestAnimationFrame(flush)
    }
  }
  
  return { schedule }
}

// ⚡ Performance: Resource preloader
export function preloadResource(href, type = 'script') {
  const link = document.createElement('link')
  link.rel = type === 'script' ? 'modulepreload' : 'preload'
  link.href = href
  if (type !== 'script') link.as = type
  document.head.appendChild(link)
}

// ⚡ Performance: Memoized computation with cache invalidation
export function createMemoizedComputation(computeFn, keyFn = (args) => JSON.stringify(args)) {
  const cache = new Map()
  
  return (...args) => {
    const key = keyFn(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = computeFn(...args)
    cache.set(key, result)
    
    // Optional: Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  }
}

// ⚡ Performance: Virtual list utilities
export function calculateVisibleRange(scrollTop, itemHeight, containerHeight, itemCount, overscan = 5) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    itemCount - 1, 
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  
  return {
    startIndex,
    endIndex,
    offsetY: startIndex * itemHeight,
    totalHeight: itemCount * itemHeight
  }
}

// ⚡ Performance: Component performance measurement
export function measureComponentPerformance(ComponentName) {
  return function PerformanceMeasuredComponent(props) {
    useEffect(() => {
      const startTime = performance.now()
      
      return () => {
        const endTime = performance.now()
        console.log(`${ComponentName} render time: ${endTime - startTime}ms`)
      }
    })
    
    return ComponentName(props)
  }
}