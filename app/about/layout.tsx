// app/about/layout.tsx

import { Nav } from '@/components/Nav'

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div style={{ paddingTop: '80px' }}>{children}</div>
    </>
  )
}
