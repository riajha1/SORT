import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject } from 'rxjs/internal/Subject';
import { map } from 'rxjs/internal/operators/map';
import { tap } from 'rxjs/internal/operators/tap';

@Injectable()
export class CountriesService {
  countryListChanged = new Subject<any[]>();
  public countryList: any = {};
  Areas = [
    { countryCode: 'ARG', area: 'Americas' },
    { countryCode: 'FRA', area: 'EMEIA' },
    { countryCode: 'JPN', area: 'Asia Pacific' }
  ];
  Region = [
    { countryCode: 'BHS', region: 'BBC' },
    { countryCode: 'CAN', region: 'Canada' },
    { countryCode: 'JAM', region: 'EYC' },
    { countryCode: 'ISR', region: 'Israel' },
    { countryCode: 'COL', region: 'LAN' },
    { countryCode: 'ARG', region: 'LAS' },
    { countryCode: 'USA', region: 'US' },
    { countryCode: 'ZAF', region: 'Africa' },
    { countryCode: 'GRC', region: 'CESA' },
    { countryCode: 'DEU', region: 'GSA' },
    { countryCode: 'IND', region: 'India' },
    { countryCode: 'PRT', region: 'Mediterranean' },
    { countryCode: 'EGY', region: 'MENA' },
    { countryCode: 'FIN', region: 'Nordics' },
    { countryCode: 'GBR', region: 'UK&I' },
    { countryCode: 'GIN', region: 'WEM' },
    { countryCode: 'IDN', region: 'ASEAN' },
    { countryCode: 'CHN', region: 'Greater China' },
    { countryCode: 'KOR', region: 'Korea' },
    { countryCode: 'NZL', region: 'Oceania' },
    { countryCode: 'JPN', region: 'Japan' }
  ];

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

  fetchCountries() {
    return this.getQuery('country').pipe(
      map(data => {
        if (data instanceof Array) {
          const america = [];
          const emeia = [];
          const asia = [];
          const all = [];
          data.map(e => {
            e.name = e.countryName;
            e.selected = false;
            all.push(e);
            switch (e.area) {
              case 'EMEIA':
                emeia.push(e);
                break;
              case 'Americas':
                america.push(e);
                break;
              case 'Asia Pacific':
                asia.push(e);
                break;
            }
          });
          return {
            america,
            emeia,
            asia,
            all
          };
        }
        return [];
      }),
      tap(data => {
        this.setCountry(data);
      })
    );
  }

  setCountry(countries: any) {
    this.countryList = countries;
    this.countryListChanged.next(this.countryList);
  }
  getCountryList() {
    return this.countryList;
  }
  insertLocationByService(locations: any) {
    return this.getQueryPost('insertservice/insertLocations', locations).pipe(map(res => res));
  }
  overridePermissibility(IdService, Tokens){
    const obj = {
      IdService: parseInt(IdService, 10),
      Tokens
    };
    return this.getQueryPost(`CountryOverrideGIS`, obj).pipe(
      map((data: any) => {
        const result =  JSON.parse(data.value);
        if (result.length > 0) {
          return result.map(e => ({column: e.ColumnName, value: e.ColumnValue}));
        } else {
          return ({column: '', value: ''});
        }
      })
    );
  }

  getCountriesByRegion(region: string) {
    return this.getQuery(`Country/GetCountriesByRegion/` + region).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }

  isServiceOfferedInCountry(countryCode: string, idService: string) {
    var SortServiceLocal = { CountryCode: countryCode, IdService: idService }; 
    return this.getQueryPost(`Country/IsServiceOfferedInCountry/`, SortServiceLocal).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
}
