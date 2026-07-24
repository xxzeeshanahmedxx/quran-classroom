/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: {
      type: 'teacher' | 'student';
      id: number;
      name: string;
      teacherId?: number;
    } | null;
  }
}
