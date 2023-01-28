import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Member } from '@models/member';
import { MembersService } from '@services/members.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent implements OnInit {
  members$: Observable<Member[]>;
  filteredMembers$: Observable<Member[]>;

  constructor(private membersService: MembersService) {}

  ngOnInit(): void {
    this.members$ = this.membersService.getMembers();
    this.getFilteredMembers();
  }

  onCheckedChanged(e: MatCheckboxChange): void {
    this.getFilteredMembers(e.checked);
  }

  getFilteredMembers(activeOnly: boolean = true): void {
    this.filteredMembers$ = this.members$.pipe(
      map((members) =>
        members.filter((member) => member.active || member.active == activeOnly)
      )
    );
  }
}
