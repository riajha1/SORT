import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { SolutionFilter } from '../../models/model.index';
import { Subject } from 'rxjs/internal/Subject';
import { map } from 'rxjs/internal/operators/map';
import { tap } from 'rxjs/internal/operators/tap';


@Injectable()
export class SolutionService {
  solutionChanged = new Subject<SolutionFilter[]>();
  public solution: SolutionFilter[] = [];
  constructor( private http: HttpClient) {
  }

  getQuery(query: string) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: "Bearer jsdhkasdj"
    });
    // return this.http.get(url, { headers});
    return this.http.get(url);
  }

  fetchSolutions() {
    return this.getQuery(`solution`).pipe(
      map((data: any) => {
        const tempSolutions = [];
        data.map(e => {
          const temp: SolutionFilter = {
            parent : e.serviceLineCode,
            id : 'SO' + e.idSolution,
            label : e.solutionDescription,
            selected: false
          };
          tempSolutions.push(temp);
        });
        return tempSolutions;
      }),
      tap(data => {
          this.setSolution(data);
      })
    );
  }
  getSolution() {
    return this.getQuery('solution').pipe(map(res => {
      return res;
    }));
  }
  setSolution(solution: SolutionFilter[]) {
    this.solution = solution;
    this.solutionChanged.next(this.solution);
  }
  getSolutions() {
    return this.solution;
  }
}
