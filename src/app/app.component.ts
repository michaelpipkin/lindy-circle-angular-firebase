import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Member } from '@models/member';
import { importData } from '@services/db-utils';
import { MembersService } from '@services/members.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'The Lindy Circle';
  members$: Observable<Member[]>;

  constructor(
    private db: AngularFirestore,
    private membersService: MembersService
  ) {}

  ngOnInit(): void {
    this.members$ = this.membersService.getMembers();
  }

  onImportClick() {
    importData(this.db);
  }
}
