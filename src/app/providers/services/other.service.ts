import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class OtherService {
    constructor(private http: HttpClient) { }

    getQueryPost(query: string, data) {
      const url = environment.apiUrl + query;
      const headers = new HttpHeaders({
        Autorization: 'Bearer jsdhkasdj'
      });
      return this.http.post(url, data);
    }
      insertOtherdetail(detaildata: any) {
      return this.getQueryPost('insertservice/InsertOther', detaildata).pipe(map(res => res));
    }
}

