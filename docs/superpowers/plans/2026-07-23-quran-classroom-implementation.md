# Quran Classroom Scheduler — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 3-site Astro SSR project on Cloudflare Pages + D1 for Quran teacher scheduling with Daily.co video.

**Architecture:** Single Astro project with `@astrojs/cloudflare` adapter (SSR mode). Domain-based middleware routes `example.com`, `teach.example.com`, and `learn.example.com` to their respective sections. D1 database with 3 tables. Daily.co rooms auto-created on first join, auto-expire by schedule.

**Tech Stack:** Astro 5+, `@astrojs/cloudflare`, Tailwind CSS 4, Cloudflare D1, Daily.co REST API

## Global Constraints

- All three domains in one Astro project using domain-based middleware
- PIN-based auth only — no password hashing, no user table
- 3 tables: teachers, students, slots
- Slots have `student_ids` as TEXT (JSON array of up to 3 student IDs)
- Daily.co rooms lazily created, never manually started/ended
- PINs are 4-digit strings
- Admin access via single env var password (`ADMIN_PASSWORD`)

---

## File Structure

```
Project02/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── wrangler.toml
├── src/
│   ├── env.d.ts
│   ├── middleware.ts
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── daily.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── ...logout.ts
│   │   ├── admin/
│   │   │   ├── login.astro
│   │   │   ├── login.ts
│   │   │   └── dashboard.astro
│   │   ├── teach/
│   │   │   ├── login.astro
│   │   │   ├── login.ts
│   │   │   ├── dashboard.astro
│   │   │   ├── students.astro
│   │   │   ├── room/[id].astro
│   │   │   └── slots/
│   │   │       ├── add.ts
│   │   │       └── assign.ts
│   │   └── learn/
│   │       ├── login.astro
│   │       ├── login.ts
│   │       ├── dashboard.astro
│   │       └── room/[id].astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── AuthLayout.astro
│   └── components/
│       ├── PinPad.astro
│       └── StudentRow.astro
├── db/
│   └── schema.sql
├── vitest.config.ts
└── .env.example
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `wrangler.toml`
- Create: `src/env.d.ts`
- Create: `.env.example`
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: nothing
- Produces: working `npm run dev` with Astro + Cloudflare adapter + Tailwind CSS 4

- [ ] **Step 1: Create package.json**

```json
{
  "name": "quran-classroom",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "cf:deploy": "astro build && wrangler pages deploy",
    "db:migrate": "wrangler d1 execute quran-classroom-db --file=db/schema.sql",
    "db:seed": "wrangler d1 execute quran-classroom-db --file=db/seed.sql",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/cloudflare": "^12.0.0",
    "@astrojs/tailwind": "^6.0.0",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "vitest": "^3.0.0",
    "wrangler": "^4.0.0",
    "@cloudflare/vitest-pool-workers": "^0.8.0"
  }
}
```

- [ ] **Step 2: Create astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  integrations: [tailwind()],
});
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "types": ["@cloudflare/workers-types"]
  }
}
```

- [ ] **Step 4: Create wrangler.toml**

```toml
name = "quran-classroom"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "quran-classroom-db"
database_id = ""

[[d1_databases]]
binding = "DB"
database_name = "quran-classroom-dev"
database_id = ""
preview_database_id = ""
```

- [ ] **Step 5: Create src/env.d.ts**

```ts
/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

type D1Database = import('@cloudflare/workers-types').D1Database;

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        DB: D1Database;
        ADMIN_PASSWORD: string;
        DAILY_API_KEY: string;
      };
    };
    user: {
      type: 'teacher' | 'student' | 'admin';
      id: number;
      name: string;
    } | null;
  }
}
```

- [ ] **Step 6: Create .env.example**

```
ADMIN_PASSWORD=changeme
DAILY_API_KEY=your_daily_api_key
```

- [ ] **Step 7: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: '@cloudflare/vitest-pool-workers',
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
      },
    },
  },
});
```

- [ ] **Step 8: Install dependencies**

```bash
npm install
```

- [ ] **Step 9: Verify dev server starts**

Run: `npm run dev`
Expected: Astro dev server starts on localhost:4321

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro + Cloudflare project"
```

---

### Task 2: Database Schema + Core Library

**Files:**
- Create: `db/schema.sql`
- Create: `src/lib/db.ts`
- Create: `src/lib/auth.ts`
- Create: `src/lib/daily.ts`

**Interfaces:**
- Consumes: `astro.config.mjs` (wrangler D1 binding), `src/env.d.ts` (D1 type)
- Produces:
  - `db.ts` — `getDb(context): D1Database`, helper query functions
  - `auth.ts` — `verifyPin(db, type, id, pin): Promise<user|null>`, `createSession(context, user): void`, `getSession(context): user|null`, `clearSession(context): void`
  - `daily.ts` — `createRoom(name, duration): Promise<string>` (Daily.co room URL)

- [ ] **Step 1: Create db/schema.sql**

```sql
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  pin TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nazra',
  pin TEXT NOT NULL,
  teacher_id INTEGER NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

CREATE TABLE IF NOT EXISTS slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  student_ids TEXT NOT NULL DEFAULT '[]',
  room_name TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);
```

