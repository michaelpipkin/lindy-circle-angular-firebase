import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PunchCard } from '@models/punch-card';
import { DefaultsStore } from '@services/defaults.store';
import { PunchCardService } from '@services/punch-card.service';
import * as firestore from 'firebase/firestore';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-add-punch-card',
  templateUrl: './add-punch-card.component.html',
  styleUrls: ['./add-punch-card.component.scss'],
})
export class AddPunchCardComponent {
  newPunchCardForm = this.fb.group({
    purchaseDate: [new Date(), Validators.required],
    purchaseAmount: [0.0, Validators.required],
  });

  constructor(
    private dialogRef: MatDialogRef<AddPunchCardComponent>,
    private fb: FormBuilder,
    private punchCardService: PunchCardService,
    private defaults: DefaultsStore,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public purchaseMemberId: string
  ) {
    this.newPunchCardForm.patchValue({
      purchaseAmount: this.defaults.getDefaultPunchCardCost(),
    });
  }

  onSubmit(): void {
    this.newPunchCardForm.disable();
    const val = this.newPunchCardForm.value;
    const newPunchCard: Partial<PunchCard> = {
      purchaseMemberId: this.purchaseMemberId,
      purchaseDate: firestore.Timestamp.fromDate(val.purchaseDate),
      purchaseAmount: val.purchaseAmount,
      punchesRemaining: 5,
    };
    this.punchCardService
      .addPunchCard(newPunchCard)
      .pipe(
        tap(() => {
          this.dialogRef.close(true);
        }),
        catchError((err: Error) => {
          this.snackBar.open(
            'Something went wrong - could not add practice.',
            'Close',
            { verticalPosition: 'top' }
          );
          this.newPunchCardForm.enable();
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe();
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
