"use client"

import ClickSpark from './reactbits/ClickSpark'

export default function ClickSparkForm({ children }: { children: React.ReactNode }) {
  return (
    <ClickSpark sparkColor="#fafafa" sparkSize={6} sparkRadius={15} sparkCount={5}>
      {children}
    </ClickSpark>
  )
}
