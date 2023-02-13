import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Member } from '@models/member';
import { MemberService } from '@services/member.service';
import { LoadingService } from '@shared/loading/loading.service';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-edit-member',
  templateUrl: './edit-member.component.html',
  styleUrls: ['./edit-member.component.scss'],
})
export class EditMemberComponent {
  editMemberForm: FormGroup;
  member: Member;

  constructor(
    private dialogRef: MatDialogRef<EditMemberComponent>,
    private fb: FormBuilder,
    private memberService: MemberService,
    private loading: LoadingService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) member: Member
  ) {
    this.member = member;
    this.editMemberForm = this.fb.group({
      firstName: [member.firstName, Validators.required],
      lastName: [member.lastName, Validators.required],
      active: [member.active],
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    const changes = this.editMemberForm.value;
    this.memberService
      .updateMember(this.member.id, changes)
      .pipe(
        tap(() => {
          this.loading.loadingOff();
          this.dialogRef.close(true);
        }),
        catchError((err: Error) => {
          this.snackBar.open(
            'Something went wrong - could not update member.',
            'Close',
            {
              verticalPosition: 'top',
            }
          );
          this.loading.loadingOff();
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe();
  }
}
