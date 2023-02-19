import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '@services/user.service';
import * as firebase from 'firebase/auth';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user$: Observable<firebase.User>;
  profileForm: FormGroup;
  currentUser: firebase.User;
  hidePassword: boolean = true;
  hideConfirm: boolean = true;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.userService.currentUser$
      .pipe(
        map((user) => {
          this.currentUser = user;
        })
      )
      .subscribe();
    this.profileForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: '',
        confirmPassword: '',
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null
      : { mismatch: true };
  }

  ngOnInit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.profileForm.patchValue({
      email: this.currentUser.email,
      password: '',
      confirmPassword: '',
    });
  }

  onSubmit(): void {
    this.profileForm.disable();
    const changes = this.profileForm.value;
    if (changes.email !== this.currentUser.email) {
      firebase
        .updateEmail(this.currentUser, changes.email)
        .then(() => {
          this.snackBar.open('Your email address has been updated.', 'Close', {
            verticalPosition: 'top',
          });
        })
        .catch(() => {
          this.snackBar.open(
            'Something went wrong - your email address could not be updated.',
            'Close',
            {
              verticalPosition: 'top',
            }
          );
        });
    }
    if (changes.password !== '') {
      firebase
        .updatePassword(this.currentUser, changes.password)
        .then(() => {
          this.snackBar.open('Your password has been updated.', 'Close', {
            verticalPosition: 'top',
          });
        })
        .catch(() => {
          this.snackBar.open(
            'Something went wrong - your password could not be updated.',
            'Close',
            {
              verticalPosition: 'top',
            }
          );
        });
    }
    this.profileForm.enable();
  }
}
