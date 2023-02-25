import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { DefaultsStore } from '@services/defaults.store';
import { catchError, map, merge, tap, throwError } from 'rxjs';

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
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editDefaultsForm = this.fb.group({
      doorPrice: [0, [Validators.required, Validators.min(0)]],
      punchCardPrice: [0, [Validators.required, Validators.min(0)]],
      practiceCost: [0, [Validators.required, Validators.min(0)]],
    });
    const pathFromAdmin = this.route.pathFromRoot[1];
    let defaultsSub$ = pathFromAdmin.data.pipe(
      map((res) => {
        return res.defaultValues$;
      })
    );
    defaultsSub$
      .pipe(
        map((defaultValues) => {
          if (!defaultValues) {
            this.resetForm();
          } else {
            this.editDefaultsForm.setValue({
              doorPrice: defaultValues['doorPrice'],
              punchCardPrice: defaultValues['punchCardPrice'],
              practiceCost: defaultValues['practiceCost'],
            });
          }
        })
      )
      .subscribe();
  }

  public get f() {
    return this.editDefaultsForm.controls;
  }

  resetForm(): void {
    this.defaults.defaults$.subscribe((defaultValues) => {
      this.editDefaultsForm.setValue({
        doorPrice: defaultValues['doorPrice'],
        punchCardPrice: defaultValues['punchCardPrice'],
        practiceCost: defaultValues['practiceCost'],
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
