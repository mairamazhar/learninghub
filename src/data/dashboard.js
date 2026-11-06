// Sample (mock) university-wide figures for the dashboard.
// Student-level numbers (totals, status split, GPA) are derived live from students.js;
// the figures below stand in for what a real API would return.

export const enrollmentTrend = [
  { month: 'Jan', enrolled: 182, applied: 240 },
  { month: 'Feb', enrolled: 205, applied: 261 },
  { month: 'Mar', enrolled: 231, applied: 298 },
  { month: 'Apr', enrolled: 224, applied: 287 },
  { month: 'May', enrolled: 268, applied: 332 },
  { month: 'Jun', enrolled: 301, applied: 374 },
  { month: 'Jul', enrolled: 289, applied: 351 },
  { month: 'Aug', enrolled: 342, applied: 418 },
  { month: 'Sep', enrolled: 396, applied: 472 },
  { month: 'Oct', enrolled: 371, applied: 455 },
  { month: 'Nov', enrolled: 418, applied: 503 },
  { month: 'Dec', enrolled: 436, applied: 519 },
]

export const courseCapacity = [
  { code: 'CS', name: 'Computer Science', enrolled: 412, capacity: 450 },
  { code: 'BBA', name: 'Business Administration', enrolled: 366, capacity: 420 },
  { code: 'EE', name: 'Electrical Engineering', enrolled: 288, capacity: 320 },
  { code: 'DES', name: 'UI/UX Design', enrolled: 174, capacity: 200 },
  { code: 'PSY', name: 'Psychology', enrolled: 142, capacity: 220 },
  { code: 'MED', name: 'Public Health', enrolled: 96, capacity: 180 },
]

export const pendingApplications = [
  { id: 'APP-5021', name: 'Hamza Tariq', program: 'Computer Science', date: 'Nov 4', status: 'review' },
  { id: 'APP-5020', name: 'Zainab Fatima', program: 'UI/UX Design', date: 'Nov 4', status: 'new' },
  { id: 'APP-5018', name: 'Omar Siddiqui', program: 'Business Administration', date: 'Nov 3', status: 'review' },
  { id: 'APP-5017', name: 'Mehwish Noor', program: 'Psychology', date: 'Nov 2', status: 'new' },
  { id: 'APP-5014', name: 'Daniyal Raza', program: 'Electrical Engineering', date: 'Nov 1', status: 'review' },
]