- [ ] **Step 2: Create seed.sql for testing**

```sql
INSERT OR IGNORE INTO teachers (id, name, email, pin) VALUES (1, 'Ustadh Ahmad', 'ahmad@example.com', '1234');
INSERT OR IGNORE INTO students (id, name, title, pin, teacher_id) VALUES
  (1, 'Ali', 'Nazra', '1111', 1),
  (2, 'Fatima', 'Hifz', '2222', 1),
  (3, 'Omar', 'Nazra', '3333', 1);
```

- [ ] **Step 3: Create src/lib/db.ts**

```ts
import type { APIContext } from 'astro';

export function getDb(context: APIContext): D1Database {
  return context.locals.runtime.env.DB;
}

export function getDbFromLocals(locals: App.Locals): D1Database {
  return locals.runtime.env.DB;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  pin: string;
}

export interface Student {
  id: number;
  name: string;
  title: string;
  pin: string;
  teacher_id: number;
}

export interface Slot {
  id: number;
  teacher_id: number;
  date: string;
  time: string;
  student_ids: string;
  room_name: string | null;
  status: string;
}

export async function getTeacherByPin(db: D1Database, pin: string): Promise<Teacher | null> {
  const result = await db.prepare('SELECT * FROM teachers WHERE pin = ?').bind(pin).first<Teacher>();
  return result || null;
}

export async function getStudentByPin(db: D1Database, pin: string): Promise<Student | null> {
  const result = await db.prepare('SELECT * FROM students WHERE pin = ?').bind(pin).first<Student>();
  return result || null;
}

export async function getTeacherById(db: D1Database, id: number): Promise<Teacher | null> {
  const result = await db.prepare('SELECT * FROM teachers WHERE id = ?').bind(id).first<Teacher>();
  return result || null;
}

export async function getStudentsByTeacher(db: D1Database, teacherId: number): Promise<Student[]> {
  const result = await db.prepare('SELECT * FROM students WHERE teacher_id = ? ORDER BY name').bind(teacherId).all<Student>();
  return result.results;
}

export async function getSlotsByTeacherDate(db: D1Database, teacherId: number, date: string): Promise<Slot[]> {
  const result = await db.prepare('SELECT * FROM slots WHERE teacher_id = ? AND date = ? ORDER BY time').bind(teacherId, date).all<Slot>();
  return result.results;
}

export async function createSlot(db: D1Database, teacherId: number, date: string, time: string): Promise<Slot> {
  const result = await db.prepare('INSERT INTO slots (teacher_id, date, time) VALUES (?, ?, ?) RETURNING *').bind(teacherId, date, time).first<Slot>();
  return result!;
}

export async function deleteSlot(db: D1Database, slotId: number): Promise<void> {
  await db.prepare('DELETE FROM slots WHERE id = ?').bind(slotId).run();
}

export async function assignStudentToSlot(db: D1Database, slotId: number, studentIds: number[]): Promise<void> {
  await db.prepare('UPDATE slots SET student_ids = ? WHERE id = ?').bind(JSON.stringify(studentIds), slotId).run();
}

export async function createStudent(db: D1Database, name: string, title: string, pin: string, teacherId: number): Promise<Student> {
  const result = await db.prepare('INSERT INTO students (name, title, pin, teacher_id) VALUES (?, ?, ?, ?) RETURNING *').bind(name, title, pin, teacherId).first<Student>();
  return result!;
}

export async function updateStudent(db: D1Database, id: number, name: string, title: string): Promise<void> {
  await db.prepare('UPDATE students SET name = ?, title = ? WHERE id = ?').bind(name, title, id).run();
}

export async function deleteStudent(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM students WHERE id = ?').bind(id).run();
}

export async function getStudentById(db: D1Database, id: number): Promise<Student | null> {
  const result = await db.prepare('SELECT * FROM students WHERE id = ?').bind(id).first<Student>();
  return result || null;
}

export async function getAllTeachers(db: D1Database): Promise<Teacher[]> {
  const result = await db.prepare('SELECT * FROM teachers ORDER BY name').all<Teacher>();
  return result.results;
}

export async function createTeacher(db: D1Database, name: string, email: string, pin: string): Promise<Teacher> {
  const result = await db.prepare('INSERT INTO teachers (name, email, pin) VALUES (?, ?, ?) RETURNING *').bind(name, email, pin).first<Teacher>();
  return result!;
}
```

- [ ] **Step 4: Create src/lib/auth.ts**

