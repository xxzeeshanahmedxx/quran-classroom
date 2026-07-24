"use client"

import GlareHover from './reactbits/GlareHover'
import { toast } from 'sonner'

interface Student {
  id: number
  name: string
  title: string
  pin: string
}

interface StudentCardsProps {
  students: Student[]
  teacherName: string
}

export default function StudentCards({ students, teacherName }: StudentCardsProps) {
  const handleRemove = async (id: number) => {
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
              <span class="caption text-body">{s.title}</span>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="font-mono text-sm text-muted-foreground">{s.pin}</span>
              <button
                type="button"
                class="h-8 rounded-lg border border-hairline bg-canvas px-3 caption font-semibold text-error leading-8 hover:bg-surface-soft hover-btn"
                onClick={() => handleRemove(s.id)}
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
