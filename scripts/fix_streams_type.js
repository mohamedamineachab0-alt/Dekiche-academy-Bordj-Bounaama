const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  './components/admin/NotificationFormClient.tsx',
  './components/admin/DailyExerciseForm.tsx',
  './components/admin/ExamUploadForm.tsx',
  './components/admin/ParentsTableClient.tsx',
  './components/admin/LessonForm.tsx',
  './components/admin/ReviewCardFormClient.tsx',
  './app/dashboard/admin/exams/page.tsx',
  './app/dashboard/admin/exercises/page.tsx',
  './app/dashboard/admin/forums/page.tsx',
  './app/dashboard/admin/lessons/new/page.tsx',
  './app/dashboard/admin/live-classes/page.tsx',
  './app/dashboard/admin/notifications/page.tsx',
  './app/dashboard/admin/review-cards/page.tsx',
  './app/dashboard/teacher/live-classes/page.tsx',
  './app/dashboard/teacher/page.tsx',
];

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix types
  content = content.replace(/stream: string/g, 'streams: string[]');
  content = content.replace(/stream: string \| undefined/g, 'streams: string[] | undefined');
  
  // Fix subject array mapping in pages
  content = content.replace(/stream: s.stream/g, 'streams: s.streams');
  
  // Fix includes logic in clients
  content = content.replace(/s\.stream !== stream/g, '!s.streams.includes(stream)');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Fixed streams type in ${file}`);
  }
});
