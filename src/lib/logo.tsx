/**
 * The logo mark for generated images (app icon, share image), which can't use CSS tokens.
 * Same geometry as LogoMark in src/components/ui/Logo.tsx and src/app/icon.svg.
 */
export const LOGO_BLUE = '#2140c4';

export function logoMarkSvg(size: number, background = LOGO_BLUE, foreground = '#ffffff') {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill={background} />
      <circle cx="9" cy="10" r="2.6" fill={foreground} />
      <rect x="14" y="8.5" width="11" height="3" rx="1.5" fill={foreground} />
      <rect x="14" y="14.5" width="8" height="3" rx="1.5" fill={foreground} fillOpacity={0.55} />
      <rect x="14" y="20.5" width="10" height="3" rx="1.5" fill={foreground} fillOpacity={0.55} />
    </svg>
  );
}
