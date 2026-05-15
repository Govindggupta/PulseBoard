import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, getDefaultClassNames, type DayPickerProps } from 'react-day-picker'
import 'react-day-picker/style.css'

import { cn } from '../../lib/utils'

function Calendar({ className, classNames, showOutsideDays = true, ...props }: DayPickerProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // In Calendar component, update the className prop:
      className={cn(
        "p-3 text-zinc-100 [--rdp-accent-color:theme(colors.zinc.500)] [--rdp-day_button-border-radius:var(--radius-sm)] [--rdp-selected-border:1px_solid_theme(colors.zinc.300)] [--rdp-today-color:theme(colors.zinc.100)] focus-visible:outline-none",
        className,
      )}
      classNames={{
        ...defaultClassNames,
        root: cn(defaultClassNames.root, classNames?.root),
        months: cn(defaultClassNames.months, "gap-4", classNames?.months),
        month_caption: cn(
          defaultClassNames.month_caption,
          "mb-2 text-sm font-medium text-zinc-100",
          classNames?.month_caption,
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          "text-sm font-medium",
          classNames?.caption_label,
        ),
        nav: cn(defaultClassNames.nav, "gap-1", classNames?.nav),
        button_previous: cn(
          defaultClassNames.button_previous,
          "rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-50",
          classNames?.button_previous,
        ),
        button_next: cn(
          defaultClassNames.button_next,
          "rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-50",
          classNames?.button_next,
        ),
        month_grid: cn(
          defaultClassNames.month_grid,
          "w-full border-collapse",
          classNames?.month_grid,
        ),
        weekdays: cn(
          defaultClassNames.weekdays,
          "text-zinc-500",
          classNames?.weekdays,
        ),
        weekday: cn(
          defaultClassNames.weekday,
          "text-xs font-medium text-zinc-500",
          classNames?.weekday,
        ),
        day: cn(
          defaultClassNames.day,
          "p-0 text-center text-sm",
          classNames?.day,
        ),
day_button: cn(
  defaultClassNames.day_button,
  'rounded-md text-sm transition-colors hover:bg-white/10 hover:text-zinc-50 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
  classNames?.day_button,
),
        today: cn(
          defaultClassNames.today,
          "font-semibold text-zinc-50",
          classNames?.today,
        ),
        selected: cn(
          defaultClassNames.selected,
          "[&_.rdp-day_button]:border-zinc-100 [&_.rdp-day_button]:bg-zinc-100 [&_.rdp-day_button]:text-zinc-950",
          classNames?.selected,
        ),
        outside: cn(
          defaultClassNames.outside,
          "text-zinc-600 opacity-60",
          classNames?.outside,
        ),
        disabled: cn(
          defaultClassNames.disabled,
          "text-zinc-700 opacity-50",
          classNames?.disabled,
        ),
        hidden: cn(defaultClassNames.hidden, "invisible", classNames?.hidden),
      }}
      components={{
        Chevron: ({
          orientation,
          className: chevronClassName,
          ...chevronProps
        }) =>
          orientation === "left" ? (
            <ChevronLeft
              className={cn("h-4 w-4", chevronClassName)}
              {...chevronProps}
            />
          ) : (
            <ChevronRight
              className={cn("h-4 w-4", chevronClassName)}
              {...chevronProps}
            />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar }
