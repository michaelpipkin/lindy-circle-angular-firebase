export interface IDefaults {
  doorPrice: number;
  punchCardPrice: number;
  practiceCost: number;
}

export class Defaults implements IDefaults {
  constructor(init?: Partial<Defaults>) {
    Object.assign(this, init);
  }
  doorPrice: number;
  punchCardPrice: number;
  practiceCost: number;
}
