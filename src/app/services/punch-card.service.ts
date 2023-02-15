import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Member } from '@models/member';
import { PunchCard } from '@models/punch-card';
import { concatMap, from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PunchCardService {
  constructor(private db: AngularFirestore) {}

  getPunchCardsForMember(memberId: string): Observable<PunchCard[]> {
    return this.db
      .collection('members')
      .get()
      .pipe(
        concatMap((res) => {
          const members: Member[] = res.docs.map((member) => {
            return new Member({
              id: member.id,
              ...(<any>member.data()),
            });
          });
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
                    purchaseMemberName:
                      punchCard.purchaseMemberId !== memberId
                        ? members.find(
                            (f) => f.id === punchCard.purchaseMemberId
                          ).firstLastName
                        : '',
                  });
                });
              })
            );
        })
      );
  }

  addPunchCard(punchCard: Partial<PunchCard>): Observable<any> {
    const batch = this.db.firestore.batch();
    punchCard.id = this.db.createId();
    const punchCardRef = this.db.doc(
      `members/${punchCard.purchaseMemberId}/punch-cards/${punchCard.id}`
    ).ref;
    const memberRef = this.db.doc(`members/${punchCard.purchaseMemberId}`).ref;
    return this.db
      .doc(`members/${punchCard.purchaseMemberId}`)
      .get()
      .pipe(
        concatMap((res) => {
          const member = res.data();
          batch.set(punchCardRef, punchCard);
          batch.update(memberRef, {
            punchesRemaining: member['punchesRemaining'] + 5,
            punchCardPurchaseTotal:
              member['punchCardPurchaseTotal'] + punchCard.purchaseAmount,
            totalPaid: member['totalPaid'] + punchCard.purchaseAmount,
          });
          return batch.commit();
        })
      );
  }

  deletePunchCard(memberId: string, punchCard: PunchCard): Observable<any> {
    const batch = this.db.firestore.batch();
    const punchCardRef = this.db.doc(
      `members/${memberId}/punch-cards/${punchCard.id}`
    ).ref;
    const memberRef = this.db.doc(`members/${memberId}`).ref;
    return this.db
      .doc(`members/${memberId}`)
      .get()
      .pipe(
        concatMap((res) => {
          const member = res.data();
          batch.delete(punchCardRef);
          batch.update(memberRef, {
            punchesRemaining: member['punchesRemaining'] - 5,
            punchCardPurchaseTotal:
              member['punchCardPurchaseTotal'] - punchCard.purchaseAmount,
            totalPaid: member['totalPaid'] - punchCard.purchaseAmount,
          });
          return batch.commit();
        })
      );
  }

  transferPunchCard(
    punchCard: PunchCard,
    newMemberId: string
  ): Observable<any> {
    const transferFromRef = this.db.doc(
      `members/${punchCard.purchaseMemberId}/punch-cards/${punchCard.id}`
    ).ref;
    const transferToRef = this.db.doc(
      `members/${newMemberId}/punch-cards/${punchCard.id}`
    ).ref;
    const batch = this.db.firestore.batch();
    batch.delete(transferFromRef);
    batch.set(transferToRef, Object.assign({}, punchCard));
    return from(batch.commit());
  }
}
