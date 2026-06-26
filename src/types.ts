export type Category = 'Pothole' | 'Streetlight' | 'Garbage' | 'Water leakage' | 'Blocked parking' | 'Other';

export type IssueStatus = 'Pending' | 'In progress' | 'Resolved';

export type BlockedDetail = 'My driveway' | 'Fire lane' | 'Footpath' | 'No-parking zone';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: Category;
  priorityScore: number;
  location: string;
  gps: { x: number; y: number }; // Relative percentage coordinates for our custom map
  confirmations: number;
  status: IssueStatus;
  timestamp: string;
  photoUrl: string;
  reporterName: string;
  isUserReport: boolean;
  blockedDetails?: BlockedDetail;
  createdAt: string;
  parkingTimerExpires?: string; // ISO string for auto-resolution timer
  userConfirmed?: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  neighboursUsed: number;
  availability: string;
  phone: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  providerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  timestamp: string;
  chips: string[];
}

export interface NotificationNudge {
  id: string;
  providerId: string;
  providerName: string;
  providerRole: string;
  avatar: string;
  timestamp: string;
}
