# Krishna Computers Website

This is the official repository for the Krishna Computers website.

## Project Structure

The project uses Next.js with a specific layout structure:

### Layouts

- **Root Layout** (`app/layout.tsx`): Basic HTML structure without header/footer
- **Site Layout** (`app/(site)/layout.tsx`): Public-facing pages with header, footer, and navigation
- **Login Layout** (`app/login/layout.tsx`): Clean login page without header/footer
- **Admin Layout** (`app/admin/layout.tsx`): Admin panel with sidebar navigation
- **Student Layout** (`app/student/layout.tsx`): Student portal with student-specific sidebar
- **ATC Layout** (`app/atc/layout.tsx`): ATC (Authorized Training Center) portal with ATC-specific sidebar

### Routes

- `/` - Public website home
- `/login` - Login page for admin, students, and ATC users
- `/admin/*` - Admin panel pages (requires admin login)
- `/student/*` - Student portal pages (requires student login)
- `/atc/*` - ATC portal pages (requires ATC login)

## Authentication

Authentication is handled via the `lib/auth.ts` file. Admin credentials are hardcoded for development purposes.

## Getting Started

1. Install dependencies: `pnpm install`
2. Run the development server: `pnpm dev`
3. Visit http://localhost:3000 

# Educational Platform with ATC/Subcenter Support

This platform provides a comprehensive system for educational institutions, with support for Admin and ATC (Authorized Training Centers) panels.

## ATC Panel Integration

The ATC panel has the same functionality as the admin panel, but with data scoped to the specific ATC. When changes are made to the admin panel, they must be synchronized with the ATC panel.

### Synchronization Process

#### Automatic Synchronization

We've created a script to automatically synchronize admin panel pages with ATC panel:

```bash
npm run sync-atc
```

This will:
1. Copy all admin panel pages to the ATC panel (with appropriate path modifications)
2. Apply necessary changes like updating import paths and API endpoint parameters
3. Ensure proper reference to user authentication

#### Manual Updates Required

After running the synchronization script, make sure to:

1. Test the ATC panel to confirm all functionality works
2. Check if any new API routes need `atcId` to `centerId` mapping
3. Verify the database calls are filtering data by the ATC/subcenter

### API Routes

All API routes should handle both `centerId` and `atcId` parameters. The standard pattern is:

```javascript
// In API routes:
if (atcId && !centerId) {
  query.centerId = atcId;
}
```

### Data Association

When creating new records through the ATC panel:
1. Always include `atcId: user?._id` in the request body
2. The API should map this to `centerId` in the database

### Troubleshooting

If data isn't saving properly for ATC users:
1. Check the API route to ensure it handles both `atcId` and `centerId`
2. Verify the ATC pages are sending the current user's ID
3. Confirm the database queries are using the correct field name (`centerId`)

## Development Guidelines

When adding new features:
1. Develop for the admin panel first
2. Run `npm run sync-atc` to copy to the ATC panel
3. Test both versions to ensure they work correctly 

# Online Exam System Fixes

## Issue
Students who were assigned online exams from the "Apply for Exam" page were not seeing these exams in their dashboard, preventing them from taking the exams.

## Changes Made

### 1. Added Dynamic Exam Route
- Created a new page at `app/student/exam/[id]/page.tsx` for students to take exams
- Implemented UI for starting/taking exams with timer functionality
- Added question display and answer submission

### 2. Created Exam Submission API
- Added PUT method in `app/api/exam-applications/[id]/route.ts`
- Implemented GET method to fetch a specific exam application
- Added logic to update exam status and record answers/scores

### 3. Fixed Student Dashboard Exam Display
- Enhanced paperType filtering in `app/api/exam-applications/route.ts`
- Added better logging and debugging for exam filtering
- Improved student ID and email matching logic for exam assignments
- Made paperType always available in API responses

### 4. Enhanced Validation & Debugging
- Added comprehensive error handling for missing paper types
- Improved logging to diagnose why exams weren't appearing
- Enhanced matching logic to handle different ID formats
- Added more detailed validation for assigned exams

## How It Works
1. Admin assigns an exam to a student with "online" paper type in "Apply for Exam" page
2. The exam appears on the student's dashboard at `/student/exams`
3. When the scheduled time arrives, student can click "Start Exam"
4. Student is taken to `/student/exam/[id]` where they can take the test
5. When completed, answers are submitted and score is calculated

## Note for Administrators
Make sure "paperType" is explicitly set to "online" when assigning exams that should be taken online by students. 