export interface IPunchCard {
  id: string;
  purchaseMemberId: string;
  purchaseDate: Date;
  purchaseAmount: number;
  punchesRemaining: number;
}

export class PunchCard implements IPunchCard {
  id: string;
  purchaseMemberId: string;
  purchaseDate: Date;
  purchaseAmount: number;
  punchesRemaining: number;
}
