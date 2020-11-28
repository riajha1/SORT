import { ChangeDetectorRef, Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import * as _ from 'lodash';
import { Location } from '@angular/common';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import { LocationFilterNodeBox, LocationFilterNode, LocationFiltreBoxChildNode, Permissibilitygetmodel } from 'src/app/models/model.index';
import { CountriesService, PermissibilityService, ServiceService, UserService } from 'src/app/providers/provider.index';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('stickyGlobal', {static: false}) menuElement: ElementRef;
  sticky: boolean = false;
  menuPosition: any;
  permissibilityGlobal: any = {};
  copyPermissibilityGlobal: any = {};
  permissibilityLocal: any = [];

  selectedColumn: any = [];
  filter: any;
  serviceId: number = 0;
  loadingResult = true;
  greyBarData: any = {
    originOfService : '',
    serviceLinePrefix : '',
    serviceTitle : '',
  };
  permsibilityget: Permissibilitygetmodel;
  columns = 0;
  item = [];
  iconArray = [];
  locationDatabase = [];
  publishLocations = [];
  defaultColor = '#2E2E38';
  loading = true;
  ready = false;
  country: any = [];
  enableThirdColumn: boolean = false;
  showHideButton: boolean = true;
  nodePermissibility: any = [];
  tokenOverride = [];
  OverRideUK: boolean = false;

  subscriptionFilter: Subscription;
  highlight = [];
  highRestriction = [];
  derogation: number = 0;
  slcode: any;
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
  replaceTxt = [{
    item: 'secaudited',
    treeValue: 'SecauditedValue',
    highlight: 'SecauditedHighlight'
  },
  {
    item: 'secsubject',
    treeValue: 'SecsubjectValue',
    highlight: 'SecsubjectHighlight'
  }, {
    item: 'euaudited',
    treeValue: 'EuauditedValue',
    highlight: 'EuauditedHighlight'
  }, {
    item: 'eusubject',
    treeValue: 'EusubjectValue',
    highlight: 'EusubjectHighlight'
  }, {
    item: 'euAuditedNoValuation',
    treeValue: 'EuAuditedNoValuationValue',
    highlight: 'EuAuditedNoValuationHighlight'
  }, {
    item: 'otAudited',
    treeValue: 'OtAuditedValue',
    highlight: 'OtAuditedHighlight'
  }, {
    item: 'otSubject',
    treeValue: 'OtSubjectValue',
    highlight: 'OtSubjectHighlight'
  }, {
    item: 'ch1',
    treeValue: 'Ch1Value',
    highlight: 'Ch1Highlight'
  }, {
    item: 'ch1nsa',
    treeValue: 'Ch1NsaValue',
    highlight: 'Ch1NsaHighlight'
  },
{
  item: 'ch2',
  treeValue: 'Ch2Value',
  highlight: 'Ch2Highlight'
}];
  moreRestrictive = [
    { value: 'Prohib', ranking: 5},
    { value: 'AA', ranking: 4},
    { value: 'ASTCC', ranking: 4},
    { value: 'Allowed', ranking: 4},
    { value: 'N/A', ranking: 1}];
   // template to render tree component
   locations: LocationFilterNode[] = [
    {
      label: 'Global',
      selected: false,
      name: 'Global',
      children: [
        {
          label: 'Americas',
          name: 'Americas',
          selected: false,
          children: [
            {
              name: 'BBC',
              selected: false,
              children: []
            },
            {
              name: 'Canada',
              selected: false,
              children: []
            },
            {
              name: 'EYC',
              selected: false,
              children: []
            },
            {
              name: 'Israel',
              selected: false,
              children: []
            },
            {
              name: 'LAN',
              selected: false,
              children: []
            },
            {
              name: 'LAS',
              selected: false,
              children: []
            },
            {
              name: 'US',
              selected: false,
              children: []
            }
          ]
        },
        {
          label: 'EMEIA',
          selected: false,
          name: 'EMEIA',
          children: [
            {
              name: 'Africa',
              selected: false,
              children: []
            },
            {
              name: 'CESA',
              selected: false,
              children: []
            },
            {
              name: 'GSA',
              selected: false,
              children: []
            },
            {
              name: 'India',
              selected: false,
              children: []
            },
            {
              name: 'Mediterranean',
              selected: false,
              children: []
            },
            {
              name: 'MENA',
              selected: false,
              children: []
            },
            {
              name: 'Nordics',
              selected: false,
              children: []
            },
            {
              name: 'UK&I',
              selected: false,
              children: []
            },
            {
              name: 'WEM',
              selected: false,
              children: []
            }
          ]
        },
        {
          label: 'Asia Pacific',
          name: 'Asia Pacific',
          selected: false,
          children: [
            {
              name: 'ASEAN',
              selected: false,
              children: []
            },
            {
              name: 'Greater China',
              selected: false,
              children: []
            },
            {
              name: 'Korea',
              selected: false,
              children: []
            },
            {
              name: 'Oceania',
              selected: false,
              children: []
            },
            {
              name: 'Japan',
              selected: false,
              children: []
            }]
        }
      ]
    }
  ];
  @HostListener('window:scroll', ['$event']) handleScroll($event: Event): void {
    const windowScroll = window.pageYOffset;
    if( windowScroll >= this.menuPosition) {
      this.sticky = true;
    } else {
      this.sticky = false;
    }
}
  public transformer = (node: LocationFilterNodeBox, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      selected: node.selected,
      permissibility: {
        SecauditedValue: '',
        SecsubjectValue: '',
        EuauditedValue: '',
        EusubjectValue: '',
        EuAuditedNoValuationValue: '',
        OtAuditedValue: '',
        OtSubjectValue: '',
        Ch1Value: '',
        Ch1NsaValue: '',
        Ch2Value: '',
        deviationSecauditedValue: false,
        deviationSecsubjectValue: false,
        deviationEuauditedValue: false,
        deviationEusubjectValue: false,
        deviationEuAuditedNoValuationValue: false,
        deviationOtAuditedValue: false,
        deviationOtSubjectValue: false,
        deviationCh1Value: false,
        deviationCh1NsaValue: false,
        deviationCh2Value: false,
        SecauditedHighlight: 0,
        SecsubjectHighlight: 0,
        EuauditedHighlight: 0,
        EusubjectHighlight: 0,
        EuAuditedNoValuationHighlight: 0,
        OtAuditedHighlight: 0,
        OtSubjectHighlight: 0,
        Ch1Highlight: 0,
        Ch1NsaHighlight: 0,
        Ch2Highlight: 0
      },
      permissibilityGlobal: {
        SecauditedValue: '',
        SecsubjectValue: '',
        EuauditedValue: '',
        EusubjectValue: '',
        EuAuditedNoValuationValue: '',
        OtAuditedValue: '',
        OtSubjectValue: '',
        Ch1Value: '',
        Ch1NsaValue: '',
        Ch2Value: '',
        deviationSecauditedValue: false,
        deviationSecsubjectValue: false,
        deviationEuauditedValue: false,
        deviationEusubjectValue: false,
        deviationEuAuditedNoValuationValue: false,
        deviationOtAuditedValue: false,
        deviationOtSubjectValue: false,
        deviationCh1Value: false,
        deviationCh1NsaValue: false,
        deviationCh2Value: false,
        SecauditedHighlight: 0,
        SecsubjectHighlight: 0,
        EuauditedHighlight: 0,
        EusubjectHighlight: 0,
        EuAuditedNoValuationHighlight: 0,
        OtAuditedHighlight: 0,
        OtSubjectHighlight: 0,
        Ch1Highlight: 0,
        Ch1NsaHighlight: 0,
        Ch2Highlight: 0
      },
      deviation: node.deviation
    };
  }
  // tslint:disable-next-line: member-ordering
  treeControl = new FlatTreeControl<LocationFiltreBoxChildNode>(
    node => node.level,
    node => node.expandable
  );
  // tslint:disable-next-line: member-ordering
  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );
