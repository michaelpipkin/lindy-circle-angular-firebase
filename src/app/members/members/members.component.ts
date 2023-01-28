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
  activeOnly: boolean = true;
  nameFilter: string = '';

  constructor(private membersService: MembersService) {}

  ngOnInit(): void {
    this.members$ = this.membersService.getMembers();
    this.filterMembers();
  }

  filterMembers(): void {
    this.filteredMembers$ = this.members$.pipe(
      map((members) =>
        members.filter(
          (member) =>
            (member.active || member.active == this.activeOnly) &&
            (member.firstName
              .toLowerCase()
              .includes(this.nameFilter.toLowerCase()) ||
              member.lastName
                .toLowerCase()
                .includes(this.nameFilter.toLowerCase()))
        )
      )
    );
  }

  clearSearch(): void {
    this.nameFilter = '';
    this.filterMembers();
  }
}
