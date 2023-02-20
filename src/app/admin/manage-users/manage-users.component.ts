import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as firebase from 'firebase/auth';
import { catchError, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
})
export class ManageUsersComponent implements OnInit {
  users: firebase.User[];
  selectedUser: firebase.User;
  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.http
      .get(environment.api.manageUsers)
      .pipe(
        catchError((err: Error) => {
          this.snackBar.open(err.message, 'Close', {
            verticalPosition: 'top',
          });
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe((users: firebase.User[]) => {
        this.users = users;
      });
  }

  onAdminChange(e: MatSlideToggleChange) {
    console.log(e, this.selectedUser);
    this.http
      .post(`${environment.api.manageUsers}/${this.selectedUser.uid}`, {
        admin: e.checked,
      })
      .pipe(
        catchError((err) => {
          this.snackBar.open(err.message, 'Close', {
            verticalPosition: 'top',
          });
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe(() => {
        this.snackBar.open('User admin status updated.', 'Close', {
          verticalPosition: 'top',
        });
      });
  }
}
