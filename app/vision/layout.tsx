// app/vision/layout.tsx

import { Nav } from '@/components/Nav'

export default function VisionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div style={{ paddingTop: '80px' }}>{children}</div>
    </>
  )
}
