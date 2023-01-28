export interface IAttendance {
  id: string;
  memberId: string;
  paymentType: number;
  paymentAmount: number;
  punchCardId?: string;
}

export class Attendance implements IAttendance {
  constructor(init?: Partial<Attendance>) {
    Object.assign(this, init);
  }
  id: string;
  memberId: string;
  paymentType: number;
  paymentAmount: number;
  punchCardId?: string;
}
