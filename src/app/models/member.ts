export interface IMember {
  id: string;
  firstName: string;
  lastName: string;
  active: boolean;
  readonly firstLastName: string;
  readonly lastFirstName: string;
}

export class Member implements IMember {
  id: string;
  firstName: string;
  lastName: string;
  active: boolean;
  get firstLastName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
  get lastFirstName(): string {
    return `${this.lastName}, ${this.firstName}`;
  }
}
