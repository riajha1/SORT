import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { ClientFilter } from '../../models/model.index';

import { Subject } from 'rxjs/internal/Subject';
import { map } from 'rxjs/internal/operators/map';
import { tap } from 'rxjs/internal/operators/tap';

@Injectable()
export class ClientNeedService {
  clientNeedChanged = new Subject<ClientFilter[]>();
  public clientNeed: ClientFilter[] = [];
  constructor( private http: HttpClient) {
  }
  getQuery(query: string) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    // return this.http.get(url, { headers});
    return this.http.get(url);
  }

  fetchClientNeeds() {
    return this.getQuery(`clientneed`).pipe(
      map((data: any) =>
      data.map(e => ({
        parent: e.serviceLineCode,
        id: 'CL' + e.idClientNeed,
        label: e.clientNeedName, selected: false}))
      ),
      tap(data => this.setClientNeed(data)
      )
    );
  }

  getClientNeed = () => this.getQuery('clientneed').pipe(map(res => res));

  setClientNeed(client: ClientFilter[]) {
    this.clientNeed = client;
    this.clientNeedChanged.next(this.clientNeed);
  }
}

