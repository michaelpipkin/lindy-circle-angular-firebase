import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
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
    private route: ActivatedRoute
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
    const pathFromAdmin = this.route.pathFromRoot;
    let defaultsSub$ = pathFromAdmin[1].data.pipe(
      map((res) => {
        return res.defaultValues$;
      })
    );
    console.log(defaultsSub$);
    defaultsSub$.subscribe((defaults) => {
      console.log(defaults);
      this.editDefaultsForm.setValue({
        doorPrice: defaults['doorPrice'],
        punchCardPrice: defaults['punchCardPrice'],
        practiceCost: defaults['practiceCost'],
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
