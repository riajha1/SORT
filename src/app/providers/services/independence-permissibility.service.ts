import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class PermissibilityService {

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

  getColumndata(serviceLineCode: number) {
    return this.getQuery(`Considerationslabel/${serviceLineCode}`).pipe(map((res: any) => JSON.parse(res.value)));
  }
  getIndependenceIcons() {
    return this.getQuery(`ConsiderationsOptions`).pipe(map((res: any) => JSON.parse(res.value)));
  }
  insertPermissibility(detaildata: any) {
    return this.getQueryPost('insertservice/insertPermissibility', detaildata).pipe(map(res => res));
  }

  insertActivityGrid(activitydata: any) {
    return this.getQueryPost('insertservice/insertactivitygrid', activitydata).pipe(map(res => res));
  }

  getDerogation(countryCode: string) {
    return this.getQuery(`country/derogation/${countryCode}`).pipe(map((res: any) => JSON.parse(res.value)));
  }
}
