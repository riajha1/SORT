import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { PreviewService, AutocompleteService } from '../../models/model.index';

import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { Subject } from 'rxjs/internal/Subject';
import { map } from 'rxjs/internal/operators/map';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  servicesChanged = new Subject<PreviewService[]>();
  servicesAutocompleteChanged = new Subject<AutocompleteService[]>();
  independencePermissibilityByUserChanged = new Subject<any>();
  allpermissibilityPerServiceChanged = new Subject<any>();
  matchFiltertChanged = new Subject<any>();
  enableHttpServiceChanged = new Subject<any>();

  allpermissibilityPerService = [];
  enableHttpService = '';
  independencePermissibilityByUser = [];
  public services: PreviewService[] = [];
  public servicesAutocomplete: AutocompleteService[] = [];
  public matchFilter: { word: any; fuzziness: number; serviceLineName: any; client: string; countryCode: string };


  constructor(private http: HttpClient) {}
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
  // List of services - Use to display all cards in browser offering
  fetchServices(countryCode) {
    this.setServices([]);
    return this.getQuery(`ServiceFilter/countryCode/${countryCode}`).pipe(
      map((data: any) => {
        const result = JSON.parse(data.value);
        const GroupedByService = this.groupBy(result, 'IdService');
        const AllPreviewServices = [];
        GroupedByService.map((item) => {
          const lastItem = item.length - 1;
          const b1 = _.unionBy(item, 'IdCompetencyDomain').map(e => e.IdCompetencyDomain);
          const b2 = _.unionBy(item, 'IdSector').map(e => e.IdSector);
          const b3 = _.unionBy(item, 'IdClientNeed').map(e => e.IdClientNeed);
          const b4 = _.unionBy(item, 'IdSolution').map(e => e.IdSolution);
          const b5 = _.unionBy(item, 'IdSubServiceCode').map(e => e.IdSubServiceCode);
          const b6 = _.unionBy(item, 'ServiceLineCode').map(e => e.ServiceLineCode);
          const b7 = _.unionBy(item, 'IdFop').map(e => e.IdFop);
          item[lastItem].IdSector = b2.length > 0 ? b2[0] === null ? [] : b2 : [];
          item[lastItem].IdClientNeed = b3.length > 0 ? b3[0] === null ? [] : b3 : [];
          item[lastItem].IdCompetencyDomain = b1.length > 0 ? b1[0] === null ? [] : b1 : [];
          item[lastItem].IdSolution = b4.length > 0 ? b4[0] === null ? [] : b4 : [];
          item[lastItem].IdSubServiceCode = b5.length > 0 ? b5[0] === null ? [] : b5 : [];
          item[lastItem].ServiceLineCode = b6.length > 0 ? b6[0] === null ? [] : b6 : [];
          item[lastItem].IdFop = b7.length > 0 ? b7[0] === null ? [] : b7 : [];
          item[lastItem].disable = false;
          AllPreviewServices.push(item[lastItem]);
        });
        // console.log('allpreview', AllPreviewServices);
        return AllPreviewServices;
      }),
      tap(data => {
          this.setServices(data);
      })
    );
  }
  // List of services - Use to store and show result in autocomplete
  fetchAllServices() {
    return this.getQuery(`service`).pipe(
      map((data: any) => {
        const res = JSON.parse(data.value);
        let allServices = [];
        if (res.length > 0) {
          allServices = res.map(e => ({
            idService: e.IdService,
            name: e.Name,
            prefix: e.ServiceLinePrefix
          }));
        }
        return allServices;
      }),
      tap(data => {
          this.setAllServices(data);
      })
    );
  }
  fetchAllServicesByUser() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const user = userData.UserName.replace('\\', '%5C');
    return this.getQuery('userviewed/' + user).pipe(
      map((data: any) => {
        // let sortServices = [];
        const res = JSON.parse(data.value);
        // let currentViewed = 0;
        // res.map((item, index) => {
        //   if ( currentViewed === 0) {
        //     sortServices.push(item);
        //     currentViewed = item.Viewed;
        //   } else {
        //     currentViewed = item.Viewed;
        //     let sameViewed  = sortServices.filter( item2 => item2.Viewed === currentViewed);
        //     if ( sameViewed.length === 0) {
        //       sortServices.push(item);
        //       currentViewed = item.Viewed;
        //     } else {
        //       sameViewed.push(item);
        //       sameViewed = sameViewed.sort((item1, item2) => {
        //         if (item1.ServiceLine > item2.ServiceLine) {
        //           return 1;
        //         } else if (item1.ServiceLine < item2.ServiceLine) {
        //           return -1;
        //         }
        //         return 0;
        //       });
        //       const currentSL = item.ServiceLine;
        //       let viewedsl = sameViewed.filter(item2 => item2.ServiceLine === currentSL );
        //       if (viewedsl.length === 0) {
        //         sortServices = sortServices.filter(item3 => item3.Viewed !== currentViewed );
        //         sameViewed.map(item3 => {
        //           sortServices.push(item3);
        //          });
        //       } else {
        //         viewedsl = viewedsl.sort((item1, item2) => {
        //           if (item1.SubServiceLine[0] > item2.SubServiceLine[0]) {
        //             return 1;
        //           } else if (item1.SubServiceLine[0] < item2.SubServiceLine[0]) {
        //             return -1;
        //           }
        //           return 0;
        //         });
        //         if ( viewedsl.length === 1) {
        //            if (viewedsl[0].IdService === item.IdService) {
        //              sortServices = sortServices.filter(item3 => item3.Viewed !== currentViewed );
        //              sameViewed.map(item3 => {
        //               sortServices.push(item3);
        //              });
        //            }
        //         } else {
        //           const currentSSL = item.SubServiceLine[0];
        //           let viewedslssl = viewedsl.filter(item4 => item4.SubServiceLine[0] === currentSSL );
        //           if (viewedslssl.length === 0) {
        //             const positionsl = sortServices.map(u => u.ServiceLine).indexOf(currentSL);
        //             sortServices = sortServices.filter(item3 => item3.ServiceLine !== currentSL );
        //             viewedsl.map((item5, i) => sortServices.splice(positionsl + i, 0, item5));
        //           } else {
        //             if ( viewedslssl.length === 1) {
        //               if (viewedslssl[0].IdService === item.IdService) {
        //                   const positionsl = sortServices.map(u => u.ServiceLine).indexOf(currentSL);
        //                   sortServices = sortServices.filter(item3 => item3.ServiceLine !== currentSL );
        //                   viewedsl.map((item5, i) => sortServices.splice(positionsl + i, 0, item5));
        //               }
        //             } else {
        //               viewedslssl = viewedslssl.sort((a, b) => {
        //                 if (a.Name > b.Name) {
        //                   return 1;
        //                 } else if (a.Name < b.Name) {
        //                   return -1;
        //                 }
        //                 return 0;
        //               });
        //               const positionssl = sortServices.map(u => u.SubServiceLine[0]).indexOf(currentSSL);
        //               sortServices = sortServices.filter(item3 => item3.SubServiceLine[0] !== currentSSL );
        //               viewedslssl.map((item6, i) => sortServices.splice(positionssl + i, 0, item6));
        //             }
        //           }
        //         }
        //       }
        //     }
        //   }
        // });
        return res;
      }));
  }
  fetchAllPermissibility(countryCode){
    this.setAllPermissibility([]);
    return this.getQuery(`independenceRestrictions/publishedCountry/` + countryCode).pipe(
      map((data: any) => {
        const res = JSON.parse(data.value);
        // console.log('pure', res);
        this.setAllPermissibility(res);
        this.fetchAllServicesByIndependenceRestrictions();
      })
    );
  }

  fetchAllServicesByIndependenceRestrictions() {
     // console.log('start', new Date().getTime());
    if (this.services.length > 0 && this.allpermissibilityPerService.length > 0) {
      const restrictionsServices = [];
      this.allpermissibilityPerService.filter(e => e.Gisid === null).map(item => {
      const temp: any = {};
      _.forOwn(item, (value: string, key: string) => {
        if (key.search('Value') !== -1) {
          if (key === 'EuAuditedNoValuationValue') {
            const replace = item['EusubjectValue'];
            temp[key.slice(0, -5)] = value === null || value === '' ? replace : value;
          } else {
            temp[key.slice(0, -5)] = value === null ? '' : value;
          }
        } else if (key === 'ServiceLineCode') {
          temp.ServiceLineCode = value;
        }
      });
      const b: any = this.services.filter(element => element.IdService === item.IdService);
      if (b.length > 0) {
        b[0].independenceRestrictions = temp;
        b[0].mercury = item.MercuryCodesCountries;
        b[0].gfis = item.Gfiscodes;
        b[0].pacemodel = item.PaceModel;
        restrictionsServices.push(b[0]);
      }
    });
      this.setServices(restrictionsServices);
    } else {
      // console.log('ciene algo vacio', this.services.length);
      // console.log('allpermissibilityPerService', this.allpermissibilityPerService.length);
    }
  }

  fetchAllServicesByIndependenceRestrictionsToken(CountryCode , Tokens) {
    const obj = {
      CountryCode,
      Tokens
    };
    console.log('data token', obj);
    this.setAllPermissibility([]);
    return this.getQueryPost(`CountryOverrideGIS/publishedCountry`, obj).pipe(
      map((data: any) => {
        const res = JSON.parse(data.value);
        this.setAllPermissibility(res);
        this.fetchAllServicesByIndependenceRestrictions();
      })
    );

 }

  fuzzySearch(data) {
    if (!data.word.trim()) {
      return [];
    }
    const services = this.getQueryPost('fuzzysearch', data)
      .pipe(
        tap(
           _ => {}//console.log(`Found services "${data.word}"`)
          ),
        map(
          (res: any) => {
            if (res.successfull) {
              const result = JSON.parse(res.value);
              const GroupedByService = this.groupBy(result, 'Id');
              const resultServices = {
                ordinary: [],
                codeElement: []
              };
              GroupedByService.map((element, index) => {
            const codeElements = [];
            const ordinaryElements = [];
            let iterations = 0;
            element.map(el => {
              iterations += 1;
               // /(^\d{2,})/i validate start with two numbers
              const expresion = /(^\d{1,})/i; // Find if start by numbers
              const findCode = el.Text.match(expresion);
              if (findCode != null) {
                codeElements.push(el);
              } else {
                const exist = ordinaryElements.find(e => e.Id === index);
                if (exist === undefined) {
                  ordinaryElements.push(el);
                }
              }
              if (iterations === element.length) {
                if (ordinaryElements.length > 0) {
                  resultServices.ordinary.push(ordinaryElements);
                }
                if (codeElements.length > 0) {
                  resultServices.codeElement.push(codeElements);
                }
              }
            });
          });
              return resultServices;
            } else {
              return [];
            }
          }),
          catchError(this.handleError<[any[], any[]]>('searchPersonnels', [[], []])
        )
      );
    return services;
  }
  // List of idservice matching  with fuzzy - show card browser
