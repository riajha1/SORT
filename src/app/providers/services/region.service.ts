import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable()
export class RegionService {
  constructor(private http: HttpClient) { }
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

  getAllRegion() {
    return this.getQuery('Country/region').pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }

  getRegionsByArea(area: string) {
    return this.getQuery(`Country/GetRegionsByArea/` + area).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }

  getAllArea() {
    return this.getQuery('Country/GetAllArea').pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
}
