export interface IAttendance {
  id: string;
  memberId: string;
  paymentType: number;
  paymentAmount: number;
  punchCardId?: string;
}

export class Attendance implements IAttendance {
  id: string;
  memberId: string;
  paymentType: number;
  paymentAmount: number;
  punchCardId?: string;
}