FuzzySearchServices(data) {
    return this.getQueryPost('fuzzysearch', data).pipe(
      map((res: any) => {
        const result = JSON.parse(res.value);
        const GroupedByService = this.groupBy(result, 'Id');
        const Allresult = [];
        GroupedByService.map((element, index) => {
          Allresult.push(index);
        });
        return Allresult;
      }));
  }
setServices(services: PreviewService[]) {
    this.services = services;
    this.servicesChanged.next(this.services);
  }
  setPermissibilitySelectedByUser(i) {
    const exist = this.independencePermissibilityByUser.filter(e => e === i);
    if (exist.length > 0) {
      this.independencePermissibilityByUser = this.independencePermissibilityByUser.filter(e => e !== i);
    } else {
      this.independencePermissibilityByUser.push(i);
    }
    this.independencePermissibilityByUser = this.independencePermissibilityByUser;
    this.independencePermissibilityByUserChanged.next(this.independencePermissibilityByUser);
  }
  setenableHttp(status) {
    this.enableHttpService = status;
    this.enableHttpServiceChanged.next(status);
  }
  setAllPermissibility(permissibility) {
    this.allpermissibilityPerService = permissibility;
    this.allpermissibilityPerServiceChanged.next(permissibility);
  }
setAllServices(services: AutocompleteService[]) {
    this.servicesAutocomplete = services;
    this.servicesAutocompleteChanged.next(this.servicesAutocomplete);
  }
setMatchFilter(result) {
  this.matchFilter = result;
  this.matchFiltertChanged.next(this.matchFilter);
  }
  removeIndependencePermissibilityByUser(){
    this.independencePermissibilityByUser = [];
    this.independencePermissibilityByUserChanged.next(this.independencePermissibilityByUser);
  }
removeMatchFilter() {
    const matchFilter = {
      word: '',
      fuzziness: 0.9999,
      serviceLineName: [],
      countryCode: ''
   };
    this.setMatchFilter(matchFilter);
  }
  // get request
  getAllServices = () =>  this.servicesAutocomplete;

  // List of all service saved in database
  fetchCompleteListOfService = () => this.getQuery('service/allservices').pipe(map(res => res));

  // Accepts the array and key
  groupBy = (array, key) => {
    // Return the end result
    return array.reduce((result, currentValue) => {
      // If an array already present for key, push it to the array. Else create an array and push the object
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
      return result;
    }, []); // empty object is the initial value for result object
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
