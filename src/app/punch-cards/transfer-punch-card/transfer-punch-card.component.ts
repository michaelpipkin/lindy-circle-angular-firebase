import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Member } from '@models/member';
import { PunchCard } from '@models/punch-card';
import { MemberService } from '@services/member.service';
import { PunchCardService } from '@services/punch-card.service';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-transfer-punch-card',
  templateUrl: './transfer-punch-card.component.html',
  styleUrls: ['./transfer-punch-card.component.scss'],
})
export class TransferPunchCardComponent implements OnInit {
  members$: Observable<Member[]>;
  transferForm = this.fb.group({
    transferMember: [null, Validators.required],
  });

  constructor(
    private dialogRef: MatDialogRef<TransferPunchCardComponent>,
    private fb: FormBuilder,
    private punchCardService: PunchCardService,
    private memberService: MemberService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: { currentMember: Member; punchCard: PunchCard }
  ) {}

  ngOnInit(): void {
    this.members$ = this.memberService.getMembersForTransfer(
      this.data.currentMember.id
    );
  }

  onSubmit(): void {
    this.transferForm.disable();
    this.punchCardService
      .transferPunchCard(
        this.data.punchCard,
        this.data.currentMember,
        this.transferForm.value.transferMember
      )
      .pipe(
        tap(() => {
          this.dialogRef.close(true);
        }),
        catchError((err: Error) => {
          this.snackBar.open(
            'Something went wrong - could not transfer punch card.',
            'Close',
            { verticalPosition: 'top' }
          );
          this.transferForm.enable();
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe();
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
