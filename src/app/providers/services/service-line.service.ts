
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class ServiceLineService {
  constructor(private http: HttpClient) {}

  getQuery(query: string) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    // return this.http.get(url, { headers});
    return this.http.get(url);
  }
  getQueryPost(query: string, data) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    return this.http.post(url, data);
  }

  getServiceLineModel() {
    return this.getQuery('serviceline')
    .pipe(
      map(data => data)
    );
  }

  getServiceLineValues() {
    const temp: any = {
      name: 'All',
      value: 'All',
      prefix: 'All',
      selected: true
    };
    return this.getQuery('serviceline')
    .pipe(
      map((data: any) => {
            const res = data.map(e => ({
              name: e.serviceLineName,
              value: e.serviceLineCode,
              prefix: e.serviceLinePrefix,
              selected: false
            }));
            res.unshift(temp);
            return res;
      })
    );
  }

  saveServiceLineGuidance(global) {
    return this.getQueryPost('insertservice/InsertServiceLineGuidance', global)
    .pipe(
      map(res => res)
    );
  }
  saveCountryServiceLineGuidance(local) {
    return this.getQueryPost('insertservice/InsertCountryLineGuidance', local)
    .pipe(
      map(res => res)
    );
  }
}
