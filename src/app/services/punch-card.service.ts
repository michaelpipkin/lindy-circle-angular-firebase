import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Member } from '@models/member';
import { PunchCard } from '@models/punch-card';
import { increment } from 'firebase/firestore';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PunchCardService {
  constructor(private db: AngularFirestore) {}

  getPunchCardsForMember(memberId: string): Observable<PunchCard[]> {
    return this.db
      .collection<PunchCard>(`punch-cards`, (ref) =>
        ref.orderBy('purchaseDate')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((punchCards: PunchCard[]) => {
          return <PunchCard[]>punchCards
            .filter(
              (f) =>
                f.currentMemberId === memberId ||
                f.purchaseMemberId === memberId
            )
            .map((punchCard) => {
              return new PunchCard({
                ...punchCard,
              });
            });
        })
      );
  }

  getPunchCardsHeldByMember(memberId: string): Observable<PunchCard[]> {
    return this.db
      .collection<PunchCard>('punch-cards', (ref) =>
        ref.where('currentMemberId', '==', memberId).orderBy('purchaseDate')
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

  getUsablePunchCardForMember(memberId: string): Observable<PunchCard | null> {
    return this.db
      .collection<PunchCard>('punch-cards', (ref) =>
        ref
          .where('currentMemberId', '==', memberId)
          .where('punchesRemaining', '>', 0)
          .limit(1)
      )
      .get()
      .pipe(
        map((res) => {
          if (res.docs.length > 0) {
            const punchCard = res.docs[0];
            return new PunchCard({
              id: punchCard.id,
              ...punchCard.data(),
            });
          } else {
            return null;
          }
        })
      );
  }

  addPunchCard(
    punchCard: Partial<PunchCard>,
    memberId: string
  ): Observable<any> {
    const batch = this.db.firestore.batch();
    punchCard.id = this.db.createId();
    const punchCardRef = this.db.doc<PunchCard>(
      `/punch-cards/${punchCard.id}`
    ).ref;
    const memberRef = this.db.doc<Member>(`members/${memberId}`).ref;
    batch.set(punchCardRef, punchCard);
    batch.update(memberRef, {
      punchesRemaining: increment(5),
      punchCardPurchaseTotal: increment(punchCard.purchaseAmount),
      totalPaid: increment(punchCard.purchaseAmount),
    });
    return from(batch.commit());
  }

  deletePunchCard(memberId: string, punchCard: PunchCard): Observable<any> {
    const batch = this.db.firestore.batch();
    const punchCardRef = this.db.doc<PunchCard>(
      `punch-cards/${punchCard.id}`
    ).ref;
    const memberRef = this.db.doc<Member>(`members/${memberId}`).ref;
    batch.delete(punchCardRef);
    batch.update(memberRef, {
      punchesRemaining: increment(-5),
      punchCardPurchaseTotal: increment(-punchCard.purchaseAmount),
      totalPaid: increment(-punchCard.purchaseAmount),
    });
    return from(batch.commit());
  }

  transferPunchCard(
    punchCard: PunchCard,
    oldMember: Member,
    newMember: Member
  ): Observable<any> {
    const punchCardRef = this.db.doc(`punch-cards/${punchCard.id}`).ref;
    const fromMemberRef = this.db.doc(`members/${oldMember.id}`).ref;
    const toMemberRef = this.db.doc(`members/${newMember.id}`).ref;
    const batch = this.db.firestore.batch();
    batch.update(punchCardRef, {
      currentMemberId: newMember.id,
      currentMemberName: newMember.firstLastName,
    });
    batch.update(fromMemberRef, {
      punchesRemaining: increment(-punchCard.punchesRemaining),
    });
    batch.update(toMemberRef, {
      punchesRemaining: increment(punchCard.punchesRemaining),
    });
    return from(batch.commit());
  }
}
