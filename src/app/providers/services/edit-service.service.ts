import { Injectable } from '@angular/core';
import { map } from 'rxjs/internal/operators/map';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class EditServiceService {

  constructor(private http: HttpClient) { }

  getQuery(query: string) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    // return this.http.get(url, { headers});
    return this.http.get(url);
  }

  editService(idService: number, status: string) {
    return this.getQuery(`EditService/${idService}/${status}`).pipe(
      map((res: any) => JSON.parse(res.value)));
  }
}
