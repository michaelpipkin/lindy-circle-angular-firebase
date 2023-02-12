import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Member } from '@models/member';
import { MemberService } from '@services/member.service';
import { LoadingService } from '@shared/loading/loading.service';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss'],
  providers: [LoadingService],
})
export class AddMemberComponent {
  newMemberForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });

  constructor(
    private dialogRef: MatDialogRef<AddMemberComponent>,
    private fb: FormBuilder,
    private membersService: MemberService
  ) {}

  onSubmit(): void {
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
    this.membersService
      .addMember(newMember)
      .pipe(
        tap(() => {
          this.dialogRef.close(true);
        })
      )
      .subscribe();
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
