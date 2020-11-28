import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs/internal/observable/of';

@Injectable()
export class UserService {
  private filterApp = new Subject<any>();

  filter = {
    serviceLine: [],
    client: {},
    searchString: ''
  };

  selectedcountry = '';
  selectedcountryChanged = new Subject<any>();

  previousselectedcountry = '';
  previousselectedcountryChanged = new Subject<any>();

  previousselectedclient = '';
  previousselectedclientChanged = new Subject<any>();

  userfullname = '';
  userfullnameChanged = new Subject<any>();

  userLoginStatus = true;
  userLoginStatusChanged = new Subject<any>();

  userSessionTime = '';
  userSessionTimeChanged = new Subject<any>();

  userIdleTime = '';
  userIdleTimeChanged = new Subject<any>();

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

  getfilterApp(): Observable<any> {
    return this.filterApp.asObservable();
  }

  getUserIdleTime(): Observable<any> {
    return this.userIdleTimeChanged.asObservable();
  }

  saveUserFullName(userFullName: string) {
    this.userfullname = userFullName;
    this.userfullnameChanged.next(this.userfullname);
  }

  saveuserLoginStatus(status: boolean) {
    this.userLoginStatus = status;
    this.userLoginStatusChanged.next(this.userLoginStatus);
  }

  saveCountry(country: string) {
    this.selectedcountry = country;
    this.selectedcountryChanged.next(this.selectedcountry);
  }
  savePreviousCountry(country: string) {
    this.previousselectedcountry = country;
    this.previousselectedcountryChanged.next(this.previousselectedcountry);
  }
  savePreviousClient(client: any) {
    this.previousselectedclient = client;
    this.previousselectedclientChanged.next(this.previousselectedclient);
  }
  saveClientFilter(filter) {
    this.filter.client = filter;
    this.filterApp.next({ ...this.filter, client: filter });
  }
  saveSearchFilter(stringText) {
    this.filter.searchString = stringText;
    this.filterApp.next({ ...this.filter, searchString: stringText });
  }
  saveSlFilter(filter) {
    this.filter.serviceLine = filter;
    this.filterApp.next({ ...this.filter, serviceLine: filter });
  }

  saveSessionTime(sessionTime: any) {
    this.userSessionTime = sessionTime;
    this.userSessionTimeChanged.next(this.userSessionTime);
  }

  saveIdleTime(sessionTime: any) {
    this.userIdleTime = sessionTime;
    this.userIdleTimeChanged.next(this.userIdleTime);
  }
  removeClientFilter() {
    const temp = { ...this.filter, client: {} };
    this.filter = temp;
    this.filterApp.next(temp);
  }
  removeFilter() {
    this.filterApp.next(
      {
        serviceLine: [],
        client: {},
        searchString: ''
      }
    );
    this.filter = {
      serviceLine: [],
      client: {},
      searchString: ''
    };
  }

  getLastFrenquentViewByUser(credentials, idService) {
    const data = { UserName: credentials.UserName, IdService: parseInt(idService, 10) };
    return this.getQueryPost('UserViewed/validate', data).pipe(
      map((res: any) => {
        const result = JSON.parse(res.value);
        const request = this.insertFrenquentViewByUser(data, result);
        if (request !== undefined) {
          request.subscribe(e => console.log('saved view'));
        }
      },
        errorService => console.log('error endpoint', errorService.message)
      ));
  }
  insertFrenquentViewByUser(userObj, token) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const obj = { userName: userObj.UserName, idService: userObj.IdService, token: userData.Id };
    // if (userData.Id !== token) {
    return this.getQueryPost('userviewed', obj).pipe(
      map((res: any) => { },
        errorService => console.log('error endpoint', errorService.message)));
    // }
  }

  fuzzyPeopleSearch(text: string) {
    if (!text.trim()) {
      return [];
    }
    const people = this.getQuery(`FuzzySearch/searchuser/${text}`)
      .pipe(
        map(
          (res: any) => res),
        catchError(this.handleError<[string, any[]]>('searchPersonnels', [text, []])
        )
      );
    return people;
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
