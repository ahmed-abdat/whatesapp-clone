"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ⚡ Performance: Virtual scrolling hook for large datasets
function useVirtualScroll({
  data,
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5
}) {
  const [scrollTop, setScrollTop] = React.useState(0)
  
  const visibleItems = React.useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      data.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    
    return {
      startIndex,
      endIndex,
      items: data.slice(startIndex, endIndex + 1),
      offsetY: startIndex * itemHeight,
      totalHeight: data.length * itemHeight
    }
  }, [data, scrollTop, itemHeight, containerHeight, overscan])
  
  return { visibleItems, setScrollTop }
}

// ⚡ Performance: Virtualized table implementation
const VirtualizedTable = React.memo(({
  data,
  itemHeight = 50,
  containerHeight = 400,
  className,
  children,
  renderRow,
  ...props
}) => {
  const { visibleItems, setScrollTop } = useVirtualScroll({
    data,
    itemHeight,
    containerHeight
  })

  const handleScroll = React.useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [setScrollTop])

  const tableClassName = React.useMemo(
    () => cn("w-full caption-bottom text-sm", className),
    [className]
  )

  return (
    <div
      className="relative overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleItems.totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${visibleItems.offsetY}px)` }}>
          <table
            data-slot="table"
            className={tableClassName}
            {...props}
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === TableHeader) {
                return child
              }
              if (React.isValidElement(child) && child.type === TableBody) {
                return React.cloneElement(child, {
                  children: visibleItems.items.map((item, itemIndex) => 
                    renderRow ? renderRow(item, visibleItems.startIndex + itemIndex) : null
                  )
                })
              }
              return child
            })}
          </table>
        </div>
      </div>
    </div>
  )
})

// ⚡ Performance: Memoized table component with optional virtualization
const Table = React.memo(React.forwardRef(({ 
  className, 
  children,
  virtualized = false,
  data = [],
  itemHeight = 50,
  containerHeight = 400,
  renderRow,
  virtualizeThreshold = 100,
  ...props 
}, ref) => {
  const shouldVirtualize = virtualized && data.length > virtualizeThreshold

  if (shouldVirtualize) {
    return (
      <VirtualizedTable 
        ref={ref}
        data={data} 
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        className={className}
        renderRow={renderRow}
        {...props}
      >
        {children}
      </VirtualizedTable>
    )
  }

  const tableClassName = React.useMemo(
    () => cn("w-full caption-bottom text-sm", className),
    [className]
  )

  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        ref={ref}
        data-slot="table"
        className={tableClassName}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}))

// ⚡ Performance: Memoized table components
const TableHeader = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const headerClassName = React.useMemo(
    () => cn("[&_tr]:border-b", className),
    [className]
  )

  return (
    <thead
      ref={ref}
      data-slot="table-header"
      className={headerClassName}
      {...props}
    />
  )
}))

const TableBody = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const bodyClassName = React.useMemo(
    () => cn("[&_tr:last-child]:border-0", className),
    [className]
  )

  return (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={bodyClassName}
      {...props}
    />
  )
}))

const TableFooter = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const footerClassName = React.useMemo(
    () => cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className),
    [className]
  )

  return (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={footerClassName}
      {...props}
    />
  )
}))

const TableRow = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const rowClassName = React.useMemo(
    () => cn(
      "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
      className
    ),
    [className]
  )

  return (
    <tr
      ref={ref}
      data-slot="table-row"
      className={rowClassName}
      {...props}
    />
  )
}))

const TableHead = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const headClassName = React.useMemo(
    () => cn(
      "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    [className]
  )

  return (
    <th
      ref={ref}
      data-slot="table-head"
      className={headClassName}
      {...props}
    />
  )
}))

const TableCell = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const cellClassName = React.useMemo(
    () => cn(
      "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    [className]
  )

  return (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cellClassName}
      {...props}
    />
  )
}))

const TableCaption = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const captionClassName = React.useMemo(
    () => cn("text-muted-foreground mt-4 text-sm", className),
    [className]
  )

  return (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={captionClassName}
      {...props}
    />
  )
}))

// Set display names
Table.displayName = "Table"
TableHeader.displayName = "TableHeader"
TableBody.displayName = "TableBody"
TableFooter.displayName = "TableFooter"
TableHead.displayName = "TableHead"
TableRow.displayName = "TableRow"
TableCell.displayName = "TableCell"
TableCaption.displayName = "TableCaption"
VirtualizedTable.displayName = "VirtualizedTable"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  useVirtualScroll,
}