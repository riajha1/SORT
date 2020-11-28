import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class EyTechnologyService {
    constructor(private http: HttpClient) { }

    getQueryPost(query: string, data) {
      const url = environment.apiUrl + query;
      const headers = new HttpHeaders({
        Autorization: 'Bearer jsdhkasdj'
      });
      return this.http.post(url, data);
    }
      insertTooldetail(detaildata: any) {
      return this.getQueryPost('insertservice/insertTechnologyGuidance', detaildata).pipe(map(res => res));
    }
    insertTooldetailguidance(detaildata: any) {
      return this.getQueryPost('insertservice/InsertEyTechnologyGuidance', detaildata).pipe(map(res => res));
    }
}

