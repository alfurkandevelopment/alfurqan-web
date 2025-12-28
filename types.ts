
export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  VOLUNTEER = 'Volunteer',
  PERMANENT_DONOR = 'Permanent Donor',
  PARENT = 'Parent',
  STUDENT = 'Student',
  GUEST = 'Guest'
}

export enum Language {
  TR = 'tr',
  AR = 'ar',
  EN = 'en'
}

export interface LocalizedString {
  ar: string;
  tr: string;
  en: string;
}

export interface Program {
  id: string;
  title: LocalizedString;
  category: 'Quran' | 'Mosque' | 'Language' | 'Competition' | 'General';
  description: LocalizedString;
  goal?: LocalizedString;
  image: string;
  supervisorId?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  programId: string;
  title: LocalizedString;
  description?: LocalizedString;
  type: 'One-time' | 'Recurring';
  date?: string; // For one-time
  time: string;
  recurringDays?: string[]; // ['Monday', 'Friday'] for recurring
  location: string;
  supervisorId?: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Finished';
  image: string;
}

export interface Project {
  id: string;
  title: string;
  category: 'Education' | 'Relief' | 'Zakat' | 'General';
  targetAmount: number;
  raisedAmount: number;
  description: string;
  image: string;
}

export interface Donation {
  id: string;
  amount: number;
  currency: string;
  project: string;
  date: string;
  status: 'Received' | 'Processing' | 'Delivered';
  donorName?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface Student {
  id: string;
  name: string;
  age: number;
  grade: string;
  courses: CourseProgress[];
  attendance: number;
  avatar?: string;
}

export interface CourseProgress {
  courseName: string;
  progress: number;
  lastLesson: string;
  teacher: string;
}
