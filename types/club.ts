export interface Advisor {
  name: string;
  email: string;
}

export interface StudentLead {
  name: string;
  role: string;
  email: string;
}

export interface ClubLink {
  url: string;
  platform: string;
}

export interface OneOffEvent {
  date: string; // 'YYYY-MM-DD'
  title: string;
}

export type Frequency = 'weekly' | 'biweekly' | 'monthly';
export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface RecurringEvent {
  title: string;
  frequency: Frequency;
  dayOfWeek: Day;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  exceptions: string[]; // 'YYYY-MM-DD'[]
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  date: Date;
}

export interface ClubInfo {
  id: string;
  isComplete: boolean;
  isDisplayed: boolean;
  name: string;
  school: string;
  creatorId: string;
  tags: string[];
  description: string;
  length: string;
  meetingTimes: string;
  meetingSite: string;
  eligibility: string;
  costs: string;
  advisors: Advisor[];
  studentLeads: StudentLead[];
  links: ClubLink[];
  images: string[];
  recurringEvents: RecurringEvent[];
  oneOffEvents: OneOffEvent[];
  blogIds: string[];
  addedEditors?: string[];
}
