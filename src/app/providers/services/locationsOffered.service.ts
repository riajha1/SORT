
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class LocationsOfferedService {

  location: Array<any>;
  constructor(private http: HttpClient) {
      this.location = [];
  }

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
  getLocationOfferingWord(idService: number) {
    const text = `locationsoffered/word/${idService}`;
    return this.getQuery(text).pipe(
      map((data: any) => {
        const parseData = JSON.parse(data.value);
        const temp = [];
        parseData.map(item => {
          temp.push(item);
        });
        this.location = temp;
        return this.location;
      })
    );
  }
}
