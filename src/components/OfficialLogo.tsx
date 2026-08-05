import Image from "next/image"

interface OfficialLogoProps {
  className?: string
  priority?: boolean
  compact?: boolean
}

export function OfficialLogo({ className, priority = false, compact = false }: OfficialLogoProps) {
  if (compact) {
    return (
      <span
        className={`relative block overflow-hidden rounded-sm bg-white ${className || ""}`}
        role="img"
        aria-label="Centro Amigos del Tango"
      >
        <Image
          src="/images/brand/logo-cat-2025.jpeg"
          alt=""
          fill
          sizes="72px"
          className="object-cover scale-[1.25] translate-y-[4%]"
          priority={priority}
        />
      </span>
    )
  }

  return (
    <Image
      src="/images/brand/logo-cat-2025.jpeg"
      alt="Centro Amigos del Tango, Comodoro Rivadavia"
      width={1350}
      height={1080}
      className={className}
      priority={priority}
    />
  )
}
