"use client"

import GlareHover from './reactbits/GlareHover'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'

interface Student {
  id: number
  name: string
  title: string
  gender: string
  pin: string
}

interface StudentCardsProps {
  students: Student[]
  teacherName: string
}

function GenderBadge({ gender }: { gender: string }) {
  const isMale = gender === 'male'
  return (
    <span class={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${isMale ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
      {isMale ? '♂ Male' : '♀ Female'}
    </span>
  )
}

export default function StudentCards({ students, teacherName }: StudentCardsProps) {
  const handleRemove = async (id: number, name: string) => {
    if (!window.confirm(`Remove student "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch('/teach/students/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Student removed')
      setTimeout(() => location.reload(), 800)
    } catch {
      toast.error('Failed to remove student')
    }
  }

  const handleCopyPin = async (pin: string) => {
    try {
      await navigator.clipboard.writeText(pin)
      toast.success('PIN copied')
    } catch {
      toast.error('Could not copy PIN')
    }
  }

  if (students.length === 0) {
    return (
      <div class="py-16 text-center">
        <p class="body-md text-muted-foreground">No students yet. Add your first student above.</p>
      </div>
    )
  }

  return (
    <div class="grid gap-3 sm:grid-cols-2">
      {students.map(s => (
        <GlareHover
          key={s.id}
          className="rounded-xl bg-surface-card cursor-pointer"
          glareColor="#ffffff"
          glareOpacity={0.2}
          glareSize={300}
          transitionDuration={500}
        >
          <div class="flex items-center justify-between gap-4 p-5">
            <div class="flex flex-col gap-0.5">
              <span class="title-sm text-ink">{s.name}</span>
              <div class="flex items-center gap-2">
                <span class="caption text-body">{s.title}</span>
                <GenderBadge gender={s.gender} />
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="font-mono text-sm text-muted-foreground">{s.pin}</span>
              <button
                type="button"
                class="h-7 rounded-md border border-hairline bg-canvas px-2 text-xs font-semibold text-ink leading-7 hover:bg-surface-soft hover-btn"
                onClick={() => handleCopyPin(s.pin)}
                title="Copy PIN"
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                class="h-8 rounded-lg border border-hairline bg-canvas px-3 caption font-semibold text-error leading-8 hover:bg-surface-soft hover-btn"
                onClick={() => handleRemove(s.id, s.name)}
              >
                Remove
              </button>
            </div>
          </div>
        </GlareHover>
      ))}
    </div>
  )
}
