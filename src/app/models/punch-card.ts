import { Timestamp } from 'firebase/firestore';

export interface IPunchCard {
  id: string;
  purchaseMemberId: string;
  purchaseMemberName: string;
  currentMemberId: string;
  currentMemberName: string;
  purchaseDate: Timestamp;
  purchaseAmount: number;
  punchesRemaining: number;
  readonly note: string;
}

export class PunchCard implements IPunchCard {
  constructor(init?: Partial<PunchCard>) {
    Object.assign(this, init);
  }
  id: string;
  purchaseMemberId: string;
  purchaseMemberName: string;
  currentMemberId: string;
  currentMemberName: string;
  purchaseDate: Timestamp;
  purchaseAmount: number;
  punchesRemaining: number;
  get note(): string {
    if (this.currentMemberId !== this.purchaseMemberId) {
      return `Transferred from ${this.purchaseMemberName} to ${this.currentMemberName}`;
    } else {
      return '';
    }
  }
}
