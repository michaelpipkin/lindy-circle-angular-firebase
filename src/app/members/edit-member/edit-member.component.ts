import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Member } from '@models/member';
import { MembersService } from '@services/members.service';

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
    private membersService: MembersService,
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
    this.membersService.updateMember(this.member.id, changes).subscribe(() => {
      this.dialogRef.close(true);
    });
  }
}