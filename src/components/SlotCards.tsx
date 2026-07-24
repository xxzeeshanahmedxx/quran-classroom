"use client"

import SpotlightCard from './reactbits/SpotlightCard'
import AssignDialog from './AssignDialog'
import { useState, useEffect } from 'react'

interface Slot {
  id: number
  time: string
  student_ids: string
}

interface Student {
  id: number
  name: string
  title: string
}

interface SlotCardsProps {
  slots: Slot[]
  students: Student[]
  todayStr: string
}

function fmt12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

function remainingTime(slotTime: string, now: Date): string {
  const [h, m] = slotTime.split(':').map(Number)
  const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m)
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000)
  if (now > slotEnd) return 'Ended'
  if (now >= slotStart) return 'Live'
  const diff = slotStart.getTime() - now.getTime()
  const hrs = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

export default function SlotCards({ slots, students, todayStr }: SlotCardsProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  if (slots.length === 0) {
    return (
      <div class="py-16 text-center">
        <p class="body-md text-muted-foreground">No slots today. Add one to get started.</p>
      </div>
    )
  }

  return (
    <div class="flex flex-col gap-3">
      {slots.map(slot => {
        const studentIdList: number[] = JSON.parse(slot.student_ids)
        const studentNames = studentIdList
          .map((sid: number) => students.find(s => s.id === sid)?.name)
          .filter(Boolean)
        const [h, m] = slot.time.split(':').map(Number)
        const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m)
        const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000)
        const isNow = now >= slotStart && now <= slotEnd
        const rem = remainingTime(slot.time, now)

        return (
          <SpotlightCard
            key={slot.id}
            className="!bg-surface-card !border-hairline"
            spotlightColor="rgba(255, 255, 255, 0.15)"
          >
            <div class="flex items-start justify-between gap-4 p-8">
              <div class="flex flex-col">
                <span class="display-sm text-ink">{fmt12h(slot.time)}</span>
                <span class="caption text-muted-foreground">{studentIdList.length}/3 students</span>
              </div>
              <div class="flex items-center gap-2 flex-wrap justify-end">
                {studentNames.length > 0 ? studentNames.slice(0, 3).map((name: string) => (
                  <span class="rounded-full bg-surface-card px-3 py-1 caption text-ink hover-badge">{name}</span>
                )) : (
                  <span class="caption text-muted-foreground">No students</span>
                )}
                {studentIdList.length < 3 && !isNow && (
                  <AssignDialog
                    slotId={slot.id}
                    students={students.map(s => ({ id: s.id, name: s.name, title: s.title }))}
                    currentCount={studentIdList.length}
                  />
                )}
              </div>
              <div class="flex flex-col items-end gap-1 shrink-0">
                {isNow ? (
                  <a href={`/teach/room/${slot.id}`}
                    class="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary leading-10 hover:bg-primary-active hover-btn"
                  >Join</a>
                ) : rem === 'Ended' ? (
                  <span class="caption text-muted-foreground">Ended</span>
                ) : (
                  <span class="whitespace-nowrap rounded-full bg-surface-card px-2 py-0.5 caption text-muted-foreground">{rem}</span>
                )}
              </div>
            </div>
          </SpotlightCard>
        )
      })}
    </div>
  )
}
