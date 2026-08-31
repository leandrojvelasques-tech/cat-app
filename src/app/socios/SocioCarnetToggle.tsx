import {
  AttendedMilonga,
  DigitalMemberCard,
  DigitalMemberCardMember,
  MemberAward,
} from "./DigitalMemberCard"

interface SocioCarnetToggleProps {
  member: DigitalMemberCardMember
  awards: MemberAward[]
  attendedMilongas: AttendedMilonga[]
  calculatedStatus?: string
}

export function SocioCarnetToggle({ member, awards, attendedMilongas, calculatedStatus }: SocioCarnetToggleProps) {
  return (
    <DigitalMemberCard
      member={member}
      awards={awards}
      attendedMilongas={attendedMilongas}
      calculatedStatus={calculatedStatus}
    />
  )
}
