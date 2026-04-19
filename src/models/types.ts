export type CourseArea = 'web3' | 'ai' | 'cybersecurity' | 'devops';
export type CourseType = 'classroom' | 'distance' | 'ondemand';

export interface Course {
  id: string;
  title: string;
  courseNumber: string;
  area: CourseArea;
  type: CourseType;
  days: number;
  price: number;
  availability: ('classroom' | 'distance')[];
  imageUrl: string;
  plannedDate: string;
  description: string;
  teacher: string;
  ratings: number[];
  tags?: string[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  joinedDate: string;
  xpPoints: number;
  interests: CourseArea[];
  learningFocus: CourseArea | null;
  subscriptionActive: boolean;
}

export interface Booking {
  id: string;
  studentId: string;
  courseId: string;
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  amount: number;
  type: 'classroom' | 'distance' | 'ondemand';
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization: CourseArea;
  bio: string;
  imageUrl: string;
  courses: string[];
}