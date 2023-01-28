import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Member } from '@models/member';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  constructor(private db: AngularFirestore) {}

  getMembers = (activeOnly: boolean = false): Observable<Member[]> =>
    this.db
      .collection<Member>('members', (ref) =>
        ref
          .where('active', 'in', [true, activeOnly])
          .orderBy('lastName')
          .orderBy('firstName')
      )
      .get()
      .pipe(
        map((res) => {
          return <Member[]>res.docs.map(
            (snapshot: { id: string; data: () => any }) => {
              return new Member({
                id: snapshot.id,
                ...snapshot.data(),
              });
            }
          );
        })
      );
}
