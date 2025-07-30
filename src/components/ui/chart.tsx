import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: Record<string, any>
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("h-[350px] w-full", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: any[]
  label?: string
}

export const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ active, payload, label, className, ...props }, ref) => {
    if (!active || !payload || !payload.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-background p-2 shadow-md",
          className
        )}
        {...props}
      >
        {label && (
          <div className="font-medium text-foreground mb-1">{label}</div>
        )}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
)
ChartTooltip.displayName = "ChartTooltip"

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: any[]
  label?: string
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  labelFormatter?: (value: any, payload: any[]) => React.ReactNode
  formatter?: (value: any, name: any, props: any) => React.ReactNode
}

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ 
    active, 
    payload, 
    label, 
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    labelFormatter,
    formatter,
    ...props 
  }, ref) => {
    if (!active || !payload || !payload.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...props}
      >
        {!hideLabel && label && (
          <div className="font-medium text-foreground">
            {labelFormatter ? labelFormatter(label, payload) : label}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground">
              {!hideIndicator && (
                <div
                  className="shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg] h-2.5 w-2.5"
                  style={{
                    '--color-bg': entry.color,
                    '--color-border': entry.color,
                  } as React.CSSProperties}
                />
              )}
              <div className="flex flex-1 justify-between leading-none">
                <div className="grid gap-1.5">
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {formatter ? formatter(entry.value, entry.name, entry) : entry.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export function useChart() {
  return { config: {} }
}