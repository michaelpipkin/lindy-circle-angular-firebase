import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Member } from '@models/member';
import { Practice } from '@models/practice';
import { PunchCard } from '@models/punch-card';
import { AttendanceService } from '@services/attendance.service';
import { MemberService } from '@services/member.service';
import { PunchCardService } from '@services/punch-card.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-attendance',
  templateUrl: './add-attendance.component.html',
  styleUrls: ['./add-attendance.component.scss'],
})
export class AddAttendanceComponent implements OnInit {
  newAttendanceForm = this.fb.group({
    member: [null, Validators.required],
    paymentType: [null, Validators.required],
    paymentAmount: [0.0, [Validators.required, Validators.min(0)]],
  });
  members$: Observable<Member[]>;

  constructor(
    private dialogRef: MatDialogRef<AddAttendanceComponent>,
    private fb: FormBuilder,
    private memberService: MemberService,
    private attendanceService: AttendanceService,
    private punchCardService: PunchCardService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public practice: Practice
  ) {}

  ngOnInit(): void {
    this.members$ = this.memberService.getMembersForAttendance(
      this.practice.id
    );
  }

  onSubmit(): void {}

  close(): void {
    this.dialogRef.close(false);
  }
}
