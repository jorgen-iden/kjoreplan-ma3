// The real root layout is app/[locale]/layout.tsx; this one only lets app/not-found.tsx exist.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
