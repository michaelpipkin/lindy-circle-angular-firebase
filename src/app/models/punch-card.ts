import { Timestamp } from 'firebase/firestore';

export interface IPunchCard {
  id: string;
  purchaseMemberId: string;
  purchaseMemberName: string;
  purchaseDate: Timestamp;
  purchaseAmount: number;
  punchesRemaining: number;
}

export class PunchCard implements IPunchCard {
  constructor(init?: Partial<PunchCard>) {
    Object.assign(this, init);
  }
  id: string;
  purchaseMemberId: string;
  purchaseMemberName: string;
  purchaseDate: Timestamp;
  purchaseAmount: number;
  punchesRemaining: number;
}
