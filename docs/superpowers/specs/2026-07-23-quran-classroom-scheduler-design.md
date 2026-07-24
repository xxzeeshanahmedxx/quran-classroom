# Quran Classroom Scheduler — Design Spec

## Overview
A simple scheduling + video classroom platform for a Quran teacher. One teacher manages up to 10 students, teaches 3 students per slot. Sessions run on Daily.co video. Built with Astro + Tailwind CSS 4 on Cloudflare Pages + D1.

## Sites
- `teach.example.com` — Teacher dashboard (manage schedule, students)
- `example.com` — Marketing landing page
- `learn.example.com` — Student portal (see next class, join video)

## Tech Stack
- **Framework:** Astro (latest) SSR with `@astrojs/cloudflare` adapter
- **Styling:** Tailwind CSS 4
- **Hosting:** Cloudflare Pages
- **Database:** Cloudflare D1 (1 database, all tables)
- **Video:** Daily.co (free tier, 10,000 min/mo)
- **Auth:** PIN-based (no password hashing, no user table)

## Data Model — 3 Tables

### teachers
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT | |
| email | TEXT | |
| pin | TEXT | 4-digit login |

### students
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT | |
| title | TEXT | "Nazra" or "Hifz" |
| teacher_id | INTEGER | FK -> teachers.id |
| pin | TEXT | 4-digit login |

### slots
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| teacher_id | INTEGER | FK -> teachers.id |
| date | TEXT | "YYYY-MM-DD" |
| time | TEXT | "HH:MM" (24hr) |
| student_ids | TEXT | JSON array of up to 3 student IDs |
| room_name | TEXT | Daily.co room name, generated on first join |
| status | TEXT | "pending", "active", "ended" (auto-updated) |

## Auth Flows
- **Teacher:** 4-digit PIN → dashboard
- **Student:** 4-digit PIN → waiting room (PIN set by admin when adding student)
- **Admin (you):** Single env var password — access to manage all data

## Teacher Flow (teach.example.com)
1. Login with PIN
2. Dashboard shows today's slots sorted by time
3. Slot card: time, 3 student slots (dropdown to assign), Join button (visible during slot time)
4. "Add Slot" button → pick time → slot appears on today's schedule
5. "Manage Students" page — table with Add/Edit/Delete
6. At slot time, Join button auto-appears → opens Daily.co room

## Student Flow (learn.example.com)
1. Login with PIN
2. Sees: "Your next class with [Teacher Name] at [time]"
3. During slot time: "Join Class" button → Daily.co room
4. If no upcoming class: "No upcoming sessions"

## Daily.co Integration
- Room lazily created when first teacher clicks Join
- `room_name` stored in slots table
- Room expires via Daily.co API `max_duration` (matches slot length + buffer)
- No manual start/end — all automatic based on schedule

## Admin Responsibilities (Zeeshan)
- Add/edit teachers
- Add/edit students (set name, title, PIN)
- View all schedules

## Non-Goals
- No attendance tracking
- No progress notes
- No billing/payments
- No multi-teacher scheduling coordination
- No student self-registration
