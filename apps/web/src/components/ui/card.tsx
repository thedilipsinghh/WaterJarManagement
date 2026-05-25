import * as React from "react"

import { Slot } from "@radix-ui/react-slot"

import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-sm border bg-background text-muted-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        destructive: "border-destructive/50 text-destructive",
        outline: "border-border",
        secondary: "border-secondary/50 text-secondary",
        ghost: "hover:bg-accent",
        link: "border-transparent underline-offset-4 hover:underline text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        className={cardVariants({ variant, className })}
        ref={ref}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardContent, cardVariants }