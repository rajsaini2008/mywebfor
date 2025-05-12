'use client';

import StudentRegistration from '@/app/components/StudentRegistration';

export default function NewStudentPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
        <StudentRegistration />
      </div>
    </div>
  );
}
