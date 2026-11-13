type P = React.SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const ChartIcon = (p: P) => (<svg {...base} {...p}><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" rx="1" /><rect x="12" y="8" width="3" height="10" rx="1" /><rect x="17" y="5" width="3" height="13" rx="1" /></svg>);
export const PaletteIcon = (p: P) => (<svg {...base} {...p}><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.5-1.9-.3-1 .4-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5-4-10-9-10Z" /><circle cx="7.5" cy="11" r="1" fill="currentColor" /><circle cx="10" cy="7" r="1" fill="currentColor" /><circle cx="15" cy="7.5" r="1" fill="currentColor" /></svg>);
export const CodeIcon = (p: P) => (<svg {...base} {...p}><path d="m8 7-5 5 5 5" /><path d="m16 7 5 5-5 5" /><path d="m14 4-4 16" /></svg>);
export const ShareIcon = (p: P) => (<svg {...base} {...p}><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" /></svg>);
export const MonitorIcon = (p: P) => (<svg {...base} {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>);
export const PenIcon = (p: P) => (<svg {...base} {...p}><path d="m12 3 7 7-9 9H3v-7l9-9Z" /><path d="m14 5 5 5" /></svg>);
export const CertificateIcon = (p: P) => (<svg {...base} {...p}><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M7 9h10M7 12.5h5" /><path d="m15 17 1.5 4 1.5-2 2 .5-1.5-4" /></svg>);
export const ClockIcon = (p: P) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const WifiIcon = (p: P) => (<svg {...base} {...p}><path d="M2 9a15 15 0 0 1 20 0M5 12.5a10.5 10.5 0 0 1 14 0M8.5 16a5.5 5.5 0 0 1 7 0" /><circle cx="12" cy="19.5" r="1" fill="currentColor" /></svg>);
export const MapPinIcon = (p: P) => (<svg {...base} {...p}><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>);
export const UsersIcon = (p: P) => (<svg {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5" /><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.6.8 2.6 2.4 3 5.2" /></svg>);
export const TargetIcon = (p: P) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>);
export const BellIcon = (p: P) => (<svg {...base} {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z" /><path d="M10.3 20a1.9 1.9 0 0 0 3.4 0" /></svg>);
export const CalendarIcon = (p: P) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>);
export const ChevronRightIcon = (p: P) => (<svg {...base} {...p}><path d="m9 6 6 6-6 6" /></svg>);
export const ChevronLeftIcon = (p: P) => (<svg {...base} {...p}><path d="m15 6-6 6 6 6" /></svg>);
export const ShieldIcon = (p: P) => (<svg {...base} {...p}><path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2.2 2.2L15 10" /></svg>);
export const RocketIcon = (p: P) => (<svg {...base} {...p}><path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2" /><path d="M12 15 9 12c1-3.5 4-8 11-8 0 7-4.500 10-8 11Z" /><circle cx="15.500" cy="8.500" r="1.200" /></svg>);
export const CopyIcon = (p: P) => (<svg {...base} {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>);

import type { IconKey } from "@/lib/academy";
export const COURSE_ICONS: Record<IconKey, (p: P) => JSX.Element> = {
  chart: ChartIcon,
  palette: PaletteIcon,
  code: CodeIcon,
  share: ShareIcon,
  monitor: MonitorIcon,
  pen: PenIcon,
};
