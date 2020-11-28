
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class AdminUserAccessService {
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
  updateAccessRight(user) {
    return this.getQueryPost('useraccess/updateuser', user).pipe(
      map((data: any) => data)
    );
  }

  deleteAccessRight(user: any) {
    return this.getQueryPost('useraccess/deleteuser', user).pipe(
      map((data: any) => data)
    );
  }
  getUserRoles() { // to get the user role
    return this.getQuery('useraccess/getroles')
      .pipe(map((res: any) => JSON.parse(res.value)));
  }

  addNewUser(addNewFormData: any) {
    return this.getQueryPost('useraccess/insertuser', addNewFormData).pipe(map(res => res));
  }

  getSearchResult(searchdata) {
    return this.getQueryPost('useraccess', searchdata).pipe(map(res => res));
  }
}
