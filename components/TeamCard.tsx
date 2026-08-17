import Image from "next/image";

export type TeamMember = {
  name: string;
  role: string;
  photo: string;
};

export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink-gradient">
        <Image
          src={member.photo}
          alt={`${member.name}, ${member.role} at FroshX`}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover object-top grayscale-[15%] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>
      <p className="font-display text-lg font-semibold mt-4">{member.name}</p>
      <p className="text-sm text-flare-600 font-medium">{member.role}</p>
    </div>
  );
}