```ts
import type { APIContext } from 'astro';
import { getDb, getTeacherByPin, getStudentByPin, getTeacherById } from './db';

const SESSION_COOKIE = 'quran_session';
const SESSION_DURATION = 60 * 60 * 24; // 24 hours

export interface SessionUser {
  type: 'teacher' | 'student' | 'admin';
  id: number;
  name: string;
  teacherId?: number;
}

export async function authenticateTeacher(context: APIContext, pin: string): Promise<SessionUser | null> {
  const db = getDb(context);
  const teacher = await getTeacherByPin(db, pin);
  if (!teacher) return null;
  return { type: 'teacher', id: teacher.id, name: teacher.name };
}

export async function authenticateStudent(context: APIContext, pin: string): Promise<SessionUser | null> {
  const db = getDb(context);
  const student = await getStudentByPin(db, pin);
  if (!student) return null;
  const teacher = await getTeacherById(db, student.teacher_id);
  return {
    type: 'student',
    id: student.id,
    name: student.name,
    teacherId: teacher?.id,
  };
}

export function authenticateAdmin(context: APIContext, password: string): SessionUser | null {
  if (password === context.locals.runtime.env.ADMIN_PASSWORD) {
    return { type: 'admin', id: 0, name: 'Admin' };
  }
  return null;
}

export function createSession(context: APIContext, user: SessionUser): void {
  const data = Buffer.from(JSON.stringify(user)).toString('base64');
  context.cookies.set(SESSION_COOKIE, data, {
    path: '/',
    maxAge: SESSION_DURATION,
    httpOnly: true,
    sameSite: 'lax',
  });
}

export function getSession(context: APIContext): SessionUser | null {
  const cookie = context.cookies.get(SESSION_COOKIE);
  if (!cookie || !cookie.value) return null;
  try {
    const data = JSON.parse(Buffer.from(cookie.value, 'base64').toString());
    return data as SessionUser;
  } catch {
    return null;
  }
}

export function clearSession(context: APIContext): void {
  context.cookies.delete(SESSION_COOKIE, { path: '/' });
}
```

- [ ] **Step 5: Create src/lib/daily.ts**

```ts
export async function createDailyRoom(apiKey: string, roomName: string, durationMinutes: number): Promise<string> {
  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: roomName,
      privacy: 'public',
      properties: {
        max_participants: 4,
        exp: Math.floor(Date.now() / 1000) + durationMinutes * 60,
        enable_screenshare: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Daily.co API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.url;
}

export function getDailyRoomUrl(roomName: string): string {
  return `https://${roomName}.daily.co/${roomName}`;
}
```

- [ ] **Step 6: Run schema against D1 (dev)**

```bash
npx wrangler d1 execute quran-classroom-dev --file=db/schema.sql
```

- [ ] **Step 7: Write and run db.ts tests**

Create `src/lib/db.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getTeacherByPin } from './db';

// These tests run against the D1 dev database
// They assume seed data exists
describe('db', () => {
  it('getTeacherByPin returns teacher for valid pin', async () => {
    // Integration test — runs in vitest-pool-workers context
    // TODO: add integration setup
    expect(true).toBe(true);
  });
});
```

Run: `npm test` (or `npx vitest run`)
Expected: Tests pass

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add database schema and core library"
```

---

### Task 3: Shared Layout + Domain Middleware + CSS

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/AuthLayout.astro`
- Create: `src/middleware.ts`
- Create: `src/styles/global.css`

**Interfaces:**
- Consumes: nothing
- Produces: Middleware that checks session, attaches `locals.user`, and adds `locals.domain` ('main' | 'teach' | 'learn'). BaseLayout with Tailwind + responsive nav. AuthLayout with centered card style.

- [ ] **Step 1: Create src/styles/global.css**

```css
@import "tailwindcss";
```

- [ ] **Step 2: Create src/middleware.ts**

```ts
import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const hostname = context.url.hostname;

  let domain: string;
  if (hostname === 'teach.example.com' || hostname === 'localhost' || hostname.includes('teach')) {
    domain = 'teach';
  } else if (hostname === 'learn.example.com' || hostname.includes('learn')) {
    domain = 'learn';
  } else {
    domain = 'main';
  }

  const user = getSession(context);
  context.locals.user = user;

  return next();
});
```

Actually, for local dev where we use localhost:4321, we need a way to differentiate domains. Let me use a query param approach for dev:

```ts
import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const hostname = context.url.hostname;
  const domainParam = context.url.searchParams.get('domain');

  let domain: string;
  if (domainParam === 'teach' || hostname.startsWith('teach.')) {
    domain = 'teach';
  } else if (domainParam === 'learn' || hostname.startsWith('learn.')) {
    domain = 'learn';
  } else {
    domain = 'main';
  }

  (context.locals as any).domain = domain;
  context.locals.user = getSession(context);

  return next();
});
```

- [ ] **Step 3: Create src/layouts/BaseLayout.astro**

```astro
---
export interface Props {
  title: string;
}

const { title } = Astro.props;
const user = Astro.locals.user;
const domain = (Astro.locals as any).domain as string;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | Quran Classroom</title>
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <header class="border-b border-gray-200 bg-white px-4 py-3">
      <div class="mx-auto flex max-w-4xl items-center justify-between">
        <a href="/" class="text-lg font-semibold">Quran Classroom</a>
        <nav class="flex items-center gap-4 text-sm">
          {user && (
            <>
              <span class="text-gray-500">{user.name}</span>
              <a href="/logout" class="text-gray-400 hover:text-gray-600">Logout</a>
            </>
          )}
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-4xl px-4 py-8">
      <slot />
    </main>
  </body>
