type IconProps = { size?: number; className?: string };

const base = (size = 18) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function WalletIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11A2.5 2.5 0 0 1 19 7.5V8H5.5A2.5 2.5 0 0 1 3 5.5v2Z" />
      <path d="M3 7.5v9A2.5 2.5 0 0 0 5.5 19h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 18.5 8H5.5A2.5 2.5 0 0 1 3 5.5" />
      <circle cx="16" cy="13" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ShieldIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3.5 5 6v5.2c0 4.4 3 7.3 7 9.3 4-2 7-4.9 7-9.3V6l-7-2.5Z" />
      <path d="m9.3 12 1.9 1.9L14.9 10" />
    </svg>
  );
}

export function TagIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M11.7 3.5H6a2 2 0 0 0-2 2v5.7c0 .4.2.8.5 1.1l8.3 8.3c.6.6 1.5.6 2.1 0l5.7-5.7c.6-.6.6-1.5 0-2.1l-8.3-8.3c-.3-.3-.7-.5-1.1-.5Z" />
      <circle cx="8.2" cy="8.2" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TruckIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 7h10v8H3z" />
      <path d="M13 10h4l3 3v2h-7z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  );
}

export function CartIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h7.1a2 2 0 0 0 2-1.6L20 8H6" />
      <circle cx="9.5" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CheckShieldIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3.5 5 6v5.2c0 4.4 3 7.3 7 9.3 4-2 7-4.9 7-9.3V6l-7-2.5Z" />
      <path d="m9.3 12.2 1.8 1.8 3.8-3.8" />
    </svg>
  );
}

export function ClockIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function ExternalLinkIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size ?? 14)} className={className}>
      <path d="M9 5h8v8" />
      <path d="M17 5 8 14" />
      <path d="M14 5H6.5A1.5 1.5 0 0 0 5 6.5V17a2 2 0 0 0 2 2h10.5a1.5 1.5 0 0 0 1.5-1.5V12" />
    </svg>
  );
}

export function UploadIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 15V4" />
      <path d="m8 8 4-4 4 4" />
      <path d="M5 15v2.5A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5V15" />
    </svg>
  );
}

export function PulseIcon({ size, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  );
}
