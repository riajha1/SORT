import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { map } from 'rxjs/internal/operators/map';
import { Subject } from 'rxjs/internal/Subject';
import { tap } from 'rxjs/internal/operators/tap';



@Injectable()
export class FavoritesService {

  favoritesChanged = new Subject<any[]>();
  public favorites: any[] = [];

  constructor( private http: HttpClient) {}
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
  getQueryDelete(query: string) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    return this.http.delete(url);
  }
  getQueryPut(query: string, data) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    return this.http.put(url, data);
  }
  getAllFavoritesByUser(userName) {
    const user = userName.replace('\\', '%5C');
    return this.getQuery(`UserFavorite/${user}`).pipe(
      map((data: any) => {
        if (data instanceof Array) {
          return data.map(element => ({...element, favorite: true}));
        } else {
          return [];
        }
      }),
      tap(
        data => this.setFavorites(data)
      )
    );
  }
  setFavorites(favorites: any[]) {
    this.favorites = favorites;
    this.favoritesChanged.next(this.favorites);
  }
  addFavoriteByUser(userName, favorite: any) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const dataFavorite = {
      AdUserId: userData.UserName,
      ClientName: favorite.ClientName,
      GISId: favorite.GISId,
      MDMId: null,
      DateAdd: null,
      DateUpdated: null
    };
    return this.getQueryPost(`UserFavorite`, dataFavorite).pipe(
      map((data: any) => {
        if ( data === true) {
            return true;
        }
      })
    );
  }
  validationFavorite(userName, favorite: any) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const dataFavorite = {
      AdUserId: userData.UserName,
      ClientName: favorite.clientName,
      GISId: favorite.gisid,
      MDMId: favorite.mdmid,
      DateAdd: null,
      DateUpdated: null
    };
    return this.getQueryPost('userfavorite/validateClient', dataFavorite).pipe(
      map((data: any) => {
        if ( data) {
            return data;
        }
      })
    );
  }

  deleteFavorite(idfavorite: any) {
    return this.getQueryPost(`userfavorite/delete/${idfavorite}`, []).pipe(
      map((data: any) => {
        if (data) {
            return true;
        }
      })
    );
  }
  getDataClient(gisId: number) {
    return this.getQuery(`UserFavorite/dataclient/${gisId}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getGISTokens(idfavorite: any) {
    return this.getQuery(`userfavorite/getGISTokens/${idfavorite}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );    
  }

}
