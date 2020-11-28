import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { CompetencyFilter } from '../../models/model.index';

import { Subject } from 'rxjs/internal/Subject';
import { tap } from 'rxjs/internal/operators/tap';
import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class CompetencyDomainService {
  competencyChanged = new Subject<CompetencyFilter[]>();
  public competencydomain: CompetencyFilter[] = [];
  constructor( private http: HttpClient) {
   }
  getQuery(query: string) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    // return this.http.get(url, { headers});
    return this.http.get(url);
  }

  fetchCompetency() {
    return this.getQuery(`competencydomain`).pipe(
      map((data: any) => {
        return data.map(e => ({
          parent: e.idServiceLine,
          subparent: e.idSubServiceCode,
          id : 'CO' + e.idCompetencyDomain,
          label : e.competencyDomainName,
          selected: false
        }));
      }),
      tap(data => {
          this.setCompetency(data);
      })
    );
  }
  getCompetencyDomainBySubServiceCode(sslCode: string) {
    return this.getQuery(`CompetencyDomain/${sslCode}`).pipe(
      map(res => res));
  }
  setCompetency(competency: CompetencyFilter[]) {
    this.competencydomain = competency;
    this.competencyChanged.next(this.competencydomain);
  }
}
