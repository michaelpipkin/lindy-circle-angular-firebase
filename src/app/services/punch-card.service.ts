import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Attendance } from '@models/attendance';
import { PunchCard } from '@models/punch-card';
import { concatMap, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PunchCardService {
  constructor(private db: AngularFirestore) {}

  getPunchCardsForMember = (memberId: string): Observable<PunchCard[]> =>
    this.db
      .collectionGroup('attendances', (ref) =>
        ref.where('memberId', '==', memberId).where('paymentType', '==', 2)
      )
      .get()
      .pipe(
        concatMap((attendances) => {
          const punchesUsed = <string[]>attendances.docs.map((attendance) => {
            return attendance.data()['punchCardId'];
          });
          return this.db
            .collection<PunchCard>(`members/${memberId}/punch-cards`, (ref) =>
              ref.orderBy('purchaseDate')
            )
            .valueChanges({ idField: 'id' })
            .pipe(
              map((punchCards) => {
                return <PunchCard[]>punchCards.map((punchCard) => {
                  return new PunchCard({
                    ...punchCard,
                    punchesRemaining:
                      5 - punchesUsed.filter((f) => f == punchCard.id).length,
                  });
                });
              })
            );
        })
      );
}
