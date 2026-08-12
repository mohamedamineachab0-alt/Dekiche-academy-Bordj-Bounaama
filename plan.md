# Dekiche Academy - Core Infrastructure Blueprint

This document serves as the comprehensive architectural roadmap and record of the core features successfully implemented for the Dekiche Academy platform.

## 1. 🗄️ DATABASE SCHEMA (Prisma)

The backend database has been completely wiped of legacy, conflicting data and regenerated from scratch to establish absolute schema integrity.

### Core Models & Relationships:
- **`Subject`**: The highest-level container for a course. Defines price, level, stream, access type (Monthly/Yearly), and a new publication status (`isPublished`).
  - *Relation*: Linked directly to a `Teacher` via `teacherId` to properly associate courses.
- **`Lesson`**: Represents individual video lectures.
  - *Relation*: Belongs to `Subject` (Cascade delete from Subject -> Lesson).
- **`LessonMaterial`**: Represents A4 portrait attachments (PDF, images) for lessons.
  - *Relation*: Belongs to `Lesson` (Cascade delete from Lesson -> LessonMaterial).
- **`Enrollment`**: Explicit link between a `User` (Student) and a `Subject`.
  - *Relation*: Belongs to both `User` and `Subject` (Cascade delete applied).
- **`Quiz`**: Represents AI-generated assessments attached to lessons.
  - *Relation*: One-to-one relationship with `Lesson`.
- **`AccessCode`**: Handles the financial and access gateway. Replaces the obsolete SubscriptionCode model.
  - *Relation*: Ties directly to a `Subject` and binds to a `User` upon redemption.
- **`StudentMistake`**: Tracks incorrect answers to provide personalized learning paths.
  - *Relation*: One-to-many relationship linking to `Lesson`, `Quiz`, and the `User` (Cascade delete applied).

### 2. 🗄️ DATA INTEGRITY (ENUMS)
- Strict Enums are now enforced at the database level to guarantee 100% data integrity:
  - **`Level`**: `AS2`, `AS3`
  - **`Stream`**: `SCIENCES`, `MATH`, `TECH_MATH`, `GESTION`, `LETTRES`, `LANGUAGES`, `COMMON_TRUNK`, `ALL`
  - **`Wilaya`**: `W01`, `W16`, `W31` (as placeholders for the 58 Wilayas)
- `StudentProfile`, `Teacher`, and `Subject` now enforce these Enums, eliminating raw strings and preventing any potential data-entry mismatch.

> **Note**: A full `npx prisma db push --accept-data-loss` was executed to clear all mismatched tables and enforce the new Enum types, followed by `npx prisma generate`.

## 2. 🪣 SUPABASE STORAGE INTEGRATION

A robust, reusable `<ImageUpload />` component was built targeting two specific public Supabase buckets. Strict client-side validation rules were implemented using the Native Browser Image API to prevent bad data from reaching the server.

- **`subject-covers` Bucket:**
  - **Aspect Ratio:** Enforced strict 1:1 (Square).
  - **Resolution:** Required minimum resolution of 500x500 pixels.
  - **File Size:** Maximum 1MB limit for lightning-fast dashboard loading.
- **`lesson-materials` Bucket:**
  - **Aspect Ratio:** Enforced strict A4 portrait aspect ratio (~1:1.414) ideal for standard printing.
  - **File Size:** Maximum 2MB limit.

## 3. 🖥️ UI, UX & FLOW LOGIC

### Design System
- **Aesthetic:** Strictly adheres to a bright white and purple premium aesthetic. No dark mode.
- **Typography:** Enforced the "IBM Plex Sans Arabic" font globally across all new dashboards and modals.

### Security & Routing
- **Global Back Button (`<GlobalBackButton />`):** An intelligent, role-based navigation element injected into the RootLayout. It is completely hidden from Teachers and Students, ensuring they cannot bypass secure flows, while remaining fully accessible to Admins and Parents.

### Admin Flow
- **Subject Creation (`/admin/subjects/new`):** Dynamic form supporting direct image upload to Supabase, level/stream mapping, subscription type definition, and a beautiful toggle switch to define if the subject is "Draft" or "Published" (`isPublished`).
- **Lesson Builder (`/admin/lessons/new`):** Streamlined form for uploading lessons with Vimeo IDs, month targeting, and a one-click toggle to generate an AI Quiz.
- **Access Code Generator (`/admin/codes`):** Mass-generation engine creating secure `DEK-XXXXXX` alphanumeric codes, defining monthly or yearly access tied to specific subjects.
- **Mistakes Analytics (`/admin/mistakes`):** A dedicated, highly organized "أخطاء تلاميذي" dashboard allowing admins to filter all student mistakes globally by Subject, Stream, and Lesson to identify common learning gaps.

### 3. 🖥️ UI, UX & FLOW LOGIC
- **Student Dashboard (`/dashboard/student`)**: Re-architected into a Client Component pulling real-time data from a dedicated backend API route (`GET /api/student/subjects`). Handles loading states elegantly and partitions subjects into "Enrolled" and "Available".
- **Global Layout & Navigation (`layout.tsx`)**: Enforces a strict role-based "Back" button globally, rendering ONLY for `ADMIN` and `PARENT` profiles. Hides strictly for `STUDENT` and `TEACHER` profiles to maintain strict navigational flow.
- **Subject Publication**: Added a togglable `isPublished` state on the Admin Subject creation page.
- **Student Dashboard Filter**: The Student Dashboard is explicitly locked to only fetch and display subjects where `isPublished == true`. It dynamically fetches subjects matching the student's exact `stream` OR designated for `ALL` streams OR `COMMON_TRUNK`.
- **Subject Details (`/dashboard/student/subjects/[id]`)**: Auto-groups and displays the curriculum sequentially by `Month`. Shows interactive badges for attached A4 `LessonMaterial` and AI Quizzes.
- **Access Code Generator (`/admin/codes`):** Mass-generation engine creating secure `DEK-XXXXXX` alphanumeric codes, defining monthly or yearly access tied to specific subjects.
- **Mistakes Analytics (`/admin/mistakes`):** A dedicated, highly organized "أخطاء تلاميذي" dashboard allowing admins to filter all student mistakes globally by Subject, Stream, and Level to identify common learning gaps.

### Student Flow
- **Luxurious Dashboard (`/dashboard/student`):** A stunning, interactive hub featuring immersive purple gradients and high-level statistical tracking (total points, unlocked subjects). Strictly filters subjects to only show those where `isPublished == true`.
- **Code Redemption Engine:** An intuitive input field allowing students to paste their `DEK-XXXX` codes to instantly unlock and render premium Subject Cards.
- **My Mistakes ("أخطائي") (`/dashboard/student/mistakes`):** A clean revision table isolating the Mistake (الخطأ) and the Solution (الحل), complete with a direct "راجع الدرس" routing button sending the student back to the specific video lesson.
