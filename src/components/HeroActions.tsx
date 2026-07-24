"use client"

import ClickSpark from './reactbits/ClickSpark'
import BorderGlow from './reactbits/BorderGlow'
import Magnet from './reactbits/Magnet'

export default function HeroActions() {
  return (
    <ClickSpark sparkColor="#fafafa" sparkSize={8} sparkRadius={20} sparkCount={6}>
      <div class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-3">
        <BorderGlow
          borderRadius={8}
          backgroundColor="#fafafa"
          colors={['#fbbf24', '#f59e0b', '#eab308']}
          animated={true}
        >
          <a
            href="/learn/login"
            class="block px-6 py-[10px] text-sm font-semibold text-on-primary text-center whitespace-nowrap"
          >
            Claim Your 3-Day Free Trial
          </a>
        </BorderGlow>
        <Magnet padding={80} magnetStrength={3}>
          <a
            href="/learn/login"
            class="block h-10 rounded-lg border border-hairline bg-canvas px-5 text-sm font-semibold text-ink leading-10 hover:bg-surface-soft hover-btn"
          >
            Student Login
          </a>
        </Magnet>
      </div>
    </ClickSpark>
  )
}
