import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class ContactService {
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
    getQueryPost(query: string, data) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
        Autorization: 'Bearer jsdhkasdj'
    });
    return this.http.post(url, data);
    }
    addBusinessContact(contacts: any) {
        return this.getQueryPost('insertservice/insertBusinessContacts', contacts).pipe(map(res => res));
    }
    addQualityIndependenceContact(contacts: any) {
    return this.getQueryPost('insertservice/insertQualityContacts', contacts).pipe(map(res => res));
    }
    fuzzySearchContact(string: any) {
        const temp = {
            text: string
        }
     return this.getQuery('FuzzySearch/searchuser/'+ string).pipe(map(res => res));
    }
}
