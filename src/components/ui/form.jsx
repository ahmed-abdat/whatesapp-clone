"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

// ⚡ Performance: Optimized form field context with memoization
const FormFieldContext = React.createContext({})

const FormField = React.memo(({
  ...props
}) => {
  // ⚡ Performance: Memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({ name: props.name }),
    [props.name]
  )

  return (
    <FormFieldContext.Provider value={contextValue}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
})

// ⚡ Performance: Optimized form field hook with selective subscriptions
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  
  // ⚡ Performance: Only subscribe to specific field state to reduce re-renders
  const formState = useFormState({ 
    name: fieldContext.name,
    exact: true // Only subscribe to changes for this specific field
  })
  
  // ⚡ Performance: Memoized field state to prevent recalculation
  const fieldState = React.useMemo(
    () => getFieldState(fieldContext.name, formState),
    [getFieldState, fieldContext.name, formState]
  )

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  // ⚡ Performance: Memoized return object
  return React.useMemo(() => ({
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }), [id, fieldContext.name, fieldState])
}

// ⚡ Performance: Optimized form item context
const FormItemContext = React.createContext({})

const FormItem = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const id = React.useId()

  // ⚡ Performance: Memoized context value
  const contextValue = React.useMemo(
    () => ({ id }),
    [id]
  )

  const itemClassName = React.useMemo(
    () => cn("grid gap-2", className),
    [className]
  )

  return (
    <FormItemContext.Provider value={contextValue}>
      <div
        ref={ref}
        data-slot="form-item"
        className={itemClassName}
        {...props}
      />
    </FormItemContext.Provider>
  )
}))

const FormLabel = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  const labelClassName = React.useMemo(
    () => cn("data-[error=true]:text-destructive", className),
    [className]
  )

  return (
    <Label
      ref={ref}
      data-slot="form-label"
      data-error={!!error}
      className={labelClassName}
      htmlFor={formItemId}
      {...props}
    />
  )
}))

const FormControl = React.memo(React.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  // ⚡ Performance: Memoized aria-describedby to prevent string concatenation on every render
  const ariaDescribedBy = React.useMemo(
    () => !error
      ? `${formDescriptionId}`
      : `${formDescriptionId} ${formMessageId}`,
    [error, formDescriptionId, formMessageId]
  )

  return (
    <Slot
      ref={ref}
      data-slot="form-control"
      id={formItemId}
      aria-describedby={ariaDescribedBy}
      aria-invalid={!!error}
      {...props}
    />
  )
}))

const FormDescription = React.memo(React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  const descriptionClassName = React.useMemo(
    () => cn("text-muted-foreground text-sm", className),
    [className]
  )

  return (
    <p
      ref={ref}
      data-slot="form-description"
      id={formDescriptionId}
      className={descriptionClassName}
      {...props}
    />
  )
}))

const FormMessage = React.memo(React.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  
  // ⚡ Performance: Memoized body computation to prevent recalculation
  const body = React.useMemo(
    () => error ? String(error?.message ?? "") : children,
    [error, children]
  )

  const messageClassName = React.useMemo(
    () => cn("text-destructive text-sm", className),
    [className]
  )

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      data-slot="form-message"
      id={formMessageId}
      className={messageClassName}
      {...props}
    >
      {body}
    </p>
  )
}))

// ⚡ Performance: Optimized form validation component
const FormValidation = React.memo(({ 
  children, 
  validationRules = {},
  debounceMs = 300 
}) => {
  const { watch, trigger } = useFormContext()
  const [debouncedTrigger] = React.useMemo(
    () => {
      let timeoutId
      return [(fieldName) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => trigger(fieldName), debounceMs)
      }]
    },
    [trigger, debounceMs]
  )

  // ⚡ Performance: Watch only specific fields to reduce re-renders
  const watchedFields = React.useMemo(
    () => Object.keys(validationRules),
    [validationRules]
  )

  React.useEffect(() => {
    if (watchedFields.length > 0) {
      const subscription = watch((value, { name }) => {
        if (name && validationRules[name]) {
          debouncedTrigger(name)
        }
      })
      return () => subscription.unsubscribe()
    }
  }, [watch, debouncedTrigger, validationRules, watchedFields])

  return children
})

// Set display names
FormField.displayName = "FormField"
FormItem.displayName = "FormItem"
FormLabel.displayName = "FormLabel"
FormControl.displayName = "FormControl"
FormDescription.displayName = "FormDescription"
FormMessage.displayName = "FormMessage"
FormValidation.displayName = "FormValidation"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormValidation,
}