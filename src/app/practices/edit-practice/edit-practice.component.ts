import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Practice } from '@models/practice';
import { PracticeService } from '@services/practice.service';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-edit-practice',
  templateUrl: './edit-practice.component.html',
  styleUrls: ['./edit-practice.component.scss'],
})
export class EditPracticeComponent {
  editPracticeForm: FormGroup;
  minDate: Date = new Date(1900, 0, 1);

  constructor(
    private dialogRef: MatDialogRef<EditPracticeComponent>,
    private fb: FormBuilder,
    private practiceService: PracticeService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public practice: Practice
  ) {
    this.editPracticeForm = this.fb.group({
      practiceDate: [this.practice.practiceDate.toDate(), Validators.required],
      practiceTopic: [this.practice.practiceTopic, Validators.required],
      practiceCost: [
        this.practice.practiceCost,
        [Validators.required, Validators.min(0)],
      ],
      miscExpense: [
        this.practice.miscExpense,
        [Validators.required, Validators.min(0)],
      ],
      miscRevenue: [
        this.practice.miscRevenue,
        [Validators.required, Validators.min(0)],
      ],
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.editPracticeForm.disable();
    const changes = this.editPracticeForm.value;
    this.practiceService
      .updatePractice(this.practice.id, changes)
      .pipe(
        tap(() => {
          this.dialogRef.close(true);
        }),
        catchError((err: Error) => {
          this.snackBar.open(
            'Something went wrong - could not update practice.',
            'Close',
            {
              verticalPosition: 'top',
            }
          );
          this.editPracticeForm.enable();
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe();
  }
}
