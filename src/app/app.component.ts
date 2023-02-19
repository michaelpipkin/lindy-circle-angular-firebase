import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { importData } from '@services/db-utils';
import { DefaultsStore } from '@services/defaults.store';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'The Lindy Circle';

  constructor(
    private db: AngularFirestore,
    public user: UserService,
    private defaults: DefaultsStore
  ) {}

  ngOnInit(): void {
    this.defaults.init();
    this.user.init();
  }

  logout(): void {
    this.user.logout();
  }

  onImportClick() {
    importData(this.db);
  }
}
