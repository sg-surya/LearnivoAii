
# Sahayak AI - School Management SaaS Framework

This document outlines the framework and architecture for transforming the Sahayak AI application into a comprehensive, multi-tenant School Management System SaaS platform.

## 1. Vision & Goal

The goal is to create a modern, AI-powered, and easy-to-use platform for schools in India to manage their academic and administrative operations efficiently. The platform will be a multi-tenant SaaS product with distinct, role-based access for Super Admins, School Admins, Teachers, Students, and Parents.

## 2. User Roles & Permissions

The platform will be built around five core user roles:

1.  **Super Admin (Platform Owner):** "We" who control the entire SaaS application.
    *   **Permissions:** Can manage all schools, view platform-wide analytics, manage subscription plans, handle billing for schools, and access/modify any data across the platform.
    *   **Dashboard:** Platform-level overview (total schools, users, revenue), school management interface, subscription plan creator, platform settings.

2.  **School Admin (The "School" Role):** The administrator(s) for a specific school.
    *   **Permissions:** Manages their own school's data only. Can onboard and manage teachers, students, and parents. Can create classes, sections, and subjects. Manages timetables and school-wide announcements. Views school-specific analytics.
    *   **Dashboard:** School-level overview, user management (teachers, students), academic setup (classes, subjects), timetable management, communication tools.

3.  **Teacher:** A teacher within a specific school.
    *   **Permissions:** Access limited to their assigned classes and subjects. Can mark attendance, create and grade assignments/quizzes, manage their timetable, communicate with students and parents of their classes, and use AI tools for content creation.
    *   **Dashboard:** Daily schedule, list of classes, attendance marking, assignment grading queue, access to AI tools, communication portal.

4.  **Student:** A student enrolled in a specific school.
    *   **Permissions:** Can only view their own information. Access to their timetable, assignments, grades, attendance records, and school/class announcements. Can submit assignments and use learning-focused AI tools.
    *   **Dashboard:** Personalized view of timetable, pending homework, upcoming exams, results, attendance summary, and AI knowledge base.

5.  **Parent:** A parent of an enrolled student.
    *   **Permissions:** Can view information related to their own child(ren) only. Access to child's attendance, grades, homework, and school announcements. Can communicate with their child's teachers.
    *   **Dashboard:** Child-specific overview of academic performance, attendance alerts, fee reminders, and a communication portal.

## 3. Core Modules & Features

### A. Platform Management (Super Admin Role)
- **School Onboarding:** Add new schools to the platform.
- **Subscription & Billing Management:** Create and manage subscription tiers (e.g., Basic, Premium) and handle billing for each school.
- **Platform Analytics:** View aggregate data on user engagement, feature usage, and revenue.
- **Master Data Management:** Manage platform-wide master data like lists of subjects or boards (CBSE, ICSE, etc.).

### B. Institute Management (School Admin Role)
- **School Profile:** Manage school name, address, logo, and contact information.
- **Session/Academic Year Management:** Create and manage academic years (e.g., 2024-2025).
- **User Management:** Onboard and manage admins, teachers, students, and parents. Assign roles and permissions.
- **Class & Section Management:** Create classes (e.g., Grade 10) and sections within them (e.g., Section A, B).
- **Subject Management:** Define subjects and assign them to classes and teachers.

### C. Academic Management (School Admin & Teacher Roles)
- **Syllabus & Curriculum Planning (AI-Powered):** Plan lessons and track syllabus completion.
- **Timetable Management:** Create and manage class schedules.
- **AI Content Tools:** Access to all integrated AI tools (Lesson Planner, Quiz Generator, Visual Aids, etc.).
- **Attendance Tracking:** Mark and view daily/subject-wise attendance. Send automated absence notifications.

### D. Student-Centric Features (Teacher, Student, Parent Roles)
- **Assignments & Homework:** Create, assign, view, and submit assignments.
- **Examinations & Grading (AI-Powered):** Generate quizzes, grade assignments with rubrics, digitize papers, and publish report cards.
- **Communication & Collaboration:** School-wide announcements, class-specific notices, and parent-teacher messaging.
- **Learning & Engagement Hub (AI-Powered):** Instant knowledge base, debate topic generator, and story generator for students.

