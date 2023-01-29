import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Member } from '@models/member';
import { MembersService } from '@services/members.service';

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
    private fb: FormBuilder,
    private membersService: MembersService,
    private router: Router
  ) {}

  onSubmit(): void {
    const val = this.newMemberForm.value;
    const newMember: Partial<Member> = {
      firstName: val.firstName,
      lastName: val.lastName,
      active: true,
    };
  }
}
