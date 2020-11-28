import { map } from 'rxjs/internal/operators/map';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ServiceStatusModel } from '../../models/model.index';
@Injectable()
export class ServiceStatusService {
  serviceStatus: Array<ServiceStatusModel>;
  constructor(private http: HttpClient) {
    this.serviceStatus = new Array<ServiceStatusModel>();
  }
  getQuery(query: string) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    // return this.http.get(url, { headers});
    return this.http.get(url);
  }

  getDropdownActive() {

    return this.getQuery(`ServiceStatus`).pipe(
      map((res: any) => JSON.parse(res.value)));
  }

  getAll() {
    return this.getQuery(`ServiceStatus/getall`).pipe(
      map(res => res)
    );
  }
}