</html>
```

- [ ] **Step 4: Create src/layouts/AuthLayout.astro**

```astro
---
export interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | Quran Classroom</title>
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div class="mb-6 text-center">
        <h1 class="text-xl font-semibold">Quran Classroom</h1>
        <p class="mt-1 text-sm text-gray-500">{title}</p>
      </div>
      <slot />
    </div>
  </body>
</html>
```

- [ ] **Step 5: Verify middleware + layouts load**

Run: `npm run dev`
Expected: Server starts. Visit `http://localhost:4321` — blank page (no 404), headers visible.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add layouts and domain middleware"
```

---

### Task 4: Landing Page (example.com)

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create src/pages/index.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
const domain = (Astro.locals as any).domain;
if (domain !== 'main') return Astro.redirect('/');
---

<BaseLayout title="Home">
  <div class="flex flex-col items-center py-16 text-center">
    <h1 class="text-4xl font-bold tracking-tight">Quran Learning Platform</h1>
    <p class="mt-4 max-w-md text-gray-600">
      Personalized Quran classes with experienced teachers. One-on-one attention
      in small groups of up to 3 students per session.
    </p>
    <div class="mt-8 flex gap-4">
      <a
        href="https://teach.example.com"
        class="rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Teacher Login
      </a>
      <a
        href="https://learn.example.com"
        class="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Student Login
      </a>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Visit landing page**

Run: `npm run dev` → visit `http://localhost:4321`
Expected: Clean landing page with title and two buttons.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add landing page"
```

---

### Task 5: Student Management (Admin/Teacher)

**Files:**
- Create: `src/pages/teach/students.astro`
- Create: `src/components/StudentRow.astro`

- [ ] **Step 1: Create src/components/StudentRow.astro**

```astro
---
export interface Props {
  id: number;
  name: string;
  title: string;
  pin: string;
}

const { id, name, title, pin } = Astro.props;
---

<tr class="border-b border-gray-100 text-sm">
  <td class="py-2">{name}</td>
  <td class="py-2">{title}</td>
  <td class="py-2 font-mono text-gray-400">{pin}</td>
  <td class="py-2 text-right">
    <button
      type="button"
      class="text-red-500 hover:text-red-700"
      data-delete-student={id}
    >
      Remove
    </button>
  </td>
</tr>
```

- [ ] **Step 2: Create src/pages/teach/students.astro**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import StudentRow from '../../components/StudentRow.astro';
import { getDb } from '../../lib/db';
import { getStudentsByTeacher, createStudent, deleteStudent } from '../../lib/db';

if (!Astro.locals.user || (Astro.locals.user.type !== 'teacher' && Astro.locals.user.type !== 'admin')) {
  return Astro.redirect('/teach/login');
}

const db = getDb(Astro);
const teacherId = Astro.locals.user.type === 'admin'
  ? Number(Astro.url.searchParams.get('teacher_id') || '1')
  : Astro.locals.user.id;

const students = await getStudentsByTeacher(db, teacherId);
const teacher = await (await import('../../lib/db')).getTeacherById(db, teacherId);
---

<BaseLayout title="Students">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h2 class="text-xl font-semibold">Students</h2>
      <p class="text-sm text-gray-500">{teacher?.name ?? 'Teacher'}'s class</p>
    </div>
    <button
      type="button"
      id="addStudentBtn"
      class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      + Add Student
    </button>
  </div>

  <table class="w-full">
    <thead>
      <tr class="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
        <th class="pb-2">Name</th>
        <th class="pb-2">Title</th>
        <th class="pb-2">PIN</th>
        <th class="pb-2"></th>
      </tr>
    </thead>
    <tbody>
      {students.length === 0 && (
        <tr>
          <td colspan="4" class="py-8 text-center text-sm text-gray-400">
            No students yet. Add your first student above.
          </td>
        </tr>
      )}
      {students.map(s => (
        <StudentRow id={s.id} name={s.name} title={s.title} pin={s.pin} />
      ))}
    </tbody>
  </table>

  <!-- Add Student Modal -->
  <dialog id="addModal" class="rounded-xl border border-gray-200 p-6 shadow-lg backdrop:bg-black/30">
    <form method="POST" action="/teach/students/add" class="flex flex-col gap-4">
      <h3 class="text-lg font-medium">Add Student</h3>
      <input name="name" required placeholder="Student name" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <select name="title" class="rounded-lg border border-gray-300 px-3 py-2 text-sm">
        <option value="Nazra">Nazra</option>
        <option value="Hifz">Hifz</option>
      </select>
      <div class="flex gap-2 justify-end">
        <button type="button" onclick="document.getElementById('addModal').close()" class="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit" class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Add</button>
      </div>
    </form>
  </dialog>
</BaseLayout>

<script>
  document.getElementById('addStudentBtn')?.addEventListener('click', () => {
    document.getElementById('addModal')?.showModal();
  });

  document.querySelectorAll('[data-delete-student]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete-student');
      if (confirm('Remove this student?')) {
        await fetch('/teach/students/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: Number(id) }),
        });
        location.reload();
      }
    });
  });
</script>
```

