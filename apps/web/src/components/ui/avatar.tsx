import * as React from "react"

import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null
  alt: string
  /** Iniciales de respaldo si no hay foto o si la imagen falla al cargar. */
  fallback: string
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt, fallback, className, ...props }, ref) => {
    const [imageFailed, setImageFailed] = React.useState(false)
    const showImage = Boolean(src) && !imageFailed

    return (
      <span
        ref={ref}
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cee-red text-xs font-semibold uppercase text-white",
          className
        )}
        {...props}
      >
        {showImage ? (
          <img
            src={src ?? undefined}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span aria-hidden="true">{fallback}</span>
        )}
      </span>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
