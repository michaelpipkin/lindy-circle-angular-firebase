import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Practice } from '@models/practice';
import { DefaultsStore } from '@services/defaults.store';
import { PracticeService } from '@services/practice.service';
import { LoadingService } from '@shared/loading/loading.service';
import * as firestore from 'firebase/firestore';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-add-practice',
  templateUrl: './add-practice.component.html',
  styleUrls: ['./add-practice.component.scss'],
})
export class AddPracticeComponent {
  newPracticeForm = this.fb.group({
    practiceDate: [new Date(), Validators.required],
    practiceTopic: ['', Validators.required],
    practiceCost: [0.0, [Validators.required, Validators.min(0)]],
    miscExpense: [0.0, [Validators.required, Validators.min(0)]],
    miscRevenue: [0.0, [Validators.required, Validators.min(0)]],
  });
  saveEnabled: boolean = true;

  constructor(
    private dialogRef: MatDialogRef<AddPracticeComponent>,
    private fb: FormBuilder,
    private practiceService: PracticeService,
    private defaults: DefaultsStore,
    private loading: LoadingService,
    private snackBar: MatSnackBar
  ) {
    this.newPracticeForm.patchValue({
      practiceCost: this.defaults.getDefaultPracticeCost(),
    });
  }

  onSubmit(): void {
    this.newPracticeForm.disable();
    const val = this.newPracticeForm.value;
    const newPractice: Partial<Practice> = {
      practiceDate: firestore.Timestamp.fromDate(val.practiceDate),
      practiceTopic: val.practiceTopic,
      practiceCost: val.practiceCost,
      miscExpense: val.miscExpense,
      miscRevenue: val.miscRevenue,
    };
    this.practiceService
      .addPractice(newPractice)
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
          this.newPracticeForm.enable();
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe();
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
