export enum paymentType {
  None = 0,
  Cash = 1,
  PunchCard = 2,
  Other = 3,
}

export interface IAttendance {
  id: string;
  memberId: string;
  paymentType: paymentType;
  paymentTypeText: string;
  paymentAmount: number;
  punchCardId?: string;
}

export class Attendance implements IAttendance {
  constructor(init?: Partial<Attendance>) {
    Object.assign(this, init);
  }
  id: string;
  memberId: string;
  paymentType: paymentType;
  public get paymentTypeText(): string {
    switch (this.paymentType) {
      case paymentType.None:
        return 'None';
      case paymentType.Cash:
        return 'Cash';
      case paymentType.PunchCard:
        return 'Punch Card';
      default:
        return 'Other';
    }
  }
  paymentAmount: number;
  punchCardId?: string;
  memberName: string;
}
