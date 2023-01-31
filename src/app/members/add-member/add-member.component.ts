import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
    private fb: FormBuilder,
    private membersService: MemberService,
    private router: Router
  ) {}

  onSubmit(): void {
    const val = this.newMemberForm.value;
    const newMember: Partial<Member> = {
      firstName: val.firstName,
      lastName: val.lastName,
      active: true,
    };
    this.membersService
      .addMember(newMember)
      .pipe(
        tap(() => {
          this.router.navigate(['members']);
        }),
        catchError((err: Error) => {
          alert('There was a problem adding the member.');
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe();
  }
}
