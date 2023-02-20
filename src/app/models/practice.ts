import { Timestamp } from 'firebase/firestore';

export interface IPractice {
  id: string;
  practiceNumber: number;
  practiceDate: Timestamp;
  practiceTopic: string;
  practiceCost: number;
  miscExpense: number;
  miscRevenue: number;
  attendanceCount: number;
  admissionRevenue: number;
}

export class Practice implements IPractice {
  constructor(init?: Partial<Practice>) {
    Object.assign(this, init);
  }
  id: string;
  practiceNumber: number;
  practiceDate: Timestamp;
  practiceTopic: string;
  practiceCost: number;
  miscExpense: number;
  miscRevenue: number;
  attendanceCount: number;
  admissionRevenue: number;
}
