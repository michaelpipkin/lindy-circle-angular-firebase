import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SortingService {
  constructor() {}

  sort(data: any[], col: string, asc: boolean) {
    data = data.sort(function (a: any, b: any) {
      if (asc) return a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0;
      else return b[col] > a[col] ? 1 : b[col] < a[col] ? -1 : 0;
    });
    return data;
  }
}
