import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Defaults } from '@models/defaults';
import { BehaviorSubject, from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DefaultsStore {
  private defaultsSubject = new BehaviorSubject<Defaults>(null);
  defaults$: Observable<Defaults> = this.defaultsSubject.asObservable();

  constructor(private db: AngularFirestore) {}

  init() {
    this.db
      .doc('defaults/defaults')
      .get()
      .pipe(
        map((res) => {
          const defaults: Defaults = new Defaults(res.data());
          this.defaultsSubject.next(defaults);
        })
      )
      .subscribe();
  }

  getDefaultPracticeCost = (): number =>
    this.defaultsSubject.getValue().practiceCost;

  getDefaultDoorPrice = (): number => this.defaultsSubject.getValue().doorPrice;

  getDefaultPunchCardCost = (): number =>
    this.defaultsSubject.getValue().punchCardPrice;

  updateDefaults(changes: Partial<Defaults>): Observable<any> {
    return from(this.db.doc('defaults/defaults').update(changes));
  }
}
