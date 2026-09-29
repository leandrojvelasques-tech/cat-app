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
  attendanceYear: number
  calculatedStatus?: string
}

export function SocioCarnetToggle({ member, awards, attendedMilongas, attendanceYear, calculatedStatus }: SocioCarnetToggleProps) {
  return (
    <DigitalMemberCard
      member={member}
      awards={awards}
      attendedMilongas={attendedMilongas}
      attendanceYear={attendanceYear}
      calculatedStatus={calculatedStatus}
    />
  )
}
