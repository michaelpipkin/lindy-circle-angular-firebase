export interface IPractice {
  id: string;
  practiceNumber: number;
  practiceDate: Date;
  practiceTopic: string;
  practiceCost: number;
  miscExpense: number;
  miscRevenue: number;
}

export class Practice implements IPractice {
  id: string;
  practiceNumber: number;
  practiceDate: Date;
  practiceTopic: string;
  practiceCost: number;
  miscExpense: number;
  miscRevenue: number;
}
