import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';

import { map } from 'rxjs/internal/operators/map';
import { ServiceInventoryModel } from '../../models/model.index';
import { Subject } from 'rxjs';
import { ServiceInventoryReportFilterModel } from '../../models/model/ServiceInventoryReportFilterModel';

@Injectable()
export class ServiceInventoryReport {

  selectedColumn: ServiceInventoryModel[] = [];
  selectedColumnChanged = new Subject<any>();

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

  getQueryPost(query: string, data) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    return this.http.post(url, data);
  }

  getOriginOfService() { // returns orgin of service data
    return this.getQuery('OriginOfService').pipe(map((res: any) => JSON.parse(res.value)));
  }

  getServiceline() { // returns service line data
    return this.getQuery('serviceline').pipe(map(res => res));
  }

  getSubServiceLine() { // returns sub service line data
    return this.getQuery('SubServiceLine').pipe(map(res => res));
  }

  getCompetencyDomain() { // returns competency data
    return this.getQuery('CompetencyDomain').pipe(map(res => res));
  }

  getSubserviceLineByServiceLineIntake(slCode: string) {
    const text = `SubServiceLine/${slCode}`;
    return this.getQuery(text).pipe(
      map((data: any) => {
        const subServiceLines = [];
        data.map(element => {
          const position = element.subServiceLineName.indexOf('-') + 1;
          element.subServiceLineName.replace('-', '');
          const splitlabel = element.subServiceLineName.substring(position);
          element.subServiceLineName = splitlabel;
          subServiceLines.push(element);
        });
        return subServiceLines;
      }));
  }

  getCompetencyDomainBySubServiceCode(sslCode: string) {
    const text = `CompetencyDomain/${sslCode}`;
    return this.getQuery(text).pipe(
      map(res => {
        return res;
      }));
  }

  getServiceInventoryReport(serviceInventoryReportFilterModel: ServiceInventoryReportFilterModel ) {
    return this.getQueryPost('ServiceInventoryReport/GetServiceInventoryReport', serviceInventoryReportFilterModel).pipe(map(res => res));
  }

  saveSelectedColumn(selectedColumn: ServiceInventoryModel[]) {
    this.selectedColumn = selectedColumn;
    this.selectedColumnChanged.next(this.selectedColumn);
  }
}
