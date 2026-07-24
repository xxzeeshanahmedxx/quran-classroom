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

export default function AddTeacherDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name) return
    setSaving(true)
    try {
      const res = await fetch('/admin/teachers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ name, email }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Teacher added')
      setOpen(false)
      setName("")
      setEmail("")
      setTimeout(() => location.reload(), 800)
    } catch {
      toast.error('Failed to add teacher')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active transition-colors cursor-pointer">
        + Add Teacher
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Add Teacher</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <input
            type="text"
            placeholder="Teacher name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="h-10 rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-foreground"
            required
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="h-10 rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-foreground"
          />
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