// tslint:disable-next-line: member-ordering
  checklistSelection = new SelectionModel<LocationFilterNode>(true);
  // tslint:disable-next-line: member-ordering
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  constructor(private activatedRoute: ActivatedRoute, private serviceService: ServiceService,
              private countriesService: CountriesService,
              private cdRef: ChangeDetectorRef,
              private userService: UserService,
              private location: Location,
              private permissibilityservice: PermissibilityService) {
    this.activatedRoute.params.subscribe(params => this.serviceId = params.id);
    this.permsibilityget = new Permissibilitygetmodel();
  }

  ngOnInit() {
    this.filter = this.userService.filter;

    this.getIndependenceRestrictionOption();
    this.getServiceDetail();
    this.getlocations();
    this.getCountry();

    this.subscriptionFilter = this.userService.getfilterApp().subscribe(filternav => {
      this.filter = filternav;
      if (this.filter.client.GISId) {
        if (this.filter.client.permissibility.length > 0) {
          const override = [];
          _.forOwn(this.filter.client.permissibility[0], (value, key) => {
            if (value === 'override') {
              override.push(key);
            }
          });
          this.tokenOverride = override;
          if (this.tokenOverride.length > 0) {
            this.overrideBasedToken();
          }
          this.highlightColum();
        }

      } else {
        this.ngAfterViewInit();
        this.tokenOverride = [];
        this.OverRideUK = false;
        this.derogation = 0;
        this.permissibilityGlobal = {
          ...this.copyPermissibilityGlobal,
          SecauditedHighlight: 0,
          SecsubjectHighlight: 0,
          EuauditedHighlight: 0,
          EusubjectHighlight: 0,
          EuAuditedNoValuationHighlight: 0,
          OtAuditedHighlight: 0,
          OtSubjectHighlight: 0,
          Ch1Highlight: 0,
          Ch1NsaHighlight: 0,
          Ch2Highlight: 0}
      }
    });
  }
  highlightColum() {
    this.highlight = [];
    this.highRestriction = [];
    this.derogation = 0;
    if (this.filter.client && this.filter.client.GISId || this.filter.client && !this.filter.client.GISId && this.filter.client.ClientName === 'Channel 2') {
      this.getHighLightItem(this.filter);
    }
  }
  ngOnDestroy() {
    if (this.subscriptionFilter !== undefined) {
      this.subscriptionFilter.unsubscribe();
    }
  }
  getHighLightItem(filter) {
    if (filter.client.GISId && filter.client.permissibility.length === 0) {
      this.highlight = [10];
    } else {
      if (filter.client.GISId && filter.client.permissibility.length > 0) {
        const permissibility = filter.client.permissibility[0]; // get the permissibility by client
        const applicable = [];
        console.log('sl', this.slcode);
        if (this.slcode) {
          if (this.slcode !== '01' && this.slcode !== '03') {
            if (permissibility.without && permissibility.with) {
              this.derogation = 0;
            } else if (permissibility.without) {
              this.derogation = 2;
            } else if (permissibility.with) {
              this.derogation = 1;
            }
          }
          console.log('la dero', this.derogation);
          _.forOwn(permissibility, (value, key) => {
            if (value !== 'override') {
              if (this.slcode === '01' || this.slcode === '03') {
                // if the service is ASU or CNS and Client bring token with/witout Derogation, system modify column and always use euaudited
                if ((key === 'eusubject' || key === 'euaudited') && key !== 'euAuditedNoValuation') {
                  applicable.push('euaudited');
                  this.highlight.push(3);
                } else {
                  if (key === 'euAuditedNoValuation' && this.permissibilityGlobal.EuAuditedNoValuationValue === '') {
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
          console.log('las que hay', applicable);
          if (applicable.length > 0) {
            // Calculate highlight global part
            const restrictionsGLB = [];
            const cumulativeRestrictionsGLB = [];
            console.log('permissibilityGlobal', this.permissibilityGlobal);
            console.log('applicable', applicable);
            applicable.map(ele => { 
              const getOption = this.replaceTxt.filter(opt => opt.item === ele);
              console.log('global option', getOption);
              if (getOption.length > 0) {
                const options = getOption[0].treeValue;
                if (this.derogation === 0) {
                  const item = this.moreRestrictive.filter(e => e.value === this.permissibilityGlobal[options]);
                  if (item.length > 0) { // get the ranking of restriction and store it
                    restrictionsGLB.push(item[0].ranking);
                    cumulativeRestrictionsGLB.push(item[0].value);
                  }
                } else if (this.derogation === 1 || this.derogation === 2) {
                  if (this.derogation === 1 && ele !== 'eusubject') {
                    const item = this.moreRestrictive.filter(e => e.value === this.permissibilityGlobal[options]);
                    if (item.length > 0) { // get the ranking of restriction and store it
                      restrictionsGLB.push(item[0].ranking);
                      cumulativeRestrictionsGLB.push(item[0].value);
                    }
                  } else if (this.derogation === 2 && ele !== 'euaudited') {
                    const item = this.moreRestrictive.filter(e => e.value === this.permissibilityGlobal[options]);
                    if (item.length > 0) { // get the ranking of restriction and store it
                      restrictionsGLB.push(item[0].ranking);
                      cumulativeRestrictionsGLB.push(item[0].value);
                    }
                  }
                }
              }
            });
            const applicableItem = this.moreRestrictive.filter(e => e.ranking === Math.max(...restrictionsGLB)).map(e => e.value);
            if (applicableItem.length > 0) {
                const result = _.intersection(applicableItem, cumulativeRestrictionsGLB);
                console.log('ganadores',result)
                let allColumns = ['SecauditedHighlight', 'SecsubjectHighlight', 'EuauditedHighlight', 'EusubjectHighlight',
                                  'EuAuditedNoValuationHighlight', 'OtAuditedHighlight', 'OtSubjectHighlight', 'Ch1Highlight',
                                  'Ch1NsaHighlight', 'Ch2Highlight'];
                applicable.map(no => {
                  const getOption = this.replaceTxt.filter(opt => opt.item === no);
                  console.log('getOption', getOption)
                  allColumns = allColumns.filter(l => l !== getOption[0].highlight);
                  if (getOption.length > 0) {
                    console.log('result', result);
                    console.log('valor', this.permissibilityGlobal[getOption[0].treeValue]);
                    if (result.includes(this.permissibilityGlobal[getOption[0].treeValue])) {
                      console.log('entraos al if', getOption[0].highlight);
                      this.permissibilityGlobal[getOption[0].highlight] = 1;
                    } else {
                      this.permissibilityGlobal[getOption[0].highlight] = 2;
                      console.log('entraos else')
                    }
                  }
                });
                allColumns.map(item => this.permissibilityGlobal[item] = 2);
              }
            // calculate highlight for the tree
            const treeNodes = this.treeControl.dataNodes.filter(item => item.selected && item.level === 3);
            if (treeNodes.length > 0) {
             treeNodes.map(option => {
              const restrictions = [];
              const cumulativeRestrictions = [];
              applicable.map(ele => { // Validate which column is more restrictive
                const getOption = this.replaceTxt.filter(opt => opt.item === ele);
                if (getOption.length > 0) {
                  const options = getOption[0].treeValue;
                  if (this.derogation === 0) {
                    const item = this.moreRestrictive.filter(e => e.value === option.permissibility[options]);
                    if (item.length > 0) { // get the ranking of restriction and store it
                      restrictions.push(item[0].ranking);
                      cumulativeRestrictions.push(item[0].value);
                    }
                  } else if (this.derogation === 1 || this.derogation === 2) {
                    if (this.derogation === 1 && ele !== 'eusubject') {
                      const item = this.moreRestrictive.filter(e => e.value === option.permissibility[options]);
                      if (item.length > 0) { // get the ranking of restriction and store it
                        restrictions.push(item[0].ranking);
                        cumulativeRestrictions.push(item[0].value);
                      }
                    } else if (this.derogation === 2 && ele !== 'euaudited') {
                      const item = this.moreRestrictive.filter(e => e.value === option.permissibility[options]);
                      if (item.length > 0) { // get the ranking of restriction and store it
                        restrictions.push(item[0].ranking);
                        cumulativeRestrictions.push(item[0].value);
                      }
                    }
                  }
                }
              });
              const applicableItemGlobal = this.moreRestrictive.filter(e => e.ranking === Math.max(...restrictions)).map(e => e.value);
              if (applicableItemGlobal.length > 0) {
                const result = _.intersection(applicableItemGlobal, cumulativeRestrictions);
                let allColumns = ['SecauditedHighlight', 'SecsubjectHighlight', 'EuauditedHighlight', 'EusubjectHighlight',
                                  'EuAuditedNoValuationHighlight', 'OtAuditedHighlight', 'OtSubjectHighlight', 'Ch1Highlight',
                                  'Ch1NsaHighlight', 'Ch2Highlight'];
                applicable.map(no => {
                  const getOption = this.replaceTxt.filter(opt => opt.item === no);
                  allColumns = allColumns.filter(l => l !== getOption[0].highlight);
                  if (getOption.length > 0) {
                    if (result.includes(option.permissibility[getOption[0].treeValue])) {
                      option.permissibility[getOption[0].highlight] = 1;
                    } else {
                      option.permissibility[getOption[0].highlight] = 2;
                    }
                  }
                });
                allColumns.map(item => option.permissibility[item] = 2);
              }
            });
           }
            this.cdRef.detectChanges();
          }
        }
      }
    }
  }
 // Function to get all countries store in database
 ngAfterViewInit() {
  // Logic to select each node based on locations saved by the user in location component
  if (this.locationDatabase.length > 0 ) {
    this.ready = true;
    let isGlobal = false;
    isGlobal = this.locationDatabase.find((e: any) => e.CountryCode === 'GLB');
    if (isGlobal) {
      // Global is selected
      if (this.treeControl.dataNodes !== undefined) {
        this.treeControl.dataNodes.map(node => {
          if (node.level === 3) {
            node.selected = true;
            const previousPermissibility = this.nodePermissibility.filter(storedNode => storedNode.level === node.level && storedNode.name === node.name);
            if (previousPermissibility.length > 0) {
              // logic - exist deviation in the row
              node.permissibility = previousPermissibility[0].permissibility;
              this.selectedColumn.map(item => {
                switch (item.column) {
                  case 'SecauditedValue':
                    if (!node.permissibility.deviationSecauditedValue) {
                      node.permissibility.SecauditedValue = item.value;
                    } else {
                      if (node.permissibility.SecauditedValue === item.value) {
                        node.permissibility.deviationSecauditedValue = false;
                      }
                    }
                    node.permissibilityGlobal.SecauditedValue = item.value;
                    node.permissibility.SecauditedHighlight = 0;
                    break;
                  case 'SecsubjectValue':
                    if (!node.permissibility.deviationSecsubjectValue) {
                      node.permissibility.SecsubjectValue = item.value;
                    } else {
                      if (node.permissibility.SecsubjectValue === item.value) {
                        node.permissibility.deviationSecsubjectValue = false;
                      }
                    }
                    node.permissibility.SecsubjectHighlight = 0;
                    node.permissibilityGlobal.SecsubjectValue = item.value;
                    break;
                  case 'EuauditedValue':
                    if (!node.permissibility.deviationEuauditedValue) {
                      node.permissibility.EuauditedValue = item.value;
                    } else {
                      if (node.permissibility.EuauditedValue === item.value) {
                        node.permissibility.deviationEuauditedValue = false;
                      }
                    }
                    node.permissibility.EuauditedHighlight = 0;
                    node.permissibilityGlobal.EuauditedValue =  item.value;
                    break;
                  case 'EusubjectValue':
                    if (!node.permissibility.deviationEusubjectValue) {
                      node.permissibility.EusubjectValue = item.value;
                    } else {
                      if (node.permissibility.EusubjectValue === item.value) {
                        node.permissibility.deviationEusubjectValue = false;
                      }
                    }
                    node.permissibility.EusubjectHighlight = 0;
                    node.permissibilityGlobal.EusubjectValue = item.value;
                    break;
                  case 'EuAuditedNoValuationValue':
                    if (!node.permissibility.deviationEuAuditedNoValuationValue) {
                      node.permissibility.EuAuditedNoValuationValue = item.value;
                    } else {
                      if (node.permissibility.EuAuditedNoValuationValue === item.value) {
                        node.permissibility.deviationEuAuditedNoValuationValue = false;
                      }
                    }
                    node.permissibility.EuAuditedNoValuationHighlight = 0;
                    node.permissibilityGlobal.EuAuditedNoValuationValue = item.value;
                    break;
                  case 'OtAuditedValue':
                    if (!node.permissibility.deviationOtAuditedValue) {
                      node.permissibility.OtAuditedValue = item.value;
                    } else {
                      if (node.permissibility.OtAuditedValue === item.value) {
                        node.permissibility.deviationOtAuditedValue = false;
                      }
                    }
                    node.permissibility.OtAuditedHighlight = 0;
                    node.permissibilityGlobal.OtAuditedValue =  item.value;
                    break;
                  case 'OtSubjectValue':
                    if (!node.permissibility.deviationOtSubjectValue) {
                      node.permissibility.OtSubjectValue = item.value;
                    } else {
                      if (node.permissibility.OtSubjectValue === item.value) {
                        node.permissibility.deviationOtSubjectValue = false;
                      }
                    }
                    node.permissibility.OtSubjectHighlight = 0;
                    node.permissibilityGlobal.OtSubjectValue = item.value;
                    break;
                  case 'Ch1Value':
                    if (!node.permissibility.deviationCh1Value) {
                      node.permissibility.Ch1Value = item.value;
                    } else {
                      if (node.permissibility.Ch1Value === item.value) {
                        node.permissibility.deviationCh1Value = false;
                      }
                    }
                    node.permissibility.Ch1Highlight = 0;
                    node.permissibilityGlobal.Ch1Value = item.value;
                    break;
                  case 'Ch1NsaValue':
                    if (!node.permissibility.deviationCh1NsaValue) {
                      node.permissibility.Ch1NsaValue = item.value;
                    } else {
                      if (node.permissibility.Ch1NsaValue === item.value) {
                        node.permissibility.deviationCh1NsaValue = false;
                      }
                    }
                    node.permissibility.Ch1NsaHighlight = 0;
                    node.permissibilityGlobal.Ch1NsaValue = item.value;
                    break;
                  case 'Ch2Value':
                    if (!node.permissibility.deviationCh2Value) {
                      node.permissibility.Ch2Value = item.value;
                    } else {
                      if (node.permissibility.Ch2Value === item.value) {
                        node.permissibility.deviationCh2Value = false;
                      }
                    }
                    node.permissibility.Ch2Highlight = 0;
                    node.permissibilityGlobal.Ch2Value = item.value;
                    break;
                  default:
                    break;
                }
              });
            } else {
              // doesn't exist in previousPermissibility
              this.selectedColumn.map(item => {
                switch (item.column) {
                  case 'SecauditedValue':
                    node.permissibility.SecauditedValue = item.value;
                    node.permissibilityGlobal.SecauditedValue = item.value;
                    node.permissibility.SecauditedHighlight = 0;
                    break;
                  case 'SecsubjectValue':
                    node.permissibility.SecsubjectValue = item.value;
                    node.permissibilityGlobal.SecsubjectValue = item.value;
                    node.permissibility.SecsubjectHighlight = 0;
                    break;
                  case 'EuauditedValue':
                    node.permissibility.EuauditedValue =  item.value;
                    node.permissibilityGlobal.EuauditedValue =  item.value;
                    node.permissibility.EuauditedHighlight = 0;
                    break;
                  case 'EusubjectValue':
                    node.permissibility.EusubjectValue = item.value;
                    node.permissibilityGlobal.EusubjectValue = item.value;
                    node.permissibility.EusubjectHighlight = 0;
                    break;
                  case 'EuAuditedNoValuationValue':
                    node.permissibility.EuAuditedNoValuationValue = item.value;
                    node.permissibilityGlobal.EuAuditedNoValuationValue = item.value;
                    node.permissibility.EuAuditedNoValuationHighlight = 0;
                    break;
                  case 'OtAuditedValue':
                    node.permissibility.OtAuditedValue =  item.value;
                    node.permissibilityGlobal.OtAuditedValue =  item.value;
                    node.permissibility.OtAuditedHighlight = 0;
                    break;
                  case 'OtSubjectValue':
                    node.permissibility.OtSubjectValue = item.value;
                    node.permissibilityGlobal.OtSubjectValue = item.value;
                    node.permissibility.OtSubjectHighlight = 0;
                    break;
                  case 'Ch1Value':
                    node.permissibility.Ch1Value = item.value;
                    node.permissibilityGlobal.Ch1Value = item.value;
                    node.permissibility.Ch1Highlight = 0;
                    break;
                  case 'Ch1NsaValue':
                    node.permissibility.Ch1NsaValue = item.value;
                    node.permissibilityGlobal.Ch1NsaValue = item.value;
                    node.permissibility.Ch1NsaHighlight = 0;
                    break;
                  case 'Ch2Value':
                    node.permissibility.Ch2Value = item.value;
                    node.permissibilityGlobal.Ch2Value = item.value;
                    node.permissibility.Ch2Highlight = 0;
                    break;
                  default:
                    break;
                }
              });
            }
            node.deviation = node.permissibility.deviationSecauditedValue || node.permissibility.deviationSecsubjectValue ||
              node.permissibility.deviationEuauditedValue || node.permissibility.deviationEusubjectValue ||
              node.permissibility.deviationEuAuditedNoValuationValue || node.permissibility.deviationOtAuditedValue ||
              node.permissibility.deviationOtSubjectValue || node.permissibility.deviationCh1Value ||
              node.permissibility.deviationCh1NsaValue || node.permissibility.deviationCh2Value ? true : false;
            // Region
            const parent = this.getParent(node);
            const descendantsparent = this.treeControl.getDescendants(parent);
            const condition = descendantsparent.filter(element => element.level === 3).length === descendantsparent.filter(element => element.level === 3 && element.selected === true).length;
            if (!parent.selected || parent.selected) {
              parent.selected = condition === true ? true : false;
              if (!parent.deviation) {
                parent.deviation = node.permissibility.deviationSecauditedValue || node.permissibility.deviationSecsubjectValue ||
                  node.permissibility.deviationEuauditedValue || node.permissibility.deviationEusubjectValue ||
                  node.permissibility.deviationEuAuditedNoValuationValue || node.permissibility.deviationOtAuditedValue ||
                  node.permissibility.deviationOtSubjectValue || node.permissibility.deviationCh1Value ||
                  node.permissibility.deviationCh1NsaValue || node.permissibility.deviationCh2Value ? true : false;
              }
            }
            // // Area
            const parentparent = this.getParent(parent);
            const descendantsparentparent = this.treeControl.getDescendants(parentparent);
            const condition2 = descendantsparentparent.filter(element => element.level === 2).length === descendantsparentparent
              .filter(element => element.level === 2 && element.selected === true).length;
            if (!parentparent.selected || parentparent.selected) {
              parentparent.selected = condition2 === true ? true : false;
              if (!parentparent.deviation) {
                parentparent.deviation = parent.deviation;
              }
            }
            this.cdRef.detectChanges();
          }
        });
      }
    } else {
    // find this locations in the tree, selected an specific node and also find their parent too
      console.log('selectedColumn else ngAfterViewInit', this.selectedColumn);
      this.locationDatabase.map(e => {
        const countryData = this.country.all.filter(item => item.countryCode === e.CountryCode);
        if (countryData) {
          if (this.treeControl.dataNodes !== undefined) {
            this.treeControl.dataNodes.map(node => {
              if (e.IsSelectedCountry && countryData[0]) {
                if ( node.name === countryData[0].area ) {
                    const countries = this.treeControl.getDescendants(node);
                    countries.map(child => {
                      if (child.name === countryData[0].countryName && child.level === 3 ) {
                        const previousPermissibility = this.nodePermissibility.filter(storedNode => storedNode.level === child.level && storedNode.name === child.name);
                        if (!child.selected) {
                          child.selected = ! child.selected;
                        }
                        if (previousPermissibility.length > 0) {
                          // exist deviation in the row
                          child.permissibility = previousPermissibility[0].permissibility;
                          this.selectedColumn.map(item => {
                            switch (item.column) {
                              case 'SecauditedValue':
                                if (!child.permissibility.deviationSecauditedValue) {
                                  child.permissibility.SecauditedValue = item.value;
                                } else {
                                  if (child.permissibility.SecauditedValue === item.value) {
                                    child.permissibility.deviationSecauditedValue = false;
                                  }
                                }
                                child.permissibilityGlobal.SecauditedValue = item.value;
                                child.permissibility.SecauditedHighlight = 0;
                                break;
                              case 'SecsubjectValue':
                                if (!child.permissibility.deviationSecsubjectValue) {
                                  child.permissibility.SecsubjectValue = item.value;
                                } else {
                                  if (child.permissibility.SecsubjectValue === item.value) {
                                    child.permissibility.deviationSecsubjectValue = false;
                                  }
                                }
                                child.permissibilityGlobal.SecsubjectValue = item.value;
                                child.permissibility.SecsubjectHighlight = 0;
                                break;
                              case 'EuauditedValue':
                                if (!child.permissibility.deviationEuauditedValue) {
                                  child.permissibility.EuauditedValue = item.value;
                                } else {
                                  if (child.permissibility.EuauditedValue === item.value) {
                                    child.permissibility.deviationEuauditedValue = false;
                                  }
                                }
                                child.permissibility.EuauditedHighlight = 0;
                                child.permissibilityGlobal.EuauditedValue =  item.value;
                                break;
                              case 'EusubjectValue':
                                if (!child.permissibility.deviationEusubjectValue) {
                                  child.permissibility.EusubjectValue = item.value;
                                } else {
                                  if (child.permissibility.EusubjectValue === item.value) {
                                    child.permissibility.deviationEusubjectValue = false;
                                  }
                                }
                                child.permissibility.EusubjectHighlight = 0;
                                child.permissibilityGlobal.EusubjectValue = item.value;
                                break;
                              case 'EuAuditedNoValuationValue':
                                if (!child.permissibility.deviationEuAuditedNoValuationValue) {
                                  child.permissibility.EuAuditedNoValuationValue = item.value;
                                } else {
                                  if (child.permissibility.EuAuditedNoValuationValue === item.value) {
                                    child.permissibility.deviationEuAuditedNoValuationValue = false;
                                  }
                                }
                                child.permissibility.EuAuditedNoValuationHighlight = 0;
                                child.permissibilityGlobal.EuAuditedNoValuationValue = item.value;
                                break;
                              case 'OtAuditedValue':
                                if (!child.permissibility.deviationOtAuditedValue) {
                                  child.permissibility.OtAuditedValue = item.value;
                                } else {
                                  if (child.permissibility.OtAuditedValue === item.value) {
                                    child.permissibility.deviationOtAuditedValue = false;
                                  }
                                }
                                child.permissibility.OtAuditedHighlight = 0;
                                child.permissibilityGlobal.OtAuditedValue =  item.value;
                                break;
                              case 'OtSubjectValue':
                                if (!child.permissibility.deviationOtSubjectValue) {
                                  child.permissibility.OtSubjectValue = item.value;
                                } else {
                                  if (child.permissibility.OtSubjectValue === item.value) {
                                    child.permissibility.deviationOtSubjectValue = false;
                                  }
                                }
                                child.permissibilityGlobal.OtSubjectValue = item.value;
                                child.permissibility.OtSubjectHighlight = 0;
                                break;
                              case 'Ch1Value':
                                if (!child.permissibility.deviationCh1Value) {
                                  child.permissibility.Ch1Value = item.value;
                                } else {
                                  if (child.permissibility.Ch1Value === item.value) {
                                    child.permissibility.deviationCh1Value = false;
                                  }
                                }
                                child.permissibility.Ch1Highlight = 0;
                                child.permissibilityGlobal.Ch1Value = item.value;
                                break;
                              case 'Ch1NsaValue':
                                if (!child.permissibility.deviationCh1NsaValue) {
                                  child.permissibility.Ch1NsaValue = item.value;
                                } else {
                                  if (child.permissibility.Ch1NsaValue === item.value) {
                                    child.permissibility.deviationCh1NsaValue = false;
                                  }
                                }
                                child.permissibility.Ch1NsaHighlight = 0;
                                child.permissibilityGlobal.Ch1NsaValue = item.value;
                                break;
                              case 'Ch2Value':
                                if (!child.permissibility.deviationCh2Value) {
                                  child.permissibility.Ch2Value = item.value;
                                } else {
                                  if (child.permissibility.Ch2Value === item.value) {
                                    child.permissibility.deviationCh2Value = false;
                                  }
                                }
                                child.permissibility.Ch2Highlight = 0;
                                child.permissibilityGlobal.Ch2Value = item.value;
                                break;
                              default:
                                break;
                            }
                          });
                          child.deviation = child.permissibility.deviationSecauditedValue === true || child.permissibility.deviationSecsubjectValue === true ||
                            child.permissibility.deviationEuauditedValue === true || child.permissibility.deviationEusubjectValue === true ||
                            child.permissibility.deviationEuAuditedNoValuationValue === true || child.permissibility.deviationOtAuditedValue === true ||
                            child.permissibility.deviationOtSubjectValue === true || child.permissibility.deviationCh1Value === true ||
                            child.permissibility.deviationCh1NsaValue === true || child.permissibility.deviationCh2Value === true ? true : false;
                        } else {
                          // doesn't exist in previousPermissibility
                          this.selectedColumn.map(item => {
                            switch (item.column) {
                              case 'SecauditedValue':
                                child.permissibility.SecauditedValue = item.value;
                                child.permissibilityGlobal.SecauditedValue = item.value;
                                child.permissibility.SecauditedHighlight = 0;
                                break;
                              case 'SecsubjectValue':
                                child.permissibility.SecsubjectValue = item.value;
                                child.permissibilityGlobal.SecsubjectValue = item.value;
                                child.permissibility.SecsubjectHighlight = 0;
                                break;
                              case 'EuauditedValue':
                                child.permissibility.EuauditedValue =  item.value;
                                child.permissibilityGlobal.EuauditedValue =  item.value;
                                child.permissibility.EuauditedHighlight = 0;
                                break;
                              case 'EusubjectValue':
                                child.permissibility.EusubjectValue = item.value;
                                child.permissibilityGlobal.EusubjectValue = item.value;
                                child.permissibility.EusubjectHighlight = 0;
                                break;
                              case 'EuAuditedNoValuationValue':
                                child.permissibility.EuAuditedNoValuationValue = item.value;
                                child.permissibilityGlobal.EuAuditedNoValuationValue = item.value;
                                child.permissibility.EuAuditedNoValuationHighlight = 0;
                                break;
                              case 'OtAuditedValue':
                                child.permissibility.OtAuditedValue =  item.value;
                                child.permissibilityGlobal.OtAuditedValue =  item.value;
                                child.permissibility.OtAuditedHighlight = 0;
                                break;
                              case 'OtSubjectValue':
                                child.permissibility.OtSubjectValue = item.value;
                                child.permissibilityGlobal.OtSubjectValue = item.value;
                                child.permissibility.OtSubjectHighlight = 0;
                                break;
                              case 'Ch1Value':
                                child.permissibility.Ch1Value = item.value;
                                child.permissibilityGlobal.Ch1Value = item.value;
                                child.permissibility.Ch1Highlight = 0;
                                break;
                              case 'Ch1NsaValue':
                                child.permissibility.Ch1NsaValue = item.value;
                                child.permissibilityGlobal.Ch1NsaValue = item.value;
                                child.permissibility.Ch1NsaHighlight = 0;
                                break;
                              case 'Ch2Value':
                                child.permissibility.Ch2Value = item.value;
                                child.permissibilityGlobal.Ch2Value = item.value;
                                child.permissibility.Ch2Highlight = 0;
                                break;
                              default:
                                break;
                            }
                          });
                          child.deviation = false;
                        }
                        // region
                        const parent = this.getParent(child);
                        const descendantsparent = this.treeControl.getDescendants(parent);
                        const condition1 = descendantsparent.filter(element => element.level === 3).length === descendantsparent
                          .filter(element => element.level === 3 && element.selected === true).length;
                        const condition = descendantsparent.filter(element => element.level === 3 && element.selected === true).length === descendantsparent
                          .filter(element => element.level === 3 && element.deviation === false && element.selected === true).length;
                        if (!parent.selected || parent.selected) {
                          parent.selected = condition1 === true ? true : false;
                          parent.deviation = condition === false ? true : false;
                        }
                        // Area
                        const parentparent = this.getParent(parent);
                        const descendantsparentparent = this.treeControl.getDescendants(parentparent);
                        // tslint:disable-next-line: max-line-length
                        const condition2 = descendantsparentparent.filter(element => element.level === 2).length === descendantsparentparent
                          .filter(element => element.level === 2 && element.selected === true).length;
                        if (!parentparent.selected || parentparent.selected) {
                          parentparent.selected = condition2 === true ? true : false;
                          if (!parentparent.deviation) {
                            parentparent.deviation = parent.deviation;
                          }
                        }
                      }
                    });
                    this.cdRef.detectChanges();
                }
              }
            });
          }

        }
      });
    }
  }
}
showAll(action: string) { // function to expand or hide the tree
  this.showHideButton = !this.showHideButton;
  if (action === 'show') {
    this.treeControl.expandAll();
  } else if ( action === 'hide') {
    this.treeControl.collapseAll();
    this.openDefaultLevel();
  }
  this.cdRef.detectChanges();
}
getCountry() {
  this.countriesService.fetchCountries().subscribe(
    (data: any) => {
      this.fillDefaultTree(data);
      this.openDefaultLevel();
      this.country = data;
      this.ngAfterViewInit();
    },
    errorService => {
      console.log('error endpoint', errorService.message);
    }
  );
}
back = () => this.location.back();
fillDefaultTree(data) { // Fill tree template by Area and Region
  this.locations[0].children[0].children[0].children = data.america.filter(e => e.region === 'BBC');
  this.locations[0].children[0].children[1].children = data.america.filter(e => e.region === 'Canada');
  this.locations[0].children[0].children[2].children = data.america.filter(e => e.region === 'EYC');
  this.locations[0].children[0].children[3].children = data.america.filter(e => e.region === 'Israel');
  this.locations[0].children[0].children[4].children = data.america.filter(e => e.region === 'LAN');
  this.locations[0].children[0].children[5].children = data.america.filter(e => e.region === 'LAS');
  this.locations[0].children[0].children[6].children = data.america.filter(e => e.region === 'US');
  this.locations[0].children[1].children[0].children = data.emeia.filter(e => e.region === 'Africa');
  this.locations[0].children[1].children[1].children = data.emeia.filter(e => e.region === 'CESA');
  this.locations[0].children[1].children[2].children = data.emeia.filter(e => e.region === 'GSA');
  this.locations[0].children[1].children[3].children = data.emeia.filter(e => e.region === 'India');
  this.locations[0].children[1].children[4].children = data.emeia.filter(e => e.region === 'Mediterranean');
  this.locations[0].children[1].children[5].children = data.emeia.filter(e => e.region === 'MENA');
  this.locations[0].children[1].children[6].children = data.emeia.filter(e => e.region === 'Nordics');
  this.locations[0].children[1].children[7].children = data.emeia.filter(e => e.region === 'UK&I');
  this.locations[0].children[1].children[8].children = data.emeia.filter(e => e.region === 'WEM');
  this.locations[0].children[2].children[0].children = data.asia.filter(e => e.region === 'ASEAN');
  this.locations[0].children[2].children[1].children = data.asia.filter(e => e.region === 'Greater China');
  this.locations[0].children[2].children[2].children = data.asia.filter(e => e.region === 'Korea');
  this.locations[0].children[2].children[3].children = data.asia.filter(e => e.region === 'Oceania');
  this.locations[0].children[2].children[4].children = data.asia.filter(e => e.region === 'Japan');
  this.dataSource.data = this.locations; // Send template to the tree
}
getlocations() {
  this.serviceService.getLocationOffering(this.serviceId).subscribe((data: any) => {
    this.locationDatabase = data;
    this.loading = false;
  },
  errorService => console.log('error endpoint', errorService.message));
}
openDefaultLevel() { // open Area level
  this.treeControl.dataNodes.map(node => {
    if (node.name === 'Global') {
      this.treeControl.expand(node);
    }
  });
}

/**** Default function for the pre-made component with some custom stuff ****/
hasChild = (_: number, node: LocationFiltreBoxChildNode) => node.expandable;
getLevel = (node: LocationFiltreBoxChildNode) => node.level;

/** Whether part of the descendants are selected */
descendantsPartiallySelected(node: LocationFiltreBoxChildNode): boolean {
  if (this.ready) {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => child.selected === true);
    return result && !this.descendantsAllSelected(node);
  }
  return false;
}
descendantsAllSelected(node: LocationFiltreBoxChildNode): boolean {
  const descendants = this.treeControl.getDescendants(node);
  const descAllSelected = descendants.every(child => child.selected === true );
  return descAllSelected;
}

allItemSelectionToggle(node: LocationFiltreBoxChildNode): void {
  this.ready = true;
  if (node.level === 0) {
    // Global
    node.selected = !node.selected;
    const descendants = this.treeControl.getDescendants(node);
    descendants.map(child => child.selected = node.selected);
  }
  if (node.level === 1) {
    // Areas
    node.selected = !node.selected;
    const parent = this.getParent(node);
    const descendants = this.treeControl.getDescendants(node);
    const descendantsparent = this.treeControl.getDescendants(parent);
    descendants.map(child => child.selected = node.selected);
    const condition = descendantsparent.filter(e => e.level === 1).length === descendantsparent.filter(e => e.level === 1 && e.selected === true).length;
    parent.selected = condition === true ? true : false;
  }
  if (node.level === 2) {
    // Region
    node.selected = !node.selected;
    const parent = this.getParent(node);
    const parentparent = this.getParent(parent);
    const descendantsparent = this.treeControl.getDescendants(parent);
    const descendantsparentparent = this.treeControl.getDescendants(parentparent);
    const descendants = this.treeControl.getDescendants(node);
    descendants.map(child => child.selected = node.selected);
    const condition = descendantsparent.filter(e => e.level === 2).length === descendantsparent.filter(e => e.level === 2 && e.selected === true).length;
    parent.selected = condition === true ? true : false;
    const condition2 = descendantsparentparent.filter(e => e.level === 1).length === descendantsparentparent.filter(e => e.level === 1 && e.selected === true).length;
    parentparent.selected = condition2 === true ? true : false;
  }
  if (node.level === 3) {
    node.selected = !node.selected;
    const parent = this.getParent(node);
    const parentparent = this.getParent(parent);
    const parentparentparent = this.getParent(parentparent);
    const descendantsparent = this.treeControl.getDescendants(parent);
    const descendantsparentparent = this.treeControl.getDescendants(parentparent);
    const descendantsparentparentparent = this.treeControl.getDescendants(parentparentparent);
    const condition = descendantsparent.length === descendantsparent.filter(e => e.level === 3 && e.selected === true).length;
    parent.selected = condition === true ? true : false;
    const condition2 = descendantsparentparent.filter(e => e.level === 2).length === descendantsparentparent.filter(e => e.level === 2 && e.selected === true).length;
    parentparent.selected = condition2 === true ? true : false;
    const condition3 = descendantsparentparentparent.filter(e => e.level === 1).length === descendantsparentparentparent.filter(e => e.level === 1 && e.selected === true).length;
    parentparentparent.selected = condition3 === true ? true : false;
  }
  this.descendantsPartiallySelected(node);
}
getParent(node: LocationFiltreBoxChildNode) {
  const currentLevel = this.getLevel(node);
  if (currentLevel < 1) {
    return null;
  }
  const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
  for (let i = startIndex; i >= 0; i--) {
    const currentNode = this.treeControl.dataNodes[i];
    if (this.getLevel(currentNode) < currentLevel) {
      return currentNode;
    }
  }
}
cleanTree = () => this.treeControl.dataNodes.map(e => e.selected = false);
/**** End Default function for the pre-made component with some custom stuff  ****/
  getPermissibilityById() {
    this.permissibilityLocal = [];
    this.serviceService.getPermissibilityById(this.serviceId).subscribe(e => {
      if (e.Considerations && e.Considerations.length > 0) {
        this.permissibilityGlobal = e.Considerations.filter(permissibility => permissibility.CountryCode === 'GLB').length > 0 ? e.Considerations.filter(item => item.CountryCode === 'GLB')[0] : {};
        if (this.permissibilityGlobal.IdConsiderations){
          this.permissibilityGlobal = {
            ...this.permissibilityGlobal,
            Ch1Highlight: 0,
            Ch1NsaHighlight: 0,
            Ch2Highlight: 0,
            EuAuditedNoValuationHighlight: 0,
            EuauditedHighlight: 0,
            EusubjectHighlight: 0,
            OtAuditedHighlight: 0,
            OtSubjectHighlight: 0,
            SecauditedHighlight: 0,
            SecsubjectHighlight: 0
          };
        }
        const groupByCountry = e.Considerations.filter((countryPermissibility: any) => countryPermissibility.CountryCode !== 'GLB');
        const templatePermissibilityLocal = [];
        if (groupByCountry.length > 0) { // Transform all local data to the tree template
        groupByCountry.map(option => {
          const temp = {
            deviation: false,
            expandable: false,
            level: 3,
            name: option.CountryCode,
            permissibility: {
              SecauditedValue: option.SecauditedValue,
              SecsubjectValue: option.SecsubjectValue,
              EuauditedValue: option.EuauditedValue,
              EusubjectValue: option.EusubjectValue,
              EuAuditedNoValuationValue: option.EuAuditedNoValuationValue,
              OtAuditedValue: option.OtAuditedValue,
              OtSubjectValue: option.OtSubjectValue,
              Ch1Value: option.Ch1Value,
              Ch1NsaValue: option.Ch1nsaValue === null ? '' : option.Ch1nsaValue,
              Ch2Value: option.Ch2Value,
              deviationCh1Value: option.Ch1Value === this.permissibilityGlobal.Ch1Value ? false : true,
              deviationCh1NsaValue: option.Ch1nsaValue === this.permissibilityGlobal.Ch1nsaValue ? false : true,
              deviationCh2Value: option.Ch2Value === this.permissibilityGlobal.Ch2Value ? false : true,
              deviationEuAuditedNoValuationValue: option.EuAuditedNoValuationValue === this.permissibilityGlobal.EuAuditedNoValuationValue ? false : true,
              deviationEuauditedValue: option.EuauditedValue === this.permissibilityGlobal.EuauditedValue ? false : true,
              deviationEusubjectValue: option.EusubjectValue === this.permissibilityGlobal.EusubjectValue ? false : true,
              deviationOtAuditedValue: option.OtAuditedValue === this.permissibilityGlobal.OtAuditedValue ? false : true,
              deviationOtSubjectValue: option.OtSubjectValue === this.permissibilityGlobal.OtSubjectValue ? false : true,
              deviationSecauditedValue: option.SecauditedValue === this.permissibilityGlobal.SecauditedValue ? false : true,
              deviationSecsubjectValue: option.SecsubjectValue === this.permissibilityGlobal.SecsubjectValue ? false : true,
              SecauditedHighlight: 0,
              SecsubjectHighlight: 0,
              EuauditedHighlight: 0,
              EusubjectHighlight: 0,
              EuAuditedNoValuationHighlight: 0,
              OtAuditedHighlight: 0,
              OtSubjectHighlight: 0,
              Ch1Highlight: 0,
              Ch1NsaHighlight: 0,
              Ch2Highlight: 0
            },
            permissibilityGlobal: {
              SecauditedValue: this.permissibilityGlobal.SecauditedValue,
              SecsubjectValue: this.permissibilityGlobal.SecsubjectValue,
              EuauditedValue: this.permissibilityGlobal.EuauditedValue,
              EusubjectValue: this.permissibilityGlobal.EusubjectValue,
              EuAuditedNoValuationValue: this.permissibilityGlobal.EuAuditedNoValuationValue,
              OtAuditedValue: this.permissibilityGlobal.OtAuditedValue,
              OtSubjectValue: this.permissibilityGlobal.OtSubjectValue,
              Ch1Value: this.permissibilityGlobal.Ch1Value,
              Ch1NsaValue: this.permissibilityGlobal.Ch1nsaValue === null ? '' : this.permissibilityGlobal.Ch1nsaValue,
              Ch2Value: this.permissibilityGlobal.Ch2Value,
              deviationCh1Value: false,
              deviationCh1NsaValue: false,
              deviationCh2Value: false,
              deviationEuAuditedNoValuationValue: false,
              deviationEuauditedValue: false,
              deviationEusubjectValue: false,
              deviationOtAuditedValue: false,
              deviationOtSubjectValue: false,
              deviationSecauditedValue: false,
              deviationSecsubjectValue: false,
              SecauditedHighlight: 0,
              SecsubjectHighlight: 0,
              EuauditedHighlight: 0,
              EusubjectHighlight: 0,
              EuAuditedNoValuationHighlight: 0,
              OtAuditedHighlight: 0,
              OtSubjectHighlight: 0,
              Ch1Highlight: 0,
              Ch1NsaHighlight: 0,
              Ch2Highlight: 0
            }
          };
          templatePermissibilityLocal.push(temp);
        });
      }
        if (this.permissibilityGlobal.IdConsiderations !== undefined) {
        Object.keys(this.permissibilityGlobal).map(item => {
          switch (item) {
            case 'SecauditedValue':
              if (this.permissibilityGlobal.SecauditedValue !== '') {
                const temp = {column: 'SecauditedValue', value: this.permissibilityGlobal.SecauditedValue};
                this.selectedColumn.push(temp);
              }
              break;
            case 'SecsubjectValue':
              if (this.permissibilityGlobal.SecsubjectValue !== '') {
                const temp = {column: 'SecsubjectValue', value: this.permissibilityGlobal.SecsubjectValue};
                this.selectedColumn.push(temp);
              }
              break;
            case 'EuauditedValue':
              if (this.permissibilityGlobal.EuauditedValue !== '') {
                const temp = {column: 'EuauditedValue', value: this.permissibilityGlobal.EuauditedValue};
                this.selectedColumn.push(temp);
              }
              break;
            case 'EusubjectValue':
              if (this.permissibilityGlobal.EusubjectValue !== '') {
                const temp = {column: 'EusubjectValue', value: this.permissibilityGlobal.EusubjectValue};
                this.selectedColumn.push(temp);
              }
              break;
            case 'EuAuditedNoValuationValue':
              if (this.permissibilityGlobal.EuAuditedNoValuationValue !== '') {
                const temp = {column: 'EuAuditedNoValuationValue', value: this.permissibilityGlobal.EuAuditedNoValuationValue};
                this.selectedColumn.push(temp);
              }
              break;
            case 'OtAuditedValue':
              if (this.permissibilityGlobal.OtAuditedValue !== '') {
                const temp = {column: 'OtAuditedValue', value: this.permissibilityGlobal.OtAuditedValue};
                this.selectedColumn.push(temp);
              }
              break;
            case 'OtSubjectValue':
              if (this.permissibilityGlobal.OtSubjectValue !== '') {
                const temp = {column: 'OtSubjectValue', value: this.permissibilityGlobal.OtSubjectValue};
                this.selectedColumn.push(temp);
              }
              break;
            case 'Ch1Value':
              if (this.permissibilityGlobal.Ch1Value !== '') {
                const temp = {column: 'Ch1Value', value: this.permissibilityGlobal.Ch1Value};
                this.selectedColumn.push(temp);
              }
              break;
            case 'Ch1nsaValue':
              if (this.permissibilityGlobal.Ch1nsaValue !== '') {
                const temp = {column: 'Ch1NsaValue', value: this.permissibilityGlobal.Ch1nsaValue};
                this.selectedColumn.push(temp);
              }
              break;
            case 'Ch2Value':
              if (this.permissibilityGlobal.Ch2Value !== '') {
                const temp = {column: 'Ch2Value', value: this.permissibilityGlobal.Ch2Value};
                this.selectedColumn.push(temp);
              }
              break;
            default:
              break;
          }
        });

      }
        this.permissibilityLocal = templatePermissibilityLocal;
        if (this.permissibilityLocal.length > 0) {
          const listOfLocations = this.permissibilityLocal;
          if (this.country.all && this.country.all.length > 0) { // Local piece
            if (listOfLocations.length > 0) {
              listOfLocations.map(item => {
                if (this.country.all.filter(c => c.countryCode === item.name).length > 0) { // Tree use full name of country, Database only send countryCode, replace countryCode with countryName in name variable
                  item.name = this.country.all.filter(c => c.countryCode === item.name)[0].countryName;
                }
              });
              this.nodePermissibility = listOfLocations;
              this.ngAfterViewInit();
            }
          }
         }
      }
      this.copyPermissibilityGlobal = _.cloneDeep(this.permissibilityGlobal);
      this.permissibilityGlobal = _.cloneDeep(this.permissibilityGlobal);
      this.permissibilityLocal = _.cloneDeep(this.permissibilityLocal);
    });
    if (this.filter.client.GISId && this.permissibilityGlobal.IdConsiderations) {
      if (this.filter.client.permissibility.length > 0) {
        const override = [];
        _.forOwn(this.filter.client.permissibility[0], (value, key) => {
          if (value === 'override') {
            override.push(key);
          }
        });
        this.tokenOverride = override;
        if (this.tokenOverride.length > 0) {
          this.overrideBasedToken();
        }
        this.highlightColum();
      }
    }
  }
  getColumndata(slcode) {
    return this.permissibilityservice.getColumndata(slcode)
      .subscribe(data => {
        this.item = data;
        this.permsibilityget = data;
        this.showcoloumn();
        this.loadingResult = false;
        setTimeout(() => {
          this.menuPosition = this.menuElement.nativeElement.offsetTop + 20;
        }, 2000);
      });
  }
  showcoloumn = () => this.columns =  this.permsibilityget && this.permsibilityget.Euchannel1Piethree !== null ? 10 : 9;
  getIndependenceRestrictionOption() {
    return this.permissibilityservice.getIndependenceIcons()
      .subscribe(data => {
        if (data.length > 0) {
          this.iconArray = data.map(e => ({
            icon: e.Icon,
            value: e.Prefix,
            class: 'material-icons mat-icon_cust',
            color: e.Color
          }));
          this.getPermissibilityById();
        }
      });
  }
  getServiceDetail() {
    this.serviceService.getServiceDetailById(this.serviceId).subscribe(res => {
      this.greyBarData.serviceTitle = res.ServiceTitle;
      if (res.OriginService !== null && res.OriginService.Prefix !== undefined) {
        this.greyBarData.originOfService = res.OriginService.Prefix;
      }
      if (res.ServiceLine.length > 0) { // If exist a service line, initialize serviceline object
        this.slcode = res.ServiceLine[0].ServiceLineCode.toString();
        this.enableThirdColumn = res.ServiceLine[0].ServiceLineCode.toString() === '02' || res.ServiceLine[0].ServiceLineCode.toString() === '07' ? true : false;
        this.getColumndata(res.ServiceLine[0].ServiceLineCode);
        this.greyBarData.serviceLinePrefix = res.ServiceLine[0].ServiceLinePrefix;
        
        if (this.filter.client.GISId && this.permissibilityGlobal.IdConsiderations) {
          if (this.filter.client.permissibility.length > 0) {
            const override = [];
            _.forOwn(this.filter.client.permissibility[0], (value, key) => {
              if (value === 'override') {
                override.push(key);
              }
            });
            this.tokenOverride = override;
            if (this.tokenOverride.length > 0) {
              this.overrideBasedToken();
            }
            this.highlightColum();
          }
        }


      }
    });
  }
  overrideBasedToken() {
    this.countriesService.overridePermissibility(this.serviceId, this.tokenOverride).subscribe(e => {
    const other = e.map(ele => ({...ele, ColumnName: this.overWriteRestrictions.filter(i => i.method === ele.column)[0].template }));
    if (other.filter(item => item.value === null).length === 0) { // means the service is not offered in UK
      _.forOwn(this.permissibilityGlobal, (value, key) => {
        const match = other.filter(item => item.ColumnName.toUpperCase() === key.toUpperCase()  && item.value !== null);
        if (match.length > 0) {
            this.permissibilityGlobal[key] = match[0].value;
            const treeNodes = this.treeControl.dataNodes.filter(item => item.selected && item.level === 3);
            if (treeNodes.length > 0) {
              treeNodes.map(item => {
                item.permissibility[key] = match[0].value;
                item.permissibilityGlobal[key] = match[0].value;
              });
            }
            this.OverRideUK = true;
          }
        });
      if (this.OverRideUK) {
         this.getHighLightItem(this.filter);
      }
    }
    });
  }

}
