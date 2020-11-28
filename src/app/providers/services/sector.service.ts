import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';

import { SectorFilter } from '../../models/model.index';

import { map } from 'rxjs/internal/operators/map';
import { tap } from 'rxjs/internal/operators/tap';
import { Subject } from 'rxjs/internal/Subject';

@Injectable()
export class SectorService {
  sectorChanged = new Subject<SectorFilter[]>();
  public sector: SectorFilter[] = [];
  constructor(private http: HttpClient) {
  }
  getQuery(query: string) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    // return this.http.get(url, { headers});
    return this.http.get(url);
  }
  fetchSector() {
    return this.getQuery(`sector`).pipe(
      map((data: any) => {
        const tempSector = [];
        data.map(e => {
          const temp: SectorFilter = {
            id: 'SE' + e.idSector,
            label: e.sectorName,
            selected: false
          };
          tempSector.push(temp);
        });
        return tempSector;
      }),
      tap(data => {
          this.setSector(data);
      })
    );
  }
  getSector() {
    return this.getQuery('sector').pipe(map(res => res));
  }
  setSector(sector: SectorFilter[]) {
    this.sector = sector;
    this.sectorChanged.next(this.sector);
  }
}