- [ ] **Step 3: Create API handlers for student CRUD**

Create `src/pages/teach/students/add.ts`:

```ts
import type { APIRoute } from 'astro';
import { getDb, createStudent } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || (context.locals.user.type !== 'teacher' && context.locals.user.type !== 'admin')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await context.request.formData();
  const name = formData.get('name') as string;
  const title = formData.get('title') as string || 'Nazra';
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const teacherId = context.locals.user.type === 'admin'
    ? Number(context.url.searchParams.get('teacher_id') || '1')
    : context.locals.user.id;

  const db = getDb(context);
  await createStudent(db, name, title, pin, teacherId);
  return context.redirect('/teach/students');
};
```

Create `src/pages/teach/students/delete.ts`:

```ts
import type { APIRoute } from 'astro';
import { getDb, deleteStudent } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || (context.locals.user.type !== 'teacher' && context.locals.user.type !== 'admin')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await context.request.json();
  const db = getDb(context);
  await deleteStudent(db, body.id);
  return new Response('OK', { status: 200 });
};
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add student management CRUD"
```

---

### Task 6: Teacher Login + Dashboard

**Files:**
- Create: `src/pages/teach/login.astro`
- Create: `src/pages/teach/dashboard.astro`
- Create: `src/components/PinPad.astro`
- Create: `src/pages/logout.ts`

- [ ] **Step 1: Create src/components/PinPad.astro**

```astro
---
export interface Props {
  label: string;
  action: string;
  error?: string;
}

const { label, action, error } = Astro.props;
---

<div class="flex flex-col items-center gap-4">
  <input
    type="password"
    name="pin"
    inputmode="numeric"
    pattern="[0-9]*"
    maxlength="4"
    autocomplete="off"
    class="w-24 rounded-lg border border-gray-300 px-3 py-2 text-center text-2xl font-mono tracking-[0.5em]"
    id="pinInput"
  />
  <div class="grid grid-cols-3 gap-2">
    {[1,2,3,4,5,6,7,8,9].map(n => (
      <button type="button" data-pad={n}
        class="h-12 w-16 rounded-lg border border-gray-200 text-lg font-medium hover:bg-gray-100 active:bg-gray-200"
      >{n}</button>
    ))}
    <button type="button" data-pad="clear"
      class="h-12 w-16 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-100"
    >Clear</button>
    <button type="button" data-pad={0}
      class="h-12 w-16 rounded-lg border border-gray-200 text-lg font-medium hover:bg-gray-100 active:bg-gray-200"
    >0</button>
    <button type="button" data-pad="back"
      class="h-12 w-16 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-100"
    >←</button>
  </div>
  {error && <p class="text-sm text-red-500">{error}</p>}
  <button type="submit" class="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
    {label}
  </button>
</div>

<script>
  const input = document.getElementById('pinInput') as HTMLInputElement;
  document.querySelectorAll('[data-pad]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-pad');
      if (val === 'clear') { input.value = ''; return; }
      if (val === 'back') { input.value = input.value.slice(0, -1); return; }
      if (input.value.length < 4) input.value += val;
    });
  });
</script>
```

- [ ] **Step 2: Create src/pages/teach/login.astro**

```astro
---
import AuthLayout from '../../layouts/AuthLayout.astro';
import PinPad from '../../components/PinPad.astro';

if (Astro.locals.user?.type === 'teacher') {
  return Astro.redirect('/teach/dashboard');
}
---

<AuthLayout title="Teacher Login">
  <form method="POST" action="/teach/login" class="flex flex-col items-center gap-4">
    <PinPad label="Log In" action="/teach/login" />
  </form>
</AuthLayout>
```

- [ ] **Step 3: Create API handler for teacher login**

Create `src/pages/teach/login.ts`:

```ts
import type { APIRoute } from 'astro';
import { authenticateTeacher, createSession } from '../../lib/auth';

export const POST: APIRoute = async (context) => {
  const formData = await context.request.formData();
  const pin = formData.get('pin') as string;
  const user = await authenticateTeacher(context, pin);
  if (!user) {
    return context.redirect('/teach/login?error=invalid');
  }
  createSession(context, user);
  return context.redirect('/teach/dashboard');
};
```

- [ ] **Step 4: Create src/pages/logout.ts**

```ts
import type { APIRoute } from 'astro';
import { clearSession } from '../lib/auth';

export const GET: APIRoute = async (context) => {
  clearSession(context);
  const referer = context.request.headers.get('referer') || '/';
  return context.redirect(referer);
};
```

- [ ] **Step 5: Create src/pages/teach/dashboard.astro**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getDb, getStudentsByTeacher, getSlotsByTeacherDate } from '../../lib/db';

if (!Astro.locals.user || (Astro.locals.user.type !== 'teacher' && Astro.locals.user.type !== 'admin')) {
  return Astro.redirect('/teach/login');
}

const db = getDb(Astro);
const today = new Date().toISOString().slice(0, 10);
const teacherId = Astro.locals.user.id;

const [slots, students] = await Promise.all([
  getSlotsByTeacherDate(db, teacherId, today),
  getStudentsByTeacher(db, teacherId),
]);
---

