import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-permissibility-icon',
  templateUrl: './permissibility-icon.component.html',
  styleUrls: ['./permissibility-icon.component.scss']
})
export class PermissibilityIconComponent implements OnInit {

  @Input() permissibility: any;
  @Input() filter: any;
  @Input() IdService: any;
  @Input() iconArray: any;
  @Input() enable: any;

  derogation: number = 0;
  defaultColor = '#2E2E38';
  highRestriction = '';

  moreRestrictive = [
    { value: 'Prohib', ranking: 5},
    { value: 'AA', ranking: 4},
    { value: 'ASTCC', ranking: 3},
    { value: 'Allowed', ranking: 2},
    { value: 'N/A', ranking: 1}];

  overWrite = [
    {item: 'ch1', optional: 'Ch1'},
    {item: 'ch1nsa', optional: 'Ch1nsa'},
    {item: 'euAuditedNoValuation', optional: 'EuAuditedNoValuation'},
    {item: 'euaudited', optional: 'Euaudited'},
    {item: 'euAuditedNoValuation', optional: 'EuauditedNoTax'},
    {item: 'eusubject', optional: 'Eusubject'},
    {item: 'otAudited', optional: 'OtAudited'},
    {item: 'otSubject', optional: 'OtSubject'},
    {item: 'secaudited', optional: 'Secaudited'},
    {item: 'secsubject', optional: 'Secsubject'},
    {item: 'ch2', optional: 'Ch2'}
  ];

  constructor() {}

  ngOnInit() {
    const permissibilityByClient = this.filter[0]; // get the permissibility by client
    const restrictions = [];
    const applicable = [];
    if (this.permissibility.ServiceLineCode !== '01' && this.permissibility.ServiceLineCode !== '03' && this.permissibility.ServiceLineCode !== null){
      if (permissibilityByClient.without && permissibilityByClient.with) {
        this.derogation = 0;
      } else if (permissibilityByClient.without) {
        this.derogation = 2;
      } else if (permissibilityByClient.with) {
        this.derogation = 1;
      }
    }
    if (this.permissibility !== undefined) {
      _.forOwn(permissibilityByClient, (value, key) => {
        if ((this.permissibility.ServiceLineCode === '01' || this.permissibility.ServiceLineCode === '03') && this.permissibility.ServiceLineCode !== null) {
           // if the service is ASU or CNS and Client bring token with/witout Derogation, system modify column and always use euaudited
           if ((key === 'eusubject' || key === 'euaudited') && key !== 'euAuditedNoValuation') {
            applicable.push('euaudited');
          } else {
            if (key === 'euAuditedNoValuation' && this.permissibility.EuAuditedNoValuation === ''){
              applicable.push('eusubject');
            } else {
              if (key !== 'without' && key !== 'with' && key !== 'down') {
                applicable.push(key); // Store column header applicable to the token
              }
            }
          }
        } else {
          if (this.permissibility.ServiceLineCode !== null) {
            if (key !== 'without' && key !== 'with' && key !== 'down') {
              applicable.push(key);
            }
          }
        }
      });
      if (applicable.length > 0) {
        applicable.map(ele => { // Validate which column is more restrictive
          const option = this.overWrite.filter(e => e.item === ele);
          if (option.length > 0) {
            if (this.derogation === 0) {
              const result = this.moreRestrictive.filter(e => e.value === this.permissibility[option[0].optional]);
              if (result.length > 0) { // get the ranking of restriction and store it
                restrictions.push(result[0].ranking);
              }
            } else if (this.derogation === 1 || this.derogation === 2) {
              if (this.derogation === 1 && ele !== 'eusubject') {
                const result = this.moreRestrictive.filter(e => e.value === this.permissibility[option[0].optional]);
                if (result.length > 0) { // get the ranking of restriction and store it
                  restrictions.push(result[0].ranking);
                }
              } else if (this.derogation === 2 && ele !== 'euaudited') {
                const result = this.moreRestrictive.filter(e => e.value === this.permissibility[option[0].optional]);
                if (result.length > 0) { // get the ranking of restriction and store it
                  restrictions.push(result[0].ranking);
                }
              }
            }
            this.highRestriction = this.moreRestrictive.filter(e => e.ranking === Math.max(...restrictions)).length > 0 ?
            this.moreRestrictive.filter(e => e.ranking === Math.max(...restrictions))[0].value : '';
          }
        });
      }
    }
  }
}
