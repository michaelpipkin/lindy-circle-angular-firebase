import { Component, OnInit } from '@angular/core';
import { Finance } from '@models/finance';
import { FinanceService } from '@services/finance.service';
import { LoadingService } from '@shared/loading/loading.service';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-finances',
  templateUrl: './finances.component.html',
  styleUrls: ['./finances.component.scss'],
})
export class FinancesComponent implements OnInit {
  finances$: Observable<Finance[]>;
  columnsToDisplay: string[] = [
    'financeDate',
    'practiceCost',
    'admissionRevenue',
    'miscExpense',
    'miscRevenue',
    'punchCardsSold',
    'punchCardRevenue',
    'total',
  ];
  financeTotal: Finance;

  constructor(
    private finances: FinanceService,
    private loading: LoadingService
  ) {}

  ngOnInit(): void {
    this.loading.loadingOn();
    this.finances$ = this.finances
      .getFinances()
      .pipe(tap(() => this.loading.loadingOff()));
    this.finances
      .getFinances()
      .pipe(
        tap((finances) => {
          this.financeTotal = finances.reduce(function (
            acc: Finance,
            val: Finance
          ) {
            acc.practiceCost += val.practiceCost;
            acc.admissionRevenue += val.admissionRevenue;
            acc.miscExpense += val.miscExpense;
            acc.miscRevenue += val.miscRevenue;
            acc.punchCardsSold += val.punchCardsSold;
            acc.punchCardRevenue += val.punchCardRevenue;
            return acc;
          });
        })
      )
      .subscribe();
  }
}