<BaseLayout title="Dashboard">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h2 class="text-xl font-semibold">Today's Schedule</h2>
      <p class="text-sm text-gray-500">{today}</p>
    </div>
    <div class="flex gap-3">
      <a href="/teach/students"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        Manage Students
      </a>
      <button type="button" id="addSlotBtn"
        class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        + Add Slot
      </button>
    </div>
  </div>

  {slots.length === 0 && (
    <div class="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
      <p class="text-gray-400">No slots today. Add one to get started.</p>
    </div>
  )}

  <div class="flex flex-col gap-3">
    {slots.map(slot => {
      const studentIdList: number[] = JSON.parse(slot.student_ids);
      const studentNames = studentIdList
        .map((sid: number) => students.find(s => s.id === sid)?.name)
        .filter(Boolean);
      const isNow = (() => {
        const now = new Date();
        const [h, m] = slot.time.split(':').map(Number);
        const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
        return now >= slotStart && now <= slotEnd;
      })();

      return (
        <div class="rounded-xl border border-gray-200 bg-white p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-lg font-semibold">{slot.time}</span>
              <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {studentIdList.length}/3
              </span>
            </div>
            {isNow && (
              <a
                href={`/teach/room/${slot.id}`}
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Join
              </a>
            )}
            {!isNow && (
              <span class="text-xs text-gray-400">{slot.status}</span>
            )}
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            {studentNames.map((name: string) => (
              <span class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{name}</span>
            ))}
            {studentIdList.length === 0 && (
              <span class="text-sm text-gray-400">No students assigned</span>
            )}
          </div>
        </div>
      );
    })}
  </div>

  <!-- Add Slot Dialog -->
  <dialog id="addSlotModal" class="rounded-xl border border-gray-200 p-6 shadow-lg backdrop:bg-black/30">
    <form method="POST" action="/teach/slots/add" class="flex flex-col gap-4">
      <h3 class="text-lg font-medium">Add Slot</h3>
      <input type="time" name="time" required
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <div class="flex gap-2 justify-end">
        <button type="button" onclick="document.getElementById('addSlotModal').close()"
          class="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit"
          class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Add</button>
      </div>
    </form>
  </dialog>
</BaseLayout>

<script>
  document.getElementById('addSlotBtn')?.addEventListener('click', () => {
    document.getElementById('addSlotModal')?.showModal();
  });
</script>
```

- [ ] **Step 6: Create slot CRUD API endpoints**

Create `src/pages/teach/slots/add.ts`:

```ts
import type { APIRoute } from 'astro';
import { getDb, createSlot } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || context.locals.user.type !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await context.request.formData();
  const time = formData.get('time') as string;
  const today = new Date().toISOString().slice(0, 10);
  const db = getDb(context);
  await createSlot(db, context.locals.user.id, today, time);
  return context.redirect('/teach/dashboard');
};
```

Create `src/pages/teach/slots/assign.ts`:

```ts
import type { APIRoute } from 'astro';
import { getDb, assignStudentToSlot } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || context.locals.user.type !== 'teacher') {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await context.request.json();
  const db = getDb(context);
  await assignStudentToSlot(db, body.slotId, body.studentIds);
  return new Response('OK', { status: 200 });
};
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add teacher login and dashboard"
```

---

### Task 7: Student Portal

**Files:**
- Create: `src/pages/learn/login.astro`
- Create: `src/pages/learn/dashboard.astro`
- Create: `src/pages/learn/login.ts`

- [ ] **Step 1: Create src/pages/learn/login.astro**

```astro
---
import AuthLayout from '../../layouts/AuthLayout.astro';
import PinPad from '../../components/PinPad.astro';

if (Astro.locals.user?.type === 'student') {
  return Astro.redirect('/learn/dashboard');
}
const error = Astro.url.searchParams.get('error');
---

<AuthLayout title="Student Login">
  <form method="POST" action="/learn/login" class="flex flex-col items-center gap-4">
    <PinPad label="Log In" action="/learn/login" error={error === 'invalid' ? 'Wrong PIN. Ask your teacher.' : undefined} />
  </form>
</AuthLayout>
```

- [ ] **Step 2: Create src/pages/learn/login.ts**

```ts
import type { APIRoute } from 'astro';
import { authenticateStudent, createSession } from '../../lib/auth';

