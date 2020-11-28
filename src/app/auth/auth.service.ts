import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/internal/operators/map';
import { take } from 'rxjs/internal/operators/take';
import { UserService, FavoritesService } from 'src/app/providers/provider.index';
@Injectable({
    providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private userService: UserService, private favoritesService: FavoritesService ) { }
    getQuery(query: string) {
        const url = environment.apiUrl + query;
        const headers = new HttpHeaders({
          Autorization: 'Bearer jsdhkasdj'
        });
        // return this.http.get(url, { headers});
        return this.http.get(url);
      }
      getAuthentication() {
        console.log('getAuthentication');
        return this.getQuery('user').pipe(
          take(1),
          map((res: any) => {
            if (res.successfull && res.message === 'OK') {
              const result =  JSON.parse(res.value);
              const expiresIn = result.SessionTime !== null ? result.SessionTime : 3600; // if the system doesn't have a defined time, I set with 3600 second
              const expirationDate = new Date(new Date().getTime() + expiresIn * 1000).getTime(); // expiresIn came in second and the date use miliseconds
              const Data = {...result, expirationDate};
              // Authentication doesn't exist - Store location and share with all components
              this.userService.saveCountry(result.CountryCode);
              this.userService.saveUserFullName(result.UserFullName);
              this.userService.saveuserLoginStatus(true);
              this.userService.saveSessionTime(result.SessionTime);
              this.userService.saveIdleTime(result.IdleTime);
              localStorage.setItem('userData', JSON.stringify(Data)); // store in local storage
              const countryStorage = JSON.parse(localStorage.getItem('locationSelected'));
              if (countryStorage === null) {
                localStorage.setItem('locationSelected', JSON.stringify(Data.CountryCode));
              }

              return Data;
            } else {
              console.log('Error to get the authentication');
              return {};
            }
          }));
      }
      refreshSession() {
        console.log('refreshSession');
        return this.getQuery('user').pipe(
          take(1),
          map((res: any) => {
            if (res.successfull && res.message === 'OK') {
              const result =  JSON.parse(res.value);
              const expiresIn = result.SessionTime !== null ? result.SessionTime : 3600; // if the system doesn't have a defined time, I set with 3600 second
              const expirationDate = new Date(new Date().getTime() + expiresIn * 1000).getTime(); // expiresIn came in second and the date use miliseconds
              const Data = {...result, expirationDate};
              localStorage.setItem('userData', JSON.stringify(Data)); // store in session storage
              return Data;
            } else {
              console.log('Error to get the authentication');
              return {};
            }
          }));
      }
      validateToken() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData !== null) {
          if (!userData.expirationDate || new Date().getTime() > userData.expirationDate) {
            return null;
          }
          return  userData.Id;
        }
        return null;
      }

  impersonateUser(email: string) {
    return this.getQuery(`user/impersonateUser/${email}`).pipe(
      take(1),
      map((res: any) => {
        if (res.successfull && res.message === 'OK') {
          const result = JSON.parse(res.value);
          const expiresIn = result.SessionTime !== null ? result.SessionTime : 3600; // if the system doesn't have a defined time, I set with 3600 second
          const expirationDate = new Date(new Date().getTime() + expiresIn * 1000).getTime(); // expiresIn came in second and the date use miliseconds
          const Data = { ...result, expirationDate };
          // Authentication doesn't exist - Store location and share with all components
          this.userService.saveCountry(result.CountryCode);
          this.userService.saveUserFullName(result.UserFullName);
          this.favoritesService.setFavorites([]);
          this.userService.saveuserLoginStatus(true);
          localStorage.setItem('userData', JSON.stringify(Data)); // store in local storage
          return Data;
        } else {
          console.log('Error to get the authentication');
          return res.message;
        }
      }));
  }
}
