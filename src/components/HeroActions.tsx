"use client"

import ClickSpark from './reactbits/ClickSpark'
import Magnet from './reactbits/Magnet'

export default function HeroActions() {
  return (
    <ClickSpark sparkColor="#fafafa" sparkSize={8} sparkRadius={20} sparkCount={6}>
      <div class="mt-8 flex gap-3">
        <Magnet padding={80} magnetStrength={3}>
          <a href="/teach/login"
            class="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary leading-10 hover:bg-primary-active hover-btn inline-block"
          >Teacher Login</a>
        </Magnet>
        <Magnet padding={80} magnetStrength={3}>
          <a href="/learn/login"
            class="h-10 rounded-lg border border-hairline bg-canvas px-5 text-sm font-semibold text-ink leading-10 hover:bg-surface-soft hover-btn inline-block"
          >Student Login</a>
        </Magnet>
      </div>
    </ClickSpark>
  )
}
