import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { SubserviceLineFilter } from '../../models/model.index';
import { environment } from '../../../environments/environment';

import { Subject } from 'rxjs/internal/Subject';
import { map } from 'rxjs/internal/operators/map';
import { tap } from 'rxjs/internal/operators/tap';

@Injectable()
export class SubserviceLineService {
  subservicelineChanged = new Subject<SubserviceLineFilter[]>();
  public subserviceline: SubserviceLineFilter[] = [];
  constructor(private http: HttpClient) {
  }

  getQuery(query: string) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    // return this.http.get(url, { headers});
    return this.http.get(url);
  }

  fetchSubServiceLine() {
    return this.getQuery(`subserviceline`).pipe(
      map((data: any) => {
        const tempSubserviceLine = [];
        data.map(e => {
            const position = e.subServiceLineName.indexOf('-') + 1;
            const a = e.subServiceLineName.replace('-', '');
            const splitlabel = e.subServiceLineName.substring(position).trim();
            const label = a.replace(' ', '');
            const temp: SubserviceLineFilter = {
              parent: e.serviceLineCode,
              id: 'SSL' + e.idSubServiceCode,
              label,
              splitlabel,
              selected: false
            };
            tempSubserviceLine.push(temp);
          });
        return tempSubserviceLine;
      }),
      tap(data => {
          this.setSubserviceLine(data);
      })
    );
  }

  // remove
  getSubserviceLineByServiceLine(slCode: string) {
    const text = `SubServiceLine/${slCode}`;
    return this.getQuery(text).pipe(
      map(res => {
        return res;
    }));
  }
  // new intake form
  getSubserviceLineByServiceLineIntake(slCode: string) {
    const text = `SubServiceLine/${slCode}`;
    return this.getQuery(text).pipe(
      map((data: any) => {
        const subServiceLines = [];
        data.map(element => {
          const position = element.subServiceLineName.indexOf('-') + 1;
          element.subServiceLineName.replace('-', '');
          const splitlabel = element.subServiceLineName.substring(position);
          element.subServiceLineName = splitlabel;
          subServiceLines.push(element);
        });
        return subServiceLines;
    }));
  }
  setSubserviceLine(subserviceline: SubserviceLineFilter[]) {
    this.subserviceline = subserviceline;
    this.subservicelineChanged.next(this.subserviceline);
  }
  getServiceLine() {
    return this.subserviceline;
  }
}
