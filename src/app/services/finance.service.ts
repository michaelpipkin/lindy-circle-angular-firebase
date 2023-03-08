import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Finance } from '@models/finance';
import { Practice } from '@models/practice';
import { PunchCard } from '@models/punch-card';
import { Timestamp } from 'firebase/firestore';
import { concatMap, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  constructor(private db: AngularFirestore) {}

  getFinances(): Observable<Finance[]> {
    let previousPracticeDate: Timestamp = new Timestamp(0, 0);
    return this.db
      .collection<PunchCard>('punch-cards')
      .get()
      .pipe(
        concatMap((res) => {
          const punchCards = <PunchCard[]>res.docs.map((snapshot) => {
            return snapshot.data();
          });
          return this.db
            .collection<Practice>('practices', (ref) =>
              ref.orderBy('practiceDate')
            )
            .valueChanges()
            .pipe(
              map((practices: Practice[]) => {
                return practices.map((practice: Practice) => {
                  const finance = new Finance({
                    financeDate: practice.practiceDate,
                    practiceCost: practice.practiceCost,
                    admissionRevenue: practice.admissionRevenue ?? 0,
                    miscExpense: practice.miscExpense,
                    miscRevenue: practice.miscRevenue,
                    punchCardsSold:
                      practice.practiceNumber === 1
                        ? punchCards.filter(
                            (f) => f.purchaseDate <= practice.practiceDate
                          ).length
                        : punchCards.filter(
                            (f) =>
                              f.purchaseDate > previousPracticeDate &&
                              f.purchaseDate <= practice.practiceDate
                          ).length,
                    punchCardRevenue:
                      practice.practiceNumber === 1
                        ? punchCards
                            .filter(
                              (f) => f.purchaseDate <= practice.practiceDate
                            )
                            .reduce(function (a, b) {
                              return a + b.purchaseAmount;
                            }, 0)
                        : punchCards
                            .filter(
                              (f) =>
                                f.purchaseDate > previousPracticeDate &&
                                f.purchaseDate <= practice.practiceDate
                            )
                            .reduce(function (a, b) {
                              return a + b.purchaseAmount;
                            }, 0),
                  });
                  previousPracticeDate = practice.practiceDate;
                  return finance;
                });
              })
            );
        })
      );
  }
}
