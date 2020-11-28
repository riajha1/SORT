import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class IndependenceConsiderationsContentService {
  constructor(private http: HttpClient) {}
  getQuery(query: string) {
    const url = environment.apiUrl + query;
    return this.http.get(url);
  }
  getQueryPost(query: string, data) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    return this.http.post(url, data);
  }

  getIndependenceConsiderationsContent() {
    return this.getQuery('independenceConsiderationsContent').pipe(map(res => res));
  }
  getIndependenceConsiderationsValidator(temp: any) {
    return this.getQueryPost('independenceConsiderationscontent/validateExist', temp).pipe(map(res => res));
  }
  addIndependenceConsiderations(independence: any) {
    return this.getQueryPost('independenceConsiderationsContent', independence).pipe(map(res => res));
  }
  updateIndependenceConsiderations(independence) {
    return this.getQueryPost('independenceConsiderationscontent/update', independence).pipe(map(res => res));
  }
  deleteIndependenceConsiderations(independence) {
    return this.getQueryPost('independenceConsiderationscontent/delete', independence).pipe(map(res => res));
  }
  useIndependenceConsiderations(delivery) {
    return this.getQueryPost('independenceConsiderationscontent/validate', delivery).pipe(map(res => res));
  }

  getshowhidedata() {
  return this.getQuery('IndependenceConsiderationsContent').pipe(map(res => res));
  }

  globalconsideration(data) {
    return this.getQueryPost('insertservice/insertConsiderations', data).pipe(map(res => res));
  }
  insertLocalConsiderations(data){
    return this.getQueryPost('insertservice/insertCountryConsiderations', data).pipe(map(res => res));
  }
}

