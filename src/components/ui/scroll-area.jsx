import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

// ⚡ Performance: Memoized scroll area with optimized re-renders
const ScrollArea = React.memo(React.forwardRef(({ className, children, ...props }, ref) => {
  // ⚡ Performance: Memoized className calculation
  const scrollClassName = React.useMemo(
    () => cn("relative overflow-hidden", className),
    [className]
  )

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={scrollClassName}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}))

// ⚡ Performance: Memoized scroll bar with orientation-based styling
const ScrollBar = React.memo(React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => {
  // ⚡ Performance: Memoized className calculation based on orientation
  const scrollBarClassName = React.useMemo(
    () => cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    [orientation, className]
  )

  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={scrollBarClassName}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}))

// ⚡ Performance: Optimized scroll area with virtualization support for large content
const VirtualizedScrollArea = React.memo(React.forwardRef(({ 
  children, 
  itemHeight = 50,
  itemCount,
  renderItem,
  overscan = 5,
  className,
  ...props 
}, ref) => {
  const [scrollTop, setScrollTop] = React.useState(0)
  const containerRef = React.useRef()

  // ⚡ Performance: Calculate visible range
  const { startIndex, endIndex, totalHeight } = React.useMemo(() => {
    const containerHeight = containerRef.current?.clientHeight || 400
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const end = Math.min(itemCount - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)
    
    return {
      startIndex: start,
      endIndex: end,
      totalHeight: itemCount * itemHeight
    }
  }, [scrollTop, itemHeight, itemCount, overscan])

  // ⚡ Performance: Throttled scroll handler
  const handleScroll = React.useCallback(
    React.useMemo(() => {
      let timeoutId
      return (e) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setScrollTop(e.target.scrollTop)
        }, 16) // ~60fps
      }
    }, []),
    []
  )

  const scrollClassName = React.useMemo(
    () => cn("relative overflow-hidden", className),
    [className]
  )

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={scrollClassName}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport 
        ref={containerRef}
        className="h-full w-full rounded-[inherit]"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ 
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}>
            {Array.from({ length: endIndex - startIndex + 1 }, (_, index) => {
              const itemIndex = startIndex + index
              return renderItem ? renderItem(itemIndex) : children
            })}
          </div>
        </div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}))

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName
VirtualizedScrollArea.displayName = "VirtualizedScrollArea"

export { ScrollArea, ScrollBar, VirtualizedScrollArea }
