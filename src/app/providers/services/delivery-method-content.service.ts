import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import {  DeliveryModel, ConflictsDeliveryMethodModel } from '../../models/model.index';
import { map } from 'rxjs/internal/operators/map';

@Injectable()
export class DeliveryMethodContentService {
  totalDeliveryItems = 0;
  deliveryMethodContents: any;
  serviceDelivery: Array<DeliveryModel>;
  conflictDelivery: Array<ConflictsDeliveryMethodModel>;
  constructor(private http: HttpClient) {
    this.deliveryMethodContents = [];
    this.serviceDelivery = new Array<DeliveryModel>();
    this.conflictDelivery = new Array<ConflictsDeliveryMethodModel>();
  }
  getQuery(query: string) {
    const url = environment.apiUrl + query;
    return this.http.get(url);
  }
  getQueryPost(query: string, data) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    return this.http.post(url, data);
  }
  getDeliveryMethodsContent() {
    return this.getQuery('deliverymethodcontent').pipe(map(res => res));
  }
  getDeliveryService(idService: number) {
    const promise = new Promise((resolve, reject) => {
      const text = `deliverymethod/${idService}`;
      this.getQuery(text)
      .toPromise()
      .then(
        (res: any) => {
          if (res.successfull) {
            const result = JSON.parse(res.value);
            const totalItems = result.length;
            this.totalDeliveryItems = totalItems;
            const deliveryArray: Array<DeliveryModel> = [];
            result.map((e: any) => {
              const minText = 200; // minimum characters per row
              const onlytext = e.DeliveryMethodDescription.replace( /(<([^>]+)>)/ig, '');
              const maxText = minText * totalItems;
              const temp = {...e, readmore: onlytext.length > maxText ? true : false};
              deliveryArray.push(temp);
            });
            this.serviceDelivery = deliveryArray;
          } else {
            this.serviceDelivery = [];
          }
          resolve();
        },
        msg => {
          reject();
        });
    });
    return promise;
   }
  getConflictsDelivery(idService: number) {
  const promise = new Promise((resolve, reject) => {
    const text = `ConflictsDeliveryMethods/${idService}`;
    this.getQuery(text)
    .toPromise()
    .then(
      (res: any) => {
        this.conflictDelivery = res;
        resolve();
      },
      msg => {
        reject();
      });
  });
  return promise;
   }
  getDeliveryNameValidator(temp: any) {
    return this.getQueryPost('deliverymethodcontent/validateExist', temp).pipe(map(res => res));
  }
  addDeliveryMethod(delivery: any) {
    return this.getQueryPost('deliverymethodcontent', delivery).pipe(map(res => res));
  }
  updateDeliveryMethod(delivery) {
      return this.getQueryPost('deliverymethodcontent/update', delivery).pipe(map(res => res));
  }
  deleteDelivery(delivery) {
    return this.getQueryPost('deliverymethodcontent/delete', delivery).pipe(map(res => res));
  }
  useDelivery(delivery) {
    return this.getQueryPost('deliverymethodcontent/validate', delivery).pipe(map(res => res));
  }
}

