"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Student {
  id: number
  name: string
  title: string
}

interface AssignDialogProps {
  slotId: number
  students: Student[]
  currentCount: number
}

export default function AssignDialog({ slotId, students, currentCount }: AssignDialogProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  const toggle = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const save = async () => {
    if (selected.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/teach/slots/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, studentIds: selected }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Students assigned')
      setOpen(false)
      setTimeout(() => location.reload(), 800)
    } catch {
      toast.error('Failed to assign students')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-canvas text-muted-foreground hover:bg-surface-soft cursor-pointer"
        title="Assign students"
      >+</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Students</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          {students.map(s => {
            const checked = selected.includes(s.id)
            return (
              <label
                key={s.id}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                  checked ? 'border-primary bg-primary/5' : 'border-hairline hover:bg-surface-soft'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(s.id)}
                  className="accent-primary"
                />
                <span className="text-ink">{s.name}</span>
                <span className="caption text-muted-foreground ml-auto">{s.title}</span>
              </label>
            )
          })}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={selected.length === 0 || saving}>
            {saving ? 'Saving...' : `Assign (${selected.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
