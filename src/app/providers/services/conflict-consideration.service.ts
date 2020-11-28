import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConflictConsiderationService {

  constructor(private http: HttpClient) { }
  getQuery(query: string) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    return this.http.get(url);
  }
  getQueryPost(query: string, data) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    return this.http.post(url, data);
  }
  showstandardtext() {
    return this.getQuery('conflictsdata')
      .pipe(
        map((res: any) => JSON.parse(res.value)));
  }

  getOrder() {
    return this.getQuery('deliverymethod/178').pipe(
      map((res: any) => JSON.parse(res.value))
    );
  }

  insertConflictdetail(detaildata: any) {
    return this.getQueryPost('insertservice/insertConflicts', detaildata)
    .pipe(map(res => res));
  }
// get the data of delivery methods from the Database
 getSavedDeliveryMethods(idServiceDeliveryMethod: number) {
      return this.getQuery(`deliverymethod/${idServiceDeliveryMethod}`)
      .pipe(
        map((res: any) => JSON.parse(res.value))
      );
    }
  }
