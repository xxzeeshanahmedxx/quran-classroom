"use client"

import SpotlightCard from './reactbits/SpotlightCard'

interface Teacher {
  id: number
  name: string
  pin: string
  studentCount: number
}

interface TeacherCardsProps {
  teachers: Teacher[]
}

export default function TeacherCards({ teachers }: TeacherCardsProps) {
  if (teachers.length === 0) {
    return (
      <div class="py-16 text-center">
        <p class="body-md text-muted-foreground">No teachers yet. Add one.</p>
      </div>
    )
  }

  return (
    <div class="flex flex-col gap-3">
      {teachers.map(t => (
        <SpotlightCard
          key={t.id}
          className="!bg-surface-card !border-hairline"
          spotlightColor="rgba(255, 255, 255, 0.15)"
        >
          <div class="flex items-center justify-between p-6">
            <div>
              <h3 class="title-sm text-ink">{t.name}</h3>
              <p class="caption text-muted-foreground">{t.studentCount} students</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-mono text-sm text-muted-foreground">PIN: {t.pin}</span>
              <a href={`/teach/students?teacher_id=${t.id}`}
                class="h-8 rounded-lg border border-hairline bg-canvas px-3 caption font-semibold text-ink leading-8 hover:bg-surface-soft hover-btn">
                Students
              </a>
            </div>
          </div>
        </SpotlightCard>
      ))}
    </div>
  )
}
