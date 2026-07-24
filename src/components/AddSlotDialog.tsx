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

export default function AddSlotDialog() {
  const [open, setOpen] = useState(false)
  const [time, setTime] = useState("")
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!time) return
    setSaving(true)
    try {
      const res = await fetch('/teach/slots/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ time }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Slot added')
      setOpen(false)
      setTime("")
      setTimeout(() => location.reload(), 800)
    } catch {
      toast.error('Failed to add slot')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active transition-colors cursor-pointer">+ Add Slot</DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Add Slot</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="h-10 rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 text-sm text-ink"
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={!time || saving}>
            {saving ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
