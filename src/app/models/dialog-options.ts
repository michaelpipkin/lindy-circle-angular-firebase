export class DialogOptions {
  constructor(init?: Partial<DialogOptions>) {
    Object.assign(this, init);
  }
  title: string = '';
  content: string = '';
  falseButtonText: string = 'Cancel';
  falseButtonColor: string = 'accent';
  trueButtonText: string = 'Confirm';
  trueButtonColor: string = 'primary';
}
