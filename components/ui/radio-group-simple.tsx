"use client"

import * as React from "react"

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface RadioGroupItemProps {
  value: string
  id?: string
  className?: string
  children?: React.ReactNode
}

const RadioGroup = ({ value, onValueChange, children, className }: RadioGroupProps) => {
  return (
    <div className={`grid gap-2 ${className || ""}`} role="radiogroup">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as any
          return React.cloneElement(child as React.ReactElement<any>, {
            ...childProps,
            checked: childProps.value === value,
            onChange: () => onValueChange?.(childProps.value),
          })
        }
        return child
      })}
    </div>
  )
}

const RadioGroupItem = ({ value, id, className, children, ...props }: RadioGroupItemProps & any) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={id}
        value={value}
        className={`h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-primary ${className || ""}`}
        {...props}
      />
      {children}
    </div>
  )
}

export { RadioGroup, RadioGroupItem }