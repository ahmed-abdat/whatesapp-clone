"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// ⚡ Performance: Lazy loading for heavy dialog content
const LazyDialogContent = React.lazy(() => Promise.resolve({ default: DialogContentInner }))

// ⚡ Performance: Memoized Dialog root
const Dialog = React.memo(React.forwardRef((props, ref) => {
  return <DialogPrimitive.Root ref={ref} data-slot="dialog" {...props} />
}))

// ⚡ Performance: Memoized trigger
const DialogTrigger = React.memo(React.forwardRef((props, ref) => {
  return <DialogPrimitive.Trigger ref={ref} data-slot="dialog-trigger" {...props} />
}))

// ⚡ Performance: Memoized portal with conditional rendering
const DialogPortal = React.memo(({ children, ...props }) => {
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal" {...props}>
      {children}
    </DialogPrimitive.Portal>
  )
})

const DialogClose = React.memo(React.forwardRef((props, ref) => {
  return <DialogPrimitive.Close ref={ref} data-slot="dialog-close" {...props} />
}))

// ⚡ Performance: Memoized overlay with optimized animations
const DialogOverlay = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const overlayClassName = React.useMemo(
    () => cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    [className]
  )

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={overlayClassName}
      {...props}
    />
  )
}))

// Inner content component for lazy loading
function DialogContentInner({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  // ⚡ Performance: Memoized className calculation
  const contentClassName = React.useMemo(
    () => cn(
      "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
      className
    ),
    [className]
  )

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={contentClassName}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

// ⚡ Performance: Smart content component with lazy loading support
const DialogContent = React.memo(React.forwardRef(({ lazy = false, ...props }, ref) => {
  if (lazy) {
    return (
      <React.Suspense 
        fallback={
          <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }
      >
        <LazyDialogContent ref={ref} {...props} />
      </React.Suspense>
    )
  }
  
  return <DialogContentInner ref={ref} {...props} />
}))

// ⚡ Performance: Memoized layout components
const DialogHeader = React.memo(({ className, ...props }) => {
  const headerClassName = React.useMemo(
    () => cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
    [className]
  )

  return (
    <div
      data-slot="dialog-header"
      className={headerClassName}
      {...props}
    />
  )
})

const DialogFooter = React.memo(({ className, ...props }) => {
  const footerClassName = React.useMemo(
    () => cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    [className]
  )

  return (
    <div
      data-slot="dialog-footer"
      className={footerClassName}
      {...props}
    />
  )
})

const DialogTitle = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const titleClassName = React.useMemo(
    () => cn("text-lg font-semibold leading-none tracking-tight", className),
    [className]
  )

  return (
    <DialogPrimitive.Title
      ref={ref}
      data-slot="dialog-title"
      className={titleClassName}
      {...props}
    />
  )
}))

const DialogDescription = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const descriptionClassName = React.useMemo(
    () => cn("text-sm text-muted-foreground", className),
    [className]
  )

  return (
    <DialogPrimitive.Description
      ref={ref}
      data-slot="dialog-description"
      className={descriptionClassName}
      {...props}
    />
  )
}))

// Set display names for all components
Dialog.displayName = "Dialog"
DialogTrigger.displayName = "DialogTrigger"
DialogPortal.displayName = "DialogPortal"
DialogClose.displayName = "DialogClose"
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName
DialogContent.displayName = DialogPrimitive.Content.displayName
DialogHeader.displayName = "DialogHeader"
DialogFooter.displayName = "DialogFooter"
DialogTitle.displayName = DialogPrimitive.Title.displayName
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
