import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PunchCard } from '@models/punch-card';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PunchCardService {
  constructor(private db: AngularFirestore) {}

  getPunchCardsForMember(memberId: string): Observable<PunchCard[]> {
    return this.db
      .collection<PunchCard>(`members/${memberId}/punch-cards`, (ref) =>
        ref.orderBy('purchaseDate')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((punchCards: PunchCard[]) => {
          return <PunchCard[]>punchCards.map((punchCard) => {
            return new PunchCard({
              ...punchCard,
            });
          });
        })
      );
  }
}
