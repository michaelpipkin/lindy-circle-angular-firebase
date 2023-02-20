import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DefaultsStore } from '@services/defaults.store';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-defaults',
  templateUrl: './defaults.component.html',
  styleUrls: ['./defaults.component.scss'],
})
export class DefaultsComponent {
  editDefaultsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private defaults: DefaultsStore,
    private snackBar: MatSnackBar
  ) {
    this.defaults.defaults$.subscribe((defaults) => {
      this.editDefaultsForm = this.fb.group({
        doorPrice: [0, [Validators.required, Validators.min(0)]],
        punchCardPrice: [0, [Validators.required, Validators.min(0)]],
        practiceCost: [0, [Validators.required, Validators.min(0)]],
      });
    });
    this.resetForm();
  }

  resetForm(): void {
    this.defaults.defaults$.subscribe((defaults) => {
      this.editDefaultsForm.setValue({
        doorPrice: !!defaults ? defaults.doorPrice : 0,
        punchCardPrice: !!defaults ? defaults.punchCardPrice : 0,
        practiceCost: !!defaults ? defaults.practiceCost : 0,
      });
    });
  }

  onSubmit(): void {
    this.editDefaultsForm.disable();
    const changes = this.editDefaultsForm.value;
    this.defaults
      .updateDefaults(changes)
      .pipe(
        tap(() => {
          this.snackBar.open('Defaults have been updated.', 'Close', {
            verticalPosition: 'top',
          });
          this.editDefaultsForm.enable();
        }),
        catchError((err: Error) => {
          this.snackBar.open(
            'Something went wrong - could not update defaults.',
            'Close',
            {
              verticalPosition: 'top',
            }
          );
          this.editDefaultsForm.enable();
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe();
  }
}
