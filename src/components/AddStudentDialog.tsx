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

export default function AddStudentDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [title, setTitle] = useState("Nazra")
  const [gender, setGender] = useState("male")
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name) return
    setSaving(true)
    try {
      const res = await fetch('/teach/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ name, title, gender }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Student added')
      setOpen(false)
      setName("")
      setTitle("Nazra")
      setGender("male")
      setTimeout(() => location.reload(), 800)
    } catch {
      toast.error('Failed to add student')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active transition-colors cursor-pointer">
        + Add Student
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <input
            type="text"
            placeholder="Student name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="h-10 rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-foreground"
            required
          />
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            className="h-10 rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 text-sm text-ink"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="h-10 rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 text-sm text-ink"
          >
            <option value="Nazra">Nazra</option>
            <option value="Hifz">Hifz</option>
            <option value="Tajweed">Tajweed</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={!name || saving}>
            {saving ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
