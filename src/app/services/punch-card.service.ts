import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PunchCard } from '@models/punch-card';
import { LoadingService } from '@shared/loading/loading.service';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PunchCardService {
  constructor(private db: AngularFirestore, private loading: LoadingService) {}

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
        }),
        tap(() => this.loading.loadingOff())
      );
  }
}
