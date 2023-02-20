export interface IMember {
  id: string;
  firstName: string;
  lastName: string;
  active: boolean;
  totalAttendance: number;
  attendancePaymentTotal: number;
  punchCardPurchaseTotal: number;
  punchesRemaining: number;
  totalPaid: number;
  readonly firstLastName: string;
  readonly lastFirstName: string;
  readonly activeText: string;
}

export class Member implements IMember {
  constructor(init?: Partial<Member>) {
    Object.assign(this, init);
  }
  id: string = '';
  firstName: string;
  lastName: string;
  active: boolean = true;
  totalAttendance: number = 0;
  attendancePaymentTotal: number = 0;
  punchCardPurchaseTotal: number = 0;
  punchesRemaining: number = 0;
  totalPaid: number = 0;
  get firstLastName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
  get lastFirstName(): string {
    return `${this.lastName}, ${this.firstName}`;
  }
  get activeText(): string {
    return this.active ? 'Active' : 'Inactive';
  }
}
