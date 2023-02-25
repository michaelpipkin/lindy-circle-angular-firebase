import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Member } from '@models/member';
import { MemberService } from '@services/member.service';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-edit-member',
  templateUrl: './edit-member.component.html',
  styleUrls: ['./edit-member.component.scss'],
})
export class EditMemberComponent {
  editMemberForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<EditMemberComponent>,
    private fb: FormBuilder,
    private memberService: MemberService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public member: Member
  ) {
    this.editMemberForm = this.fb.group({
      firstName: [this.member.firstName, Validators.required],
      lastName: [this.member.lastName, Validators.required],
      active: this.member.active,
    });
  }

  public get f() {
    return this.editMemberForm.controls;
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.editMemberForm.disable();
    const changes = this.editMemberForm.value;
    this.memberService
      .updateMember(this.member.id, changes)
      .pipe(
        tap(() => {
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
          this.editMemberForm.enable();
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe();
  }
}
