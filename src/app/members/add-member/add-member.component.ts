import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Member } from '@models/member';
import { MemberService } from '@services/member.service';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss'],
})
export class AddMemberComponent {
  newMemberForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });

  constructor(
    private dialogRef: MatDialogRef<AddMemberComponent>,
    private fb: FormBuilder,
    private memberService: MemberService,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    this.newMemberForm.disable();
    const val = this.newMemberForm.value;
    const newMember: Partial<Member> = {
      firstName: val.firstName,
      lastName: val.lastName,
      active: true,
      totalAttendance: 0,
      attendancePaymentTotal: 0,
      punchCardPurchaseTotal: 0,
      punchesRemaining: 0,
      totalPaid: 0,
    };
    this.memberService
      .addMember(newMember)
      .pipe(
        tap(() => {
          this.dialogRef.close(true);
        }),
        catchError((err: Error) => {
          this.snackBar.open(
            'Something went wrong - could not add member.',
            'Close',
            {
              verticalPosition: 'top',
            }
          );
          this.newMemberForm.enable();
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe();
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