## 4. Technical Architecture (Next.js App Router)

```
src/
|-- app/
|   |-- (auth)/                     # Auth pages (Login, Signup, Forgot Password)
|   |   |-- login/page.tsx
|   |
|   |-- (platform)/                 # Super Admin routes
|   |   |-- layout.tsx
|   |   |-- dashboard/page.tsx        # Platform-wide analytics
|   |   |-- schools/page.tsx          # Manage all schools
|   |   |-- subscriptions/page.tsx
|   |
|   |-- (app)/                      # Main application for school users
|   |   |-- layout.tsx                # Layout with role-based sidebar
|   |   |
|   |   |-- admin/                    # School Admin routes
|   |   |   |-- dashboard/page.tsx
|   |   |   |-- users/page.tsx
|   |   |   |-- classes/page.tsx
|   |   |
|   |   |-- teacher/                  # Teacher routes
|   |   |   |-- dashboard/page.tsx
|   |   |   |-- attendance/page.tsx
|   |   |
|   |   |-- student/                  # Student routes
|   |   |   |-- dashboard/page.tsx
|   |   |
|   |   |-- parent/                   # Parent routes
|   |   |   |-- dashboard/page.tsx
|   |   |
|   |   |-- ai-tools/                 # Hub for all AI tools (with role-based access)
|   |   |-- settings/page.tsx
|   |
|   |-- layout.tsx                  # Root layout
|   |-- page.tsx                    # Landing page
|
|-- components/
|   |-- shared/                     # Components shared across roles
|   |-- admin/                      # School Admin-specific components
|
|-- lib/
|   |-- firebase/                   # Firebase config and hooks
|
|-- ai/
|   |-- flows/                      # All Genkit AI flows
```

## 5. Database Schema (Firestore)

A multi-tenant architecture will be used. A top-level `schools` collection isolates each school's data. Super Admins will have access to this, while other roles will be restricted to their specific school's document.

- **`schools/{schoolId}`**
  - `name`, `address`, `logoUrl`, `subscriptionTier`, `adminUids: []`
  - **Sub-collections:**
    - **`users/{userId}`**: Stores profiles for all users in that school.
      - `uid`, `email`, `role: ('admin' | 'teacher' | 'student' | 'parent')`, `name`, `photoUrl`
    - **`classes/{classId}`**: Represents a class.
      - `name` (e.g., "Grade 10"), `sections: ["A", "B"]`
    - **`subjects/{subjectId}`**:
      - `name`, `classId`
    - **`students/{studentId}`**: Detailed student profiles.
      - `userId`, `classId`, `section`, `rollNumber`, `parentUids: []`
    - **`teachers/{teacherId}`**: Detailed teacher profiles.
      - `userId`, `subjectsAssigned: [{classId, subjectId}]`
    - **`timetables/{timetableId}`**:
      - `classId`, `section`, `schedule: { "Monday": [...] }`
    - **`attendance/{attendanceId}`**:
      - `date`, `classId`, `section`, `presentStudentIds: []`
    - **`announcements/{announcementId}`**:
      - `title`, `content`, `date`, `authorId`, `target: ('all' | 'teachers' | classId)`

- **`users/{userId}`** (Top-level collection for auth/profile mapping)
    - `uid`, `email`, `name`, `role: ('super-admin' | 'school-user')`
    - If `role` is `school-user`, `schoolId` field points to the school they belong to.

## 6. Implementation Roadmap

1.  **Phase 1: Foundation & Super Admin**
    - Implement multi-tenancy with `schools` collection.
    - Build authentication with role separation (Super Admin vs. School User).
    - Create the Super Admin dashboard for managing schools and subscriptions.

2.  **Phase 2: School Admin & Core Setup**
    - Develop the School Admin dashboard for managing users (teachers, students), classes, and subjects.
    - Implement Timetable Management.

3.  **Phase 3: Teacher Portal & Academics**
    - Build the Teacher Dashboard.
    - Implement Attendance Tracking.
    - Integrate core AI tools (Lesson Planner, Quiz Generator) into the teacher workflow.

4.  **Phase 4: Student & Parent Portals**
    - Develop the dashboards for students and parents to view information.
    - Implement assignment submission for students.
    - Build the communication module for parent-teacher interaction.
