const fs = require('fs');

const files = [
  "actions/subjects.ts",
  "app/dashboard/admin/exams/page.tsx",
  "app/dashboard/admin/exercises/page.tsx",
  "app/dashboard/admin/forums/page.tsx",
  "app/dashboard/admin/lessons/new/page.tsx",
  "app/dashboard/admin/live-classes/page.tsx",
  "app/dashboard/admin/notifications/page.tsx",
  "app/dashboard/admin/review-cards/page.tsx",
  "app/dashboard/student/subjects/page.tsx",
  "app/dashboard/teacher/live-classes/page.tsx",
  "app/dashboard/admin/subjects/page.tsx",
  "components/admin/SubjectCreationClient.tsx"
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\{ stream \}/g, '{ streams }');
    content = content.replace(/\bstream:/g, 'streams:');
    content = content.replace(/\.stream\b/g, '.streams');
    content = content.replace(/stream ===/g, 'streams.includes');
    fs.writeFileSync(file, content);
  }
}
