export interface IPunchCard {
  id: string;
  purchaseMemberId: string;
  purchaseDate: Date;
  purchaseAmount: number;
}

export class PunchCard implements IPunchCard {
  id: string;
  purchaseMemberId: string;
  purchaseDate: Date;
  purchaseAmount: number;
}
