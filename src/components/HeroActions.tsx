"use client"

export default function HeroActions() {
  return (
    <div class="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
      <a
        href="/learn/login"
        class="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-on-primary leading-11 hover:bg-primary-dark hover-btn"
      >
        Start Free Trial
      </a>
      <a
        href="/#plans"
        class="h-11 rounded-lg border border-primary px-6 text-sm font-semibold text-primary leading-11 hover:bg-primary hover:text-on-primary hover-btn"
      >
        See Plans &amp; Pricing
      </a>
    </div>
  )
}