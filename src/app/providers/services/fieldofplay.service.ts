import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/internal/operators/map';
import { FieldOfPlayModel } from '../../models/model.index';
import { Subject } from 'rxjs/internal/Subject';
import { tap } from 'rxjs/internal/operators/tap';
import { FieldOfPlayFilter } from 'src/app/models/model.index';

@Injectable()
export class FieldOfPlayService {
  fieldofplayChanged = new Subject<FieldOfPlayFilter[]>();
  public fieldofplay: FieldOfPlayFilter[] = [];
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

    getfieldofplay() {
      return this.getQuery('FieldOfPlay').pipe(
        map((res: any) => JSON.parse(res.value))
      );
    }
    fetchFieldofplay() {
      return this.getQuery('FieldOfPlay').pipe(
        map((res: any) => {
          const result = JSON.parse(res.value);
          return result
          .map(e => ({
              id : 'FOP' + e.IdFop,
              label : e.FopName,
              selected: false
            })
          );
        }),
        tap(res => this.setFOP(res))
      );
    }
    setFOP(fop: FieldOfPlayFilter[]) {
      this.fieldofplay = fop;
      this.fieldofplayChanged.next(this.fieldofplay);
    }
    getOriginOfService() {
      return this.getQuery('OriginOfService').pipe(
        map((res: any) => JSON.parse(res.value))
      );
    }
}