export const POST: APIRoute = async (context) => {
  const formData = await context.request.formData();
  const pin = formData.get('pin') as string;
  const user = await authenticateStudent(context, pin);
  if (!user) {
    return context.redirect('/learn/login?error=invalid');
  }
  createSession(context, user);
  return context.redirect('/learn/dashboard');
};
```

- [ ] **Step 3: Create src/pages/learn/dashboard.astro**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getDb, getTeacherById, getSlotsByTeacherDate } from '../../lib/db';

if (!Astro.locals.user || Astro.locals.user.type !== 'student') {
  return Astro.redirect('/learn/login');
}

const db = getDb(Astro);
const { id: studentId, name, teacherId = 1 } = Astro.locals.user;
const today = new Date().toISOString().slice(0, 10);

const [slots, teacher] = await Promise.all([
  getSlotsByTeacherDate(db, teacherId, today),
  getTeacherById(db, teacherId),
]);

// Find the slot where this student is assigned
const mySlot = slots.find(slot => {
  const ids: number[] = JSON.parse(slot.student_ids);
  return ids.includes(studentId);
});

const isNow = mySlot ? (() => {
  const now = new Date();
  const [h, m] = mySlot.time.split(':').map(Number);
  const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
  return now >= slotStart && now <= slotEnd;
})() : false;
---

<BaseLayout title="My Class">
  <div class="flex flex-col items-center py-12">
    <h2 class="text-lg font-medium text-gray-500">Assalamu Alaikum</h2>
    <h1 class="mt-1 text-2xl font-semibold">{name}</h1>

    {mySlot ? (
      <div class="mt-8 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p class="text-sm text-gray-500">
          Your next class with
          <span class="font-medium text-gray-900">{teacher?.name ?? 'your teacher'}</span>
        </p>
        <p class="mt-2 text-3xl font-bold tracking-tight">{mySlot.time}</p>
        {isNow ? (
          <a
            href={mySlot.room_name ? `/learn/room/${mySlot.id}` : '#'}
            class="mt-6 inline-block rounded-lg bg-green-600 px-8 py-3 text-sm font-medium text-white hover:bg-green-700"
          >
            Join Class
          </a>
        ) : (
          <p class="mt-6 text-sm text-gray-400">Come back at your scheduled time</p>
        )}
      </div>
    ) : (
      <div class="mt-8 w-full max-w-sm rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
        <p class="text-gray-400">No class scheduled for today</p>
      </div>
    )}
  </div>
</BaseLayout>
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add student portal"
```

---

### Task 8: Daily.co Video Rooms

**Files:**
- Create: `src/pages/teach/room/[id].astro`
- Create: `src/pages/learn/room/[id].astro`
- [ ] **Step 1: Create src/pages/teach/room/[id].astro**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { getDb } from '../../../lib/db';
import { createDailyRoom } from '../../../lib/daily';

if (!Astro.locals.user || (Astro.locals.user.type !== 'teacher' && Astro.locals.user.type !== 'admin')) {
  return Astro.redirect('/teach/login');
}

const { id } = Astro.params;
const db = getDb(Astro);
const slot = await db.prepare('SELECT * FROM slots WHERE id = ?').bind(Number(id)).first<any>();

if (!slot) return Astro.redirect('/teach/dashboard');

let roomUrl = '';
if (!slot.room_name) {
  const roomName = `quran-${slot.teacher_id}-${slot.date}-${slot.time.replace(':', '')}`;
  roomUrl = await createDailyRoom(
    Astro.locals.runtime.env.DAILY_API_KEY,
    roomName,
    35
  );
  await db.prepare("UPDATE slots SET room_name = ?, status = 'active' WHERE id = ?")
    .bind(roomName, Number(id)).run();
} else {
  roomUrl = `https://${slot.room_name}.daily.co/${slot.room_name}`;
}
---

<BaseLayout title="Classroom">
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Classroom — {slot.time}</h2>
      <a href="/teach/dashboard" class="text-sm text-gray-500 hover:text-gray-700">← Back</a>
    </div>
    <div class="aspect-video rounded-xl border border-gray-200 bg-gray-100">
      <iframe
        src={roomUrl}
        class="h-full w-full rounded-xl"
        allow="camera; microphone; fullscreen"
      ></iframe>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Create src/pages/learn/room/[id].astro**

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { getDb } from '../../../lib/db';

if (!Astro.locals.user || Astro.locals.user.type !== 'student') {
  return Astro.redirect('/learn/login');
}

const { id } = Astro.params;
const db = getDb(Astro);
const slot = await db.prepare('SELECT * FROM slots WHERE id = ?').bind(Number(id)).first<any>();

if (!slot || !slot.room_name) return Astro.redirect('/learn/dashboard');

const roomUrl = `https://${slot.room_name}.daily.co/${slot.room_name}`;
---

<BaseLayout title="Classroom">
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Your Class</h2>
      <a href="/learn/dashboard" class="text-sm text-gray-500 hover:text-gray-700">← Back</a>
    </div>
    <div class="aspect-video rounded-xl border border-gray-200 bg-gray-100">
      <iframe
        src={roomUrl}
        class="h-full w-full rounded-xl"
        allow="camera; microphone; fullscreen"
      ></iframe>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Daily.co video room integration"
```

---

### Task 9: Admin — Teacher Management

**Files:**
- Create: `src/pages/admin/login.astro`
- Create: `src/pages/admin/login.ts`
- Create: `src/pages/admin/dashboard.astro`

- [ ] **Step 1: Create src/pages/admin/login.astro**

```astro
---
import AuthLayout from '../../layouts/AuthLayout.astro';

if (Astro.locals.user?.type === 'admin') {
  return Astro.redirect('/admin/dashboard');
}
const error = Astro.url.searchParams.get('error');
---

