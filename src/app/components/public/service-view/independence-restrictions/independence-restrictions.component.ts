import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService, PermissibilityService, CountriesService } from '../../../../providers/provider.index';

@Component({
  selector: 'app-independence-restrictions',
  templateUrl: './independence-restrictions.component.html',
  styleUrls: ['./independence-restrictions.component.scss']
})
export class IndependenceRestrictionsComponent implements OnInit, OnChanges {
@Input() permissibility: any;
@Input() overWrite: any;
@Input() serviceId: any;
@Input() filter: any;
@Input() countryCodeSelected: any;

@Output () permissibilityOptions: EventEmitter<any>;

highlight = [];
iconArray = [];
exception: boolean = false;
// If is global, derogation doesn't care is 0, but if is a location that isn't GLB 1 = with derogation, 2 = without derogation
derogation: number = 0;
moreRestrictive = [
  { value: 'Prohib', ranking: 5},
  { value: 'AA', ranking: 4},
  { value: 'ASTCC', ranking: 4},
  { value: 'Allowed', ranking: 4},
  { value: 'N/A', ranking: 1}];
highRestriction = [];
ConditionOne: boolean = false;
ConditionTwo: boolean = false;
ConditionThree: boolean = false;
tokenOverride = [];
OverRideUK: boolean = false;
restrictions: any;

overWriteRestrictions = [
  { method: 'secauditedvalue', template: 'secauditedValue'},
  { method: 'secsubjectvalue', template: 'secsubjectValue'},
  { method: 'euauditednovaluationvalue', template: 'euAuditedNoValuationValue'},
  { method: 'euauditedvalue', template: 'euauditedValue'},
  { method: 'eusubjectvalue', template: 'eusubjectValue'},
  { method: 'otauditedvalue', template: 'otAuditedValue'},
  { method: 'otsubjectvalue', template: 'otSubjectValue'},
  { method: 'ch1value', template: 'ch1Value'},
  { method: 'ch1nsavalue', template: 'ch1nsaValue'},
  { method: 'ch2value', template: 'ch2Value'},
  { method: '', template: ''}
];

subscription: Subscription;

