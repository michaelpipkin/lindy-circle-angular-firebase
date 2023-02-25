import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Attendance } from '@models/attendance';
import { Member } from '@models/member';
import { Practice } from '@models/practice';
import { PunchCard } from '@models/punch-card';
import { AttendanceService } from '@services/attendance.service';
import { DefaultsStore } from '@services/defaults.store';
import { MemberService } from '@services/member.service';
import { PunchCardService } from '@services/punch-card.service';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-add-attendance',
  templateUrl: './add-attendance.component.html',
  styleUrls: ['./add-attendance.component.scss'],
})
export class AddAttendanceComponent implements OnInit {
  newAttendanceForm = this.fb.group({
    member: [null, Validators.required],
    paymentType: [1, Validators.required],
    paymentAmount: [0.0, [Validators.required, Validators.min(0)]],
  });
  members$: Observable<Member[]>;
  defaultAttendanceCost: number;
  hasPunchCardAvailable: boolean = false;
  punchesHint: string = '';
  punchCard: PunchCard = null;

  constructor(
    private dialogRef: MatDialogRef<AddAttendanceComponent>,
    private fb: FormBuilder,
    private memberService: MemberService,
    private attendanceService: AttendanceService,
    private punchCardService: PunchCardService,
    private defaults: DefaultsStore,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public practice: Practice
  ) {}

  ngOnInit(): void {
    this.members$ = this.memberService.getMembersForAttendance(
      this.practice.id
    );
    this.defaultAttendanceCost = this.defaults.getDefaultDoorPrice();
  }

  public get f() {
    return this.newAttendanceForm.controls;
  }

  onMemberChange(e: MatSelectChange) {
    const punchesRemaining = e.value['punchesRemaining'];
    if (punchesRemaining > 0) {
      this.hasPunchCardAvailable = true;
      this.punchesHint = `${punchesRemaining} ${
        punchesRemaining > 1 ? 'punches' : 'punch'
      } left`;
      this.newAttendanceForm.patchValue({
        paymentType: 2,
        paymentAmount: 0,
      });
      this.punchCardService
        .getPunchCardsHeldByMember(e.value['id'])
        .pipe(
          tap((punchCards) => {
            this.punchCard = punchCards.find((f) => f.punchesRemaining > 0);
          })
        )
        .subscribe();
    } else {
      this.hasPunchCardAvailable = false;
      this.punchesHint = '';
      this.newAttendanceForm.patchValue({
        paymentType: 1,
        paymentAmount: this.defaultAttendanceCost,
      });
      this.punchCard = null;
    }
  }

  onPaymentTypeChange(e: MatSelectChange) {
    if (e.value === 1) {
      this.newAttendanceForm.patchValue({
        paymentAmount: this.defaultAttendanceCost,
      });
    } else {
      this.newAttendanceForm.patchValue({
        paymentAmount: 0,
      });
    }
  }

  onSubmit(): void {
    this.newAttendanceForm.disable();
    const val = this.newAttendanceForm.value;
    const member: Member = val.member!;
    const newAttendance: Partial<Attendance> = {
      memberId: member.id,
      paymentType: val.paymentType,
      paymentAmount: val.paymentAmount,
      punchCardId: !!this.punchCard ? this.punchCard.id : null,
    };
    this.attendanceService
      .addAttendance(newAttendance, this.practice.id)
      .pipe(
        tap(() => {
          this.dialogRef.close(true);
        }),
        catchError((err: Error) => {
          this.snackBar.open(
            'Something went wrong - could not add attendance.',
            'Close',
            { verticalPosition: 'top' }
          );
          this.newAttendanceForm.enable();
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe();
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