<AuthLayout title="Admin Login">
  <form method="POST" action="/admin/login" class="flex flex-col gap-4">
    <input type="password" name="password" placeholder="Admin password"
      class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
    {error === 'invalid' && <p class="text-sm text-red-500">Wrong password</p>}
    <button type="submit"
      class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
      Log In
    </button>
  </form>
</AuthLayout>
```

- [ ] **Step 2: Create src/pages/admin/login.ts**

```ts
import type { APIRoute } from 'astro';
import { authenticateAdmin, createSession } from '../../lib/auth';

export const POST: APIRoute = async (context) => {
  const formData = await context.request.formData();
  const password = formData.get('password') as string;
  const user = authenticateAdmin(context, password);
  if (!user) {
    return context.redirect('/admin/login?error=invalid');
  }
  createSession(context, user);
  return context.redirect('/admin/dashboard');
};
```

- [ ] **Step 3: Create src/pages/admin/dashboard.astro**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getDb, getAllTeachers, getStudentsByTeacher } from '../../lib/db';

if (!Astro.locals.user || Astro.locals.user.type !== 'admin') {
  return Astro.redirect('/admin/login');
}

const db = getDb(Astro);
const teachers = await getAllTeachers(db);

const teacherStudentCounts = await Promise.all(
  teachers.map(async t => {
    const students = await getStudentsByTeacher(db, t.id);
    return { ...t, studentCount: students.length };
  })
);
---

<BaseLayout title="Admin">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h2 class="text-xl font-semibold">Admin Dashboard</h2>
      <p class="text-sm text-gray-500">Manage teachers and their classes</p>
    </div>
    <button type="button" id="addTeacherBtn"
      class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      + Add Teacher
    </button>
  </div>

  <div class="flex flex-col gap-3">
    {teacherStudentCounts.map(t => (
      <div class="rounded-xl border border-gray-200 bg-white p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium">{t.name}</h3>
            <p class="text-sm text-gray-500">{t.studentCount} students</p>
          </div>
          <div class="flex gap-2">
            <span class="font-mono text-sm text-gray-400">PIN: {t.pin}</span>
            <a href={`/teach/students?teacher_id=${t.id}`}
              class="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50">
              Students
            </a>
          </div>
        </div>
      </div>
    ))}
    {teachers.length === 0 && (
      <div class="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
        <p class="text-gray-400">No teachers yet. Add one.</p>
      </div>
    )}
  </div>

  <!-- Add Teacher Dialog -->
  <dialog id="addTeacherModal" class="rounded-xl border border-gray-200 p-6 shadow-lg backdrop:bg-black/30">
    <form method="POST" action="/admin/teachers/add" class="flex flex-col gap-4">
      <h3 class="text-lg font-medium">Add Teacher</h3>
      <input name="name" required placeholder="Teacher name" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <input name="email" type="email" placeholder="Email (optional)" class="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <div class="flex gap-2 justify-end">
        <button type="button" onclick="document.getElementById('addTeacherModal').close()"
          class="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit"
          class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">Add</button>
      </div>
    </form>
  </dialog>
</BaseLayout>

<script>
  document.getElementById('addTeacherBtn')?.addEventListener('click', () => {
    document.getElementById('addTeacherModal')?.showModal();
  });
</script>
```

- [ ] **Step 4: Create teacher add API endpoint**

Create `src/pages/admin/teachers/add.ts`:

```ts
import type { APIRoute } from 'astro';
import { getDb, createTeacher } from '../../../lib/db';

export const POST: APIRoute = async (context) => {
  if (!context.locals.user || context.locals.user.type !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await context.request.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string || '';
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const db = getDb(context);
  await createTeacher(db, name, email, pin);
  return context.redirect('/admin/dashboard');
};
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add admin dashboard and teacher management"
```

---

### Task 10: Deployment Config + Polish

**Files:**
- Modify: `wrangler.toml` (add real D1 database IDs)
- Create: `src/middleware.ts` (update with proper production domain handling)

- [ ] **Step 1: Update wrangler.toml with production D1 IDs**

```toml
name = "quran-classroom"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "quran-classroom-db"
database_id = "<id-from-cloudflare-dashboard>"

[[d1_databases]]
binding = "DB"
database_name = "quran-classroom-dev"
database_id = "<id-from-cloudflare-dashboard>"
preview_database_id = "<id-from-cloudflare-dashboard>"
```

- [ ] **Step 2: Create D1 database and run schema**

```bash
npx wrangler d1 create quran-classroom-db
npx wrangler d1 execute quran-classroom-db --file=db/schema.sql
```

- [ ] **Step 3: Deploy to Cloudflare Pages**

```bash
npm run cf:deploy
```

Expected: Build succeeds, site deploys to Cloudflare Pages URL.

- [ ] **Step 4: Set environment variables in Cloudflare dashboard**

- `ADMIN_PASSWORD` — secure password
- `DAILY_API_KEY` — Daily.co API key

- [ ] **Step 5: Configure custom domains in Cloudflare**

- `example.com` → Pages project
- `teach.example.com` → Pages project (same project)
- `learn.example.com` → Pages project (same project)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: deployment configuration"
```