  constructor(private userService: UserService,
              private permissibilityservice: PermissibilityService,
              private countriesService: CountriesService) {
    this.filter = this.userService.filter;
    this.permissibilityOptions = new EventEmitter();
  }
  ngOnInit() {
    this.restrictions = _.cloneDeep(this.permissibility);
    this.getIndependenceRestrictionOption();
    if (this.filter.client.GISId) {
      if (this.filter.client.permissibility.length > 0) {
        if (this.filter.client.permissibility[0].ch2) {
          this.permissibilityOptions.emit('');
        }
        const override = [];
        _.forOwn(this.filter.client.permissibility[0], (value, key) => {
          if (value === 'override') {
            override.push(key);
          }
        });
        this.tokenOverride = override;
      }
      if (this.tokenOverride.length > 0) {
       this.overrideBasedToken();
      }
    } else {
      this.tokenOverride = [];
      this.OverRideUK = false;
      this.restrictions = _.cloneDeep(this.permissibility);
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'filter':
            this.highlight = [];
            this.highRestriction = [];
            this.ConditionOne = false;
            this.ConditionTwo = false;
            this.ConditionThree = false;
            this.derogation = 0;
            if (this.filter.client && this.filter.client.GISId || this.filter.client && !this.filter.client.GISId && this.filter.client.ClientName === 'Channel 2') {
              this.getHighLightItem(this.filter);
            }
            if (this.filter.client.GISId) {
              if (this.filter.client.permissibility.length > 0) {
                if (this.filter.client.permissibility[0].ch2) {
                  this.permissibilityOptions.emit('');
                }
                const override = [];
                _.forOwn(this.filter.client.permissibility[0], (value, key) => {
                  if (value === 'override') {
                    override.push(key);
                  }
                });
                this.tokenOverride = override;
              }
              if (this.tokenOverride.length > 0) {
               this.overrideBasedToken();
              }
            } else {
              this.tokenOverride = [];
              this.OverRideUK = false;
              this.restrictions = _.cloneDeep(this.permissibility);
            }
            break;
            case 'permissibility':
              this.ConditionOne = false;
              this.ConditionTwo = false;
              this.restrictions = _.cloneDeep(this.permissibility);
              if (this.tokenOverride.length > 0) {
                this.overrideBasedToken();
               } else {
                this.getHighLightItem(this.filter);
               }
              break;
        }
      }
    }
  }

  getIndependenceRestrictionOption() {
    return this.permissibilityservice.getIndependenceIcons()
      .subscribe(data => {
        if (data.length > 0) {
          this.iconArray = data.map(e => ({
            icon: e.Icon,
            value: e.Prefix,
            class: 'material-icons mat-icon_cust',
            color: e.Color,
            label: e.Name
          }));
        }
      });
  }

  getHighLightItem(filter) {
    if (filter.client.GISId && filter.client.permissibility.length === 0) {
      this.highlight = [10];
    } else {
      if (filter.client.GISId && filter.client.permissibility.length > 0) {
        const permissibility = filter.client.permissibility[0]; // get the permissibility by client
        const restrictions = [];
        const applicable = [];
        if (this.restrictions) {
          if (this.restrictions.serviceLineCode !== '01' && this.restrictions.serviceLineCode !== '03'){
            if (permissibility.without && permissibility.with) {
              this.derogation = 0;
            } else if (permissibility.without) {
              this.derogation = 2;
            } else if (permissibility.with) {
              this.derogation = 1;
            }
          }
          _.forOwn(permissibility, (value, key) => {
            if (value !== 'override') {
              if (this.restrictions.serviceLineCode === '01' || this.restrictions.serviceLineCode === '03') {
                // if the service is ASU or CNS and Client bring token with/witout Derogation, system modify column and always use euaudited
                if ((key === 'eusubject' || key === 'euaudited') && key !== 'euAuditedNoValuation') {
                  applicable.push('euaudited');
                  this.highlight.push(3);
                } else {
                  if (key === 'euAuditedNoValuation' && this.restrictions.euAuditedNoValuationValue === '') {
                    applicable.push('eusubject');
                    this.highlight.push(4);
                  } else {
                    if (key !== 'without' && key !== 'with' && key !== 'down') {
                      applicable.push(key); // Store column header applicable to the token
                      this.highlight.push(parseInt(value, 10)); // Store applicable token
                    }
                  }
                }
              } else {
                if (key !== 'without' && key !== 'with' && key !== 'down') {
                  applicable.push(key); // Store column header applicable to the token
                  this.highlight.push(parseInt(value, 10)); // Store applicable token
                }
              }
            }
          });
          if (applicable.length > 0) {
            const cumulativeRestrictions = [];
            applicable.map(ele => { // Validate which column is more restrictive
              if (this.derogation === 0) {
                const item = this.moreRestrictive.filter(e => e.value === this.restrictions[ele + 'Value']);
                if (item.length > 0) { // get the ranking of restriction and store it
                  restrictions.push(item[0].ranking);
                  cumulativeRestrictions.push(item[0].value);
                }
              } else if (this.derogation === 1 || this.derogation === 2) {
                if (this.derogation === 1 && ele !== 'eusubject') {
                  const item = this.moreRestrictive.filter(e => e.value === this.restrictions[ele + 'Value']);
                  if (item.length > 0) { // get the ranking of restriction and store it
                    restrictions.push(item[0].ranking);
                    cumulativeRestrictions.push(item[0].value);
                  }
                } else if (this.derogation === 2 && ele !== 'euaudited') {
                  const item = this.moreRestrictive.filter(e => e.value === this.restrictions[ele + 'Value']);
                  if (item.length > 0) { // get the ranking of restriction and store it
                    restrictions.push(item[0].ranking);
                    cumulativeRestrictions.push(item[0].value);
                  }
                }
              }
            });
            const applicableItem = this.moreRestrictive.filter(e => e.ranking === Math.max(...restrictions)).map(e => e.value);
            if (applicableItem.length > 0 ) {
                const options = _.intersection(applicableItem, cumulativeRestrictions);
                this.highRestriction = options;
            } else {
              this.highRestriction = [];
            }
            const totalProhib = cumulativeRestrictions.filter(e => e === 'Prohib').length;
            if (totalProhib > 0) {
              this.ConditionOne = true;
            } else {
              const otherRestriction = cumulativeRestrictions.filter(e => e !== 'Prohib').length;
              if (otherRestriction > 1) {
                if (applicable.filter(e => e === 'euaudited').length > 1) {
                  const remove = otherRestriction - 1;
                  if (remove > 1) {
                    this.ConditionTwo = true;
                  }
                } else {
                  this.ConditionTwo = true;
                }
              }
            }
          }
        }
      }
    }
  }
  addClient() {
    const temp = {GISId: '000', ClientName: '', url: '', gfisid: null, MDMId: null, DateAdd: null, DateUpdated: null, favorite: false, permissibility: []};
    temp.ClientName = 'Channel 2';
    temp.permissibility = [{ch2: '10'}];
    console.log('client channel 2', temp);
    this.userService.saveClientFilter(temp);
  }
  overrideBasedToken() {
    this.countriesService.overridePermissibility(this.serviceId, this.tokenOverride).subscribe(e => {
    const other = e.map(ele => ({...ele, ColumnName: this.overWriteRestrictions.filter(i => i.method === ele.column)[0].template }));
    if (other.filter(item => item.value === null).length === 0) { // means the service is not offered in UK
      this.ConditionThree = false;
      _.forOwn(this.restrictions, (value, key) => {
          const match = other.filter(item => item.ColumnName === key && item.value !== null);
          if (match.length > 0) {
            this.restrictions[key] = match[0].value;
            this.OverRideUK = true;
          }
        });
      if (this.OverRideUK) {
          this.ConditionOne = false;
          this.ConditionTwo = false;
          this.getHighLightItem(this.filter);
      }
    } else {
      this.ConditionThree = true;
    }
    });
  }
}
