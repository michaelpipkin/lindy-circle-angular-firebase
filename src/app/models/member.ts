export interface IMember {
  id: string;
  firstName: string;
  lastName: string;
  active: boolean;
  totalAttendance: number;
  readonly firstLastName: string;
  readonly lastFirstName: string;
  readonly activeText: string;
}

export class Member implements IMember {
  constructor(init?: Partial<Member>) {
    Object.assign(this, init);
  }
  id: string = '';
  firstName: string = '';
  lastName: string = '';
  active: boolean = false;
  totalAttendance: number = 0;
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
