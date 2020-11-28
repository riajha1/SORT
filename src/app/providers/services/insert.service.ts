import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { map } from 'rxjs/internal/operators/map';
@Injectable()
export class InsertService {
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
  addService(service: any) {
    return this.getQueryPost('insertService', service).pipe(map(res => res));
  }
  getHeaderService(idService: number) {
    const text = `header/${idService}`;
    const promise = this.getQuery(text).toPromise();
    return promise;
  }
  insertServiceDetail(detail: any) {
    return this.getQueryPost('insertservice/insertdetails', detail).pipe(map(res => res));
  }
  updateServiceDetail(detail: any) {
    return this.getQueryPost('insertservice/updatedetails', detail).pipe(map(res => res));
  }
}
