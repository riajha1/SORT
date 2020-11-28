import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HeaderModel,
         ConsiderationModel,
         BusinessModel,
         ConflictModel,
         IndependenceModel,
         SolutionContactModel,
         QualityContactsModel,
         IndependenceContactModel,
         BreadcrumbModel,
         ServiceModel
         } from '../../models/model.index';
import { map } from 'rxjs/operators';
import { identity } from 'rxjs';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Injectable()
export class ServiceService {
  location: Array<any>;
  serviceHeader: HeaderModel;
  serviceBusiness: BusinessModel;
  serviceConflicts: ConflictModel;
  serviceIndepende: IndependenceModel;
  serviceContactsSl: Array<SolutionContactModel>;
  serviceContactQuality: Array<QualityContactsModel>;
  serviceContactIndependece: Array<IndependenceContactModel>;
  serviceInfo: ServiceModel;
  highlight: IndependenceModel;
  breadcrumb: BreadcrumbModel;
  constructor(private http: HttpClient) {
    this.serviceHeader = new HeaderModel();
    this.serviceBusiness = new BusinessModel();
    this.serviceConflicts = new ConflictModel();
    this.serviceIndepende = new IndependenceModel();
    this.serviceContactsSl = new Array<SolutionContactModel>();
    this.serviceContactQuality = new Array<QualityContactsModel>();
    this.serviceContactIndependece = new Array<IndependenceContactModel>();
    this.highlight = new IndependenceModel();
    this.breadcrumb = new BreadcrumbModel();
    this.serviceInfo = new ServiceModel();
    this.location = [];
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
  getHeaderService(idService: number) {
      const promise = new Promise((resolve, reject) => {
        const text = `header/${idService}`;
        this.getQuery(text)
        .toPromise()
        .then(
          (res: any) => {
            let numberItem = 500;
            if (res.serviceLineCollateral !== '') {
              numberItem = numberItem - 200;
            }
            const txt = res.description + res.serviceLineCollateral;
            const onlytext = txt.replace( /(<([^>]+)>)/ig, '');
            const startPart = txt.substring(0, 500);
            const ListItemFound = startPart.match(/<li.*>/);
            const EnterFound = startPart.match(/<br.*>/);
            const paragraphFound = startPart.match(/<p.*>/);
            const parser = new DOMParser();
            const doc = parser.parseFromString(startPart, 'text/html');
            const numberOfList = doc.querySelectorAll('li').length;
            const numberOfEnter = doc.querySelectorAll('br').length;
            const numberOfparagraph = doc.querySelectorAll('p').length;
            if (ListItemFound !== null && ListItemFound.length > 0 || EnterFound !== null && EnterFound.length > 0
              || paragraphFound !== null && paragraphFound.length > 0) {
              const addItems = (numberOfList * 200) + (numberOfEnter * 200) + (numberOfparagraph * 200);
              numberItem = numberItem - addItems > 0 ? numberItem - addItems : 0;
            }

            const temp: HeaderModel = {
                title: res.serviceName,
                headline: res.headLineDescription,
                description: res.description,
                collateral: res.serviceLineCollateral,
                readmore: onlytext.length > numberItem ? true : false,
                financeText: res.financeCodeFreeText
              };

            this.serviceHeader = temp;
            resolve();
          },
          msg => {
            reject();
          });
      });
      return promise;
   }
   getBusinessContentService(idService: number) {
      const promise = new Promise((resolve, reject) => {
        const text = `businesscontent/${idService}`;
        this.getQuery(text)
        .toPromise()
        .then(
          (res: any) => {
            if (res !== null) {
              let numberItem = 300;
              const txt = res.qualityConsiderations;
              const onlytext = txt.replace( /(<([^>]+)>)/ig, '');
              const startPart = txt.substring(0, 300);
              const ListItemFound = startPart.match(/<li.*>/);
              const EnterFound = startPart.match(/<br.*>/);
              const paragraphFound = startPart.match(/<p.*>/);
              const parser = new DOMParser();
              const doc = parser.parseFromString(startPart, 'text/html');
              const numberOfList = doc.querySelectorAll('li').length;
              const numberOfEnter = doc.querySelectorAll('br').length;
              const numberOfparagraph = doc.querySelectorAll('p').length;
              if (ListItemFound !== null && ListItemFound.length > 0 || EnterFound !== null && EnterFound.length > 0
                || paragraphFound !== null && paragraphFound.length > 0) {
                const addItems = (numberOfList * 45) + (numberOfEnter * 45) + (numberOfparagraph * 45);
                numberItem = numberItem - addItems > 0 ? numberItem - addItems : 0;
            }
              const temp: BusinessModel = {
              idBusinessContent: res.idBusinessContent,
              idService: res.idService,
              guidanceEytechnology: res.guidanceEytechnology,
              qualityConsiderations: res.qualityConsiderations,
              readmoreQuality:  onlytext.length > numberItem ? true : false,
              activityGrid: res.activityGrid,
              qualityConsiderationLocal: res.qualityConsiderationLocal,
              qualityConsiderationGlobal: res.qualityConsiderationGlobal
            };
              this.serviceBusiness = temp;
            } else {
              this.serviceBusiness = null;
            }
            resolve();
          },
          msg => {
            reject();
          });
      });
      return promise;
   }
   getConflictsService(idService: number) {
    const promise = new Promise((resolve, reject) => {
      const text = `conflicts/${idService}`;
      this.getQuery(text)
      .toPromise()
      .then(
        (res: any) => {
          if (res !== null) {
            let datainfo = '';
            let input = '';
            // Conflicts considerations (Mandatory, Potentially or not required)
            const item =  res.checkRequired;
            if (item === 0) {
              input = 'never';
            } else if (item === 1) {
              input = 'always';
            } else {
              input = 'counterparty';
            }
            Object.keys(res).forEach( key => {
              if (key === input) {
                datainfo += res[key];
              }
            });
            const onlytext = datainfo.replace( /(<([^>]+)>)/ig, '');
            const temp: ConflictModel = {
               idConflicts: res.idConflicts,
               idService: res.idService,
               checkRequired: res.checkRequired,
               never: res.never,
               guidebookConflictsPage: res.guidebookConflictsPage,
               always: res.always,
               counterparty: res.counterparty,
               guidance: res.guidance,
               readmoreGuide: onlytext.length > 80 ? true : false
            };
            this.serviceConflicts = temp;
         } else {
          this.serviceConflicts = null;
         }
          resolve();
        },
        msg => {
          reject();
        });
    });
    return promise;
   }
   getIndependenceService(idService: number, countryCode: string) {
    const promise = new Promise((resolve, reject) => {
      const text = `independencerestrictions/${idService}/${countryCode}`;
      this.getQuery(text)
      .toPromise()
      .then(
        (res: any) => {
          this.serviceIndepende = res;
          resolve();
        },
        msg => {
          reject();
        });
    });
    return promise;
   }
   getContactSolutionService(idService: number,countrycode:string) {
    const promise = new Promise((resolve, reject) => {
      const text = `contact/solutionCountry/${idService}/${countrycode}`;
      this.getQuery(text)
      .toPromise()
      .then(
        (res: any) => {
          const result = JSON.parse(res.value);
          console.log('result',result);
          const contacts: Array<SolutionContactModel> = [];
          result.map(e => {
            const temp: SolutionContactModel = {
              idSolutionContacts: e.IdSolutionContacts,
              idContacts: e.IdContacts,
              name: e.Name,
              title: e.Title,
              mail: e.Mail,
              url: e.Url,
              location: e.Location,
              countryCode: e.CountryCode,
              region:e.Region,
              order:e.Order,
              profileUrl:e.ProfilePictureUrl
              };
            contacts.push(temp);
          });
          this.serviceContactsSl = contacts;
          resolve();
        },
        msg => {
          reject();
        });
    });
    return promise;
   }
   getContactQualityService(idService: number,countrycode:string) {
    const promise = new Promise((resolve, reject) => {
      const text = `contact/qualitycountry/${idService}/${countrycode}`;
      this.getQuery(text)
      .toPromise()
      .then(
        (res: any) => {
          const result = JSON.parse(res.value);
          const contacts: Array<QualityContactsModel> = [];
          result.map(e => {
            const temp: QualityContactsModel = {
              idQualityContacts: e.IdQualityContacts,
              idContacts: e.IdContacts,
              name: e.Name,
              title: e.Title,
              mail: e.Mail,
              url: e.Url,
              location: e.Location,
              countryCode: e.CountryCode,
              region:e.Region,
              order:e.Order,
              profileUrl:e.ProfilePictureUrl
              };
            contacts.push(temp);
          });
          this.serviceContactQuality = contacts;
          resolve();
        },
        msg => {
          reject();
        });
    });
    return promise;
   }
   getContactIndependeceService(idService: number) {
    const promise = new Promise((resolve, reject) => {
      const text = `contact/independence/${idService}`;
      this.getQuery(text)
      .toPromise()
      .then(
        (res: Array<IndependenceContactModel>) => {
          const contacts: Array<IndependenceContactModel> = [];
          if (res instanceof Array) {
            res.map(e => {
              const temp: IndependenceContactModel = {
                idIndependenceContacts: e.idIndependenceContacts,
                idContacts: e.idContacts,
                name: e.name,
                title: e.title,
                mail: e.mail,
                url: e.url,
                location: e.location
                };
              contacts.push(temp);
            });
          }
          this.serviceContactIndependece = contacts;
          resolve();
        },
        msg => {
          reject();
        });
    });
    return promise;
   }
   getIsqmService(idService: number) {
    const text = `isqm/${idService}`;
    return this.getQuery(text).pipe(map((data: any) => {
      if (data.value !== null) {
        return JSON.parse(data.value);
      } else {
        return [];
      }
    }));
   }
   getHighligthService(idService: number) {
    const promise = new Promise((resolve, reject) => {
      const text = `independencerestrictions/highlight/${idService}`;
      this.getQuery(text)
      .toPromise()
      .then(
        (res: any) => {
          this.highlight = res;
          resolve();
        },
        msg => {
          reject();
        });
    });
    return promise;
   }
   getBreadcrumbByService(idService: number) {
    const promise = new Promise((resolve, reject) => {
      const text = `servicefilter/filtername/${idService}`;
      this.getQuery(text)
      .toPromise()
      .then(
        (res: any) => {
          const competency = [];
          const ssl = [];
          const sslshort = [];
          const solution = [];
          const sector = [];
          const client = [];
          const sl = [];
          const filter = [];
          res.map( item => {
            if ( item.serviceLineName && !sl.find(e => e === item.serviceLineName)) {
              sl.push(item.serviceLineName);
             }
            if ( item.competencyDomainName && !competency.find(e => e === item.competencyDomainName)) {
                 competency.push(item.competencyDomainName);
                }
            if ( item.subServiceLineName && !ssl.find(e => e === item.subServiceLineName) ) {
              const position = item.subServiceLineName.indexOf('-') + 1;
              const splitlabel = item.subServiceLineName.substring(position);
              sslshort.push(splitlabel.trim());
              ssl.push(item.subServiceLineName);
            }
            if ( item.solutionName && !solution.find(e => e === item.solutionName)) {
              solution.push(item.solutionName);
            }
            if ( item.fieldOfPlayName && !filter.find(e => e === item.fieldOfPlayName)) {
              filter.push(item.fieldOfPlayName);
            }
            if ( item.sectorName && !sector.find(e => e === item.sectorName) ) {
              sector.push(item.sectorName);
            }
            if ( item.clientNeedName && !client.find(e => e === item.clientNeedName) ) {
              client.push(item.clientNeedName);
            }
          });
          const temp = {
            sl,
            competency,
            ssl,
            sslshort,
            solution,
            sector,
            client,
            filter,
          };
          this.breadcrumb = temp;
          resolve();
        },
        msg => {
          reject();
        });
    });
    return promise;
   }
   getLocationOffering(idService: number) {
    const text = `locationsoffered/${idService}`;
    return this.getQuery(text).pipe(
      map((data: any) => {
        const parseData = JSON.parse(data.value);
        const temp = [];
        parseData.map(item => {
          temp.push(item);
        });
        this.location = temp;
        return this.location;
        })
    );
  }


  getDateUpdatedService(idService: number) {
    const text = `service/getService/${idService}`;
    return this.getQuery(text).pipe(
      map((data: any) => {
        const parseData = JSON.parse(data.value);
        let date = '';
        if (parseData.ModificationDate) {
          date = parseData.ModificationDate;
        }
        return date;
        })
    );
  }
  getCountryConsideration(idService: number, countryCode: string) {
    const text = `countryConsiderations/${idService}/${countryCode}`;
    return this.getQuery(text).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getGfis(idService: number, countryCode) {
    const text = `validateGfis/${countryCode}/${idService}`;
    return this.getQuery(text).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getAllGfis() {
    return this.getQuery('gfis').pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getMercury(idService: number) {
    const text = `mercury/${idService}`;
    return this.getQuery(text).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getAllMercury() {
    return this.getQuery('mercury').pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getValidateMercury(temp: any) {
    return this.getQueryPost('mercury/validateMercury', temp).pipe(map((res: any) => JSON.parse(res.value)));
  }
  getConsiderationService(idService: number) {
    return this.getQuery(`independenceConsiderations/${idService}`).pipe(
      map((data: any) => {
        const res = JSON.parse(data.value);
        const considerationsArray: Array<ConsiderationModel> = [];
        res.map(e => {
          const onlytext1 = e.GeneralPrinciples.replace( /(<([^>]+)>)/ig, '');
          const onlytext2 = e.SpecificConsiderations.replace( /(<([^>]+)>)/ig, '');
          const temp: any = {
              idIndependence: e.IdIndependence,
              IdService: e.IdService,
              IndependenceName: e.IndependenceName,
              GeneralPrinciples: e.GeneralPrinciples,
              SpecificConsiderations: e.SpecificConsiderations,
              readmore1: onlytext1.length > 300 ? true : false,
              readmore2: onlytext2.length > 300 ? true : false,
              order: e.Order
            };
          considerationsArray.push(temp);
        });
        return considerationsArray;
      })
    );
  }
  getStandardText() {
    const text = `standardtext`;
    return this.getQuery(text).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getEyTechnology(idService: number) {
    return this.getQuery(`technologyGuidance/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getServiceNameValidator( temp: any) {
    return this.getQueryPost('service/validation', temp).pipe(map(res => res));
  }

  getServiceLineByCountryCode(countryCode, idService) {
    const text = `qualitycountry/${idService}/${countryCode}`;
    return this.getQuery(text).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  fetchProgressBar(idService, progress) {
    const temp = {
      ServiceDetails: progress[0].progress.toString(),
      LocationsOffered: '0',
      BusinessContacts: '0',
      Eytechnology: '0',
      ServiceLineGuidance: '0',
      QualityContacts: '0',
      IndependencePermissibility: '0',
      ConflictsConsiderations: '0',
      independenceConsiderations : '0',
      Other: '0',
      idservice: idService
    };
    return this.getQueryPost('serviceprogressindicator/create', temp).pipe(map(res => res));
  }
  updateProgressBar(idService, progress, idProgress) {
    const temp = {
      id: parseInt(idProgress, 10),
      ServiceDetails: '0',
      LocationsOffered: '0',
      BusinessContacts: '0',
      Eytechnology: '0',
      ServiceLineGuidance: '0',
      QualityContacts: '0',
      IndependencePermissibility: '0',
      ConflictsConsiderations: '0',
      independenceConsiderations : '0',
      Other: '0',
      idservice: idService
    };
    temp.ServiceDetails = progress[0].progress.toString();
    temp.LocationsOffered = progress[1].progress.toString();
    temp.BusinessContacts = progress[2].progress.toString();
    temp.Eytechnology = progress[3].progress.toString();
    temp.ServiceLineGuidance = progress[4].progress.toString();
    temp.QualityContacts = progress[5].progress.toString();
    temp.IndependencePermissibility = progress[6].progress.toString();
    temp.independenceConsiderations = progress[7].progress.toString();
    temp.ConflictsConsiderations = progress[8].progress.toString();
    temp.Other = progress[9].progress.toString();
    return this.getQueryPost('serviceprogressindicator/update', temp).pipe(map(res => res));
  }
  getPublishedlocations(idService) {
    return this.getQuery(`publish/getlocals/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getProgressBarById(idService) {
    return this.getQuery(`ServiceProgressIndicator/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getServiceDetailById(idService) {
    return this.getQuery(`InProcess/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getLocationById(idService) {
    return this.getQuery(`InProcess/locations/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getBusinessContactById(idService) {
    return this.getQuery(`InProcess/businessContacts/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getQualityContactById(idService) {
    return this.getQuery(`InProcess/qualityContacts/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getEyTechnologyById(idService) {
    return this.getQuery(`InProcess/technologyGuidance/${idService}`).pipe(
      map((data: any) => {
        const res = JSON.parse(data.value);
        let TechnologiesTools = [];
        const EYGuidanceTechnology = res.GuidanceEYTechnology === null ? '' : res.GuidanceEYTechnology;
        if (res.TechnologyGuidances.length > 0) {
          TechnologiesTools = res.TechnologyGuidances.map(item => ({
            IdService: item.IdService,
            TechnologyName: item.TechnologyName === null || item.TechnologyName === '' ? '' : item.TechnologyName,
            TechnologyDescription: item.TechnologyDescription === null || item.TechnologyDescription === '' ? '' : item.TechnologyDescription,
            DeepLink: item.DeepLink === null || item.DeepLink === '' ? '' : item.DeepLink
          }));
        }
        return {EYGuidanceTechnology, TechnologiesTools};
      })
    );
  }
  getGuidanceById(idService) {
    return this.getQuery(`InProcess/serviceLineGuidance/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getPermissibilityById(idService) {
    return this.getQuery(`InProcess/getIndependencePermissibility/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getIndependenceConsiderationById(idService) {
    return this.getQuery(`InProcess/getIndependenceConsiderations/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getConflictById(idService) {
    return this.getQuery(`InProcess/getConflicts/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  getOtherById(idService) {
    return this.getQuery(`InProcess/getOther/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }
  publishService(obj) {
    return this.getQueryPost('publish/insert', obj).pipe(map(res => res));
  }

  validateServiceVersion(idService) {
    return this.getQuery(`InProcess/ValidateVersion/${idService}`).pipe(
      map((data: any) => data)
    );
  }

  validateServiceUrl(idService) {
    return this.getQuery(`Service/ValidateServiceUrl/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }

  validateServiceUrlSam(idService) {
    return this.getQuery(`Service/ValidateServiceUrlSam/${idService}`).pipe(
      map((data: any) => JSON.parse(data.value))
    );
  }

  async getServiceByIdParentVersion(idService, version) {
    const promise = new Promise<any>((resolve, reject) => {
    this.getQuery(`Service/GetServiceByIdParentVersion/${idService}/${version}`)
    .toPromise()
    .then(
    (res: any) => {
      this.serviceInfo = JSON.parse(res.value);
      resolve();
    },
    msg => {
      reject();
    });
  });
    return await promise;
  }
}
