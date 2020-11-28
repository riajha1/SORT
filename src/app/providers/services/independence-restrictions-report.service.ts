import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class IndependenceRestrictionsReportService {
  constructor(private http: HttpClient) { }
  getQuery(query: string) {
    const url = environment.apiUrl + query;
    return this.http.get(url);
  }
  getQueryPost(query: string, data) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    return this.http.post(url, data);
  }

  getIndependenceRestrictions(idService: number) {
    const text = `IndependenceRestrictionsReport/${idService}`;
    return this.getQuery(text).pipe(
      map((data: any) => {
        const parseData = JSON.parse(data.value);
        return parseData;
      })
    )
  }

}
