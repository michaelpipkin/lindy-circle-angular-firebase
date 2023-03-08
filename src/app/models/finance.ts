import { Timestamp } from 'firebase/firestore';

export interface IFinance {
  financeDate: Timestamp;
  practiceCost: number;
  admissionRevenue: number;
  miscExpense: number;
  miscRevenue: number;
  punchCardsSold: number;
  punchCardRevenue: number;
  readonly total: number;
}

export class Finance implements IFinance {
  constructor(init?: Partial<Finance>) {
    Object.assign(this, init);
  }
  financeDate: Timestamp;
  practiceCost: number;
  admissionRevenue: number;
  miscExpense: number;
  miscRevenue: number;
  punchCardsSold: number;
  punchCardRevenue: number;
  get total(): number {
    return (
      -this.practiceCost +
      this.admissionRevenue -
      this.miscExpense +
      this.miscRevenue +
      this.punchCardRevenue
    );
  }
}
