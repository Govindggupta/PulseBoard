import type { SVGProps } from 'react'

import { cn } from '../../lib/utils'

type PulseBoardLogoProps = SVGProps<SVGSVGElement> & {
  label?: string
}

export function PulseBoardLogo({ className, label = 'PulseBoard logo', ...props }: PulseBoardLogoProps) {
  return (
    <svg
      aria-label={label}
      className={cn('h-10 w-10 text-zinc-50', className)}
      fill="none"
      role="img"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect height="38" rx="10" stroke="currentColor" strokeOpacity="0.32" strokeWidth="2" width="38" x="5" y="5" />
      <path d="M14 29.5H18V23H14V29.5Z" fill="currentColor" opacity="0.28" />
      <path d="M22 29.5H26V18.5H22V29.5Z" fill="currentColor" opacity="0.42" />
      <path d="M30 29.5H34V21.5H30V29.5Z" fill="currentColor" opacity="0.28" />
      <path
        d="M11.5 24.5H16.2L19.8 17L25.2 32L29.3 23.5H36.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
      <circle cx="36.5" cy="16" fill="currentColor" r="2" />
    </svg>
  )
}
