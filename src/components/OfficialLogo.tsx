import Image from "next/image"

interface OfficialLogoProps {
  className?: string
  priority?: boolean
}

export function OfficialLogo({ className, priority = false }: OfficialLogoProps) {
  return (
    <Image
      src="/images/brand/logo-cat-white.jpg"
      alt="Centro Amigos del Tango, Comodoro Rivadavia"
      width={1635}
      height={583}
      className={className}
      priority={priority}
    />
  )
}
