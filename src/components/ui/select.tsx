"use client"

import * as React from "react"
import { Select as BaseSelect } from "@base-ui/react/select"
import { cn } from "@/Qubic/utils/utils"
import { ChevronDown, Check } from "lucide-react"

function Select({
  children,
  value,
  onValueChange,
  disabled,
  defaultValue,
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string | null) => void
  disabled?: boolean
  defaultValue?: string
}) {
  return (
    <BaseSelect.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      defaultValue={defaultValue}
    >
      {children}
    </BaseSelect.Root>
  )
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      {...(props as any)}
    >
      {children}
      <BaseSelect.Icon>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  )
}

function SelectValue({
  placeholder,
  children,
}: {
  placeholder?: string
  children?: React.ReactNode
}) {
  return (
    <BaseSelect.Value placeholder={placeholder}>
      {children}
    </BaseSelect.Value>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <BaseSelect.Positioner>
      <BaseSelect.Popup
        data-slot="select-content"
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
          className
        )}
        {...(props as any)}
      >
        <BaseSelect.ScrollUpArrow />
        <BaseSelect.List className="p-1">
          {children}
        </BaseSelect.List>
        <BaseSelect.ScrollDownArrow />
      </BaseSelect.Popup>
    </BaseSelect.Positioner>
  )
}

function SelectItem({
  className,
  children,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  return (
    <BaseSelect.Item
      value={value}
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...(props as any)}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <BaseSelect.ItemIndicator>
          <Check className="h-4 w-4" />
        </BaseSelect.ItemIndicator>
      </span>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  )
}

function SelectGroup({ children }: { children: React.ReactNode }) {
  return <BaseSelect.Group>{children}</BaseSelect.Group>
}

function SelectLabel({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <BaseSelect.GroupLabel
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    >
      {children}
    </BaseSelect.GroupLabel>
  )
}

function SelectSeparator({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <BaseSelect.Separator
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
    />
  )
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
