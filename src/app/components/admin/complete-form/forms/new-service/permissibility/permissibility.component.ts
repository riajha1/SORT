import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';

import { PermissibilityService, ServiceService } from 'src/app/providers/provider.index';
import { LocationFilterDropdownNode, LocationFiltreDropdownChildNode, LocationFilterNode, Permissibilitygetmodel } from 'src/app/models/model.index';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-permissibility',
  templateUrl: './permissibility.component.html',
  styleUrls: ['./permissibility.component.scss']
})
export class PermissibilityComponent implements OnInit, OnChanges, AfterViewInit {
  public Editor = ClassicEditor;
  public EditorReference: any;

  // input and output
  @Input() active: any;
  @Input() IdService: any = 0;
  @Input() serviceline: any;
  @Input() permissibilityGlobal: any = [];
  @Input() permissibilityLocal: any = [];
  @Input() tree: LocationFilterNode[] = [];
  @Input() countryList: Array<any> = [];
  @Input() locationsSaved: any = [];
  @Input() enableLocal: boolean = false;
  @Input() enableExpandTree: string = '';
  @Input() readonly;

  @Output() updateProgress: EventEmitter<any>;
  @Output() getPermissibilityById: EventEmitter<any>;


  // component variables
  loading = true;
  enableThirdColumn: boolean = false;
  readyTree: boolean = false;
  selectedColumn: any = [];
  selectedColumnName: any = [];
  defaultColor = '#2E2E38';

  // forceTree: boolean = false;
  loadingResult = true;
  permsibilityget: Permissibilitygetmodel;
  item = [];
  columns = 0;  // number of columns to calculate progress
  nodePermissibility: any = [];
  selectrestriction: FormGroup;
  showHideButton: boolean = true;
  savedOneTime: boolean = false;
  activitityBtnName;
  activitityGetText;
  activityGetDataStore;
  iconArray = [];
  constructor(private cdRef: ChangeDetectorRef,
              private permissibilityservice: PermissibilityService,
              private serviceservice: ServiceService,
              private modalService: NgbModal,
              private fb: FormBuilder) {
    this.permsibilityget = new Permissibilitygetmodel();
    // initialize event to emit - OUTPUT
    this.updateProgress = new EventEmitter();
    this.getPermissibilityById = new EventEmitter();
  }
  ngOnInit() {
    this.initializeForm();
    this.getIndependenceRestrictionOption();

    this.getActivityGriddata();
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'serviceline': {
            if (this.serviceline) {
              if (this.serviceline.SLcode !== 0) {
                this.getColumndata();
                this.enableThirdColumn = this.serviceline.SLcode.toString() === '02' || this.serviceline.SLcode.toString() === '07' ? true : false;
              }
            }
            break;
          }
          case 'tree': {
            if (this.tree.length > 0) {
              this.dataSource.data = this.tree;
              this.loading = false;
              this.openDefaultLevel();
            }
            break;
          }
          case 'permissibilityGlobal': {
            if (this.permissibilityGlobal.IdConsiderations !== undefined) {
              this.initializeForm(this.permissibilityGlobal);
              this.savedOneTime = true;
            }
            break;
          }
          case 'permissibilityLocal': {
            if (this.permissibilityLocal.length > 0 && this.countryList.length > 0) {
              this.initializeVariablesLocal(this.permissibilityLocal);
              this.loadingToGetSavedData();
              this.savedOneTime = true;
            }
            break;
          }
          case 'countryList': {
            if (this.countryList.length > 0) {
              this.initializeVariablesLocal(this.permissibilityLocal);
              this.loadingToGetSavedData();
            }
            break;
          }
          case 'locationsSaved': {
            if (this.locationsSaved.length > 0) {
              this.updateTreeSelection();
            }
            break;
          }
        }
      }
    }
  }
  ngAfterViewInit() {
    // Logic to selected all locations in the tree selected in location component
    if (this.locationsSaved.length > 0 ) {
      this.readyTree = true;
      let isGlobal = false;
      isGlobal = this.locationsSaved.find((e: any) => e.CountryCode === 'GLB');
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
                      break;
                    case 'SecsubjectValue':
                      if (!node.permissibility.deviationSecsubjectValue) {
                        node.permissibility.SecsubjectValue = item.value;
                      } else {
                        if (node.permissibility.SecsubjectValue === item.value) {
                          node.permissibility.deviationSecsubjectValue = false;
                        }
                      }
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
                      break;
                    case 'SecsubjectValue':
                      node.permissibility.SecsubjectValue = item.value;
                      node.permissibilityGlobal.SecsubjectValue = item.value;
                      break;
                    case 'EuauditedValue':
                      node.permissibility.EuauditedValue =  item.value;
                      node.permissibilityGlobal.EuauditedValue =  item.value;
                      break;
                    case 'EusubjectValue':
                      node.permissibility.EusubjectValue = item.value;
                      node.permissibilityGlobal.EusubjectValue = item.value;
                      break;
                    case 'EuAuditedNoValuationValue':
                      node.permissibility.EuAuditedNoValuationValue = item.value;
                      node.permissibilityGlobal.EuAuditedNoValuationValue = item.value;
                      break;
                    case 'OtAuditedValue':
                      node.permissibility.OtAuditedValue =  item.value;
                      node.permissibilityGlobal.OtAuditedValue =  item.value;
                      break;
                    case 'OtSubjectValue':
                      node.permissibility.OtSubjectValue = item.value;
                      node.permissibilityGlobal.OtSubjectValue = item.value;
                      break;
                    case 'Ch1Value':
                      node.permissibility.Ch1Value = item.value;
                      node.permissibilityGlobal.Ch1Value = item.value;
                      break;
                    case 'Ch1NsaValue':
                      node.permissibility.Ch1NsaValue = item.value;
                      node.permissibilityGlobal.Ch1NsaValue = item.value;
                      break;
                    case 'Ch2Value':
                      node.permissibility.Ch2Value = item.value;
                      node.permissibilityGlobal.Ch2Value = item.value;
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
              if (!parent.selected) {
                parent.selected = condition === true ? true : false;
                if (!parent.deviation) {
                  parent.deviation = node.permissibility.deviationSecauditedValue || node.permissibility.deviationSecsubjectValue ||
                    node.permissibility.deviationEuauditedValue || node.permissibility.deviationEusubjectValue ||
                    node.permissibility.deviationEuAuditedNoValuationValue || node.permissibility.deviationOtAuditedValue ||
                    node.permissibility.deviationOtSubjectValue || node.permissibility.deviationCh1Value ||
                    node.permissibility.deviationCh1NsaValue || node.permissibility.deviationCh2Value ? true : false;
                }
              }
              // Area
              const parentparent = this.getParent(parent);
              const descendantsparentparent = this.treeControl.getDescendants(parentparent);
              const condition2 = descendantsparentparent.filter(element => element.level === 2).length === descendantsparentparent
                .filter(element => element.level === 2 && element.selected === true).length;
              if (!parentparent.selected) {
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
        // specific locations are selected
        this.locationsSaved.map(e => {
          const countryData = this.countryList.filter(item => item.countryCode === e.CountryCode);
          if (countryData) {
            if (this.treeControl.dataNodes !== undefined) {
              this.treeControl.dataNodes.map(node => {
                if (e.IsSelectedCountry) {
                  if (countryData[0] !== undefined){
                    if ( node.name === countryData[0].area ) {
                      const countries = this.treeControl.getDescendants(node);
                      countries.map(child => {
                        if (child.name === countryData[0].countryName && child.level === 3 ) {
                          const previousPermissibility = this.nodePermissibility.filter(storedNode => storedNode.level === child.level && storedNode.name === child.name);
                          if (!child.selected) {
                            child.selected = ! child.selected;
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
                                    break;
                                  case 'EuauditedValue':
                                    if (!child.permissibility.deviationEuauditedValue) {
                                      child.permissibility.EuauditedValue = item.value;
                                    } else {
                                      if (child.permissibility.EuauditedValue === item.value) {
                                        child.permissibility.deviationEuauditedValue = false;
                                      }
                                    }
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
                                    break;
                                  case 'Ch1Value':
                                    if (!child.permissibility.deviationCh1Value) {
                                      child.permissibility.Ch1Value = item.value;
                                    } else {
                                      if (child.permissibility.Ch1Value === item.value) {
                                        child.permissibility.deviationCh1Value = false;
                                      }
                                    }
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
                                    break;
                                  case 'SecsubjectValue':
                                    child.permissibility.SecsubjectValue = item.value;
                                    child.permissibilityGlobal.SecsubjectValue = item.value;
                                    break;
                                  case 'EuauditedValue':
                                    child.permissibility.EuauditedValue =  item.value;
                                    child.permissibilityGlobal.EuauditedValue =  item.value;
                                    break;
                                  case 'EusubjectValue':
                                    child.permissibility.EusubjectValue = item.value;
                                    child.permissibilityGlobal.EusubjectValue = item.value;
                                    break;
                                  case 'EuAuditedNoValuationValue':
                                    child.permissibility.EuAuditedNoValuationValue = item.value;
                                    child.permissibilityGlobal.EuAuditedNoValuationValue = item.value;
                                    break;
                                  case 'OtAuditedValue':
                                    child.permissibility.OtAuditedValue =  item.value;
                                    child.permissibilityGlobal.OtAuditedValue =  item.value;
                                    break;
                                  case 'OtSubjectValue':
                                    child.permissibility.OtSubjectValue = item.value;
                                    child.permissibilityGlobal.OtSubjectValue = item.value;
                                    break;
                                  case 'Ch1Value':
                                    child.permissibility.Ch1Value = item.value;
                                    child.permissibilityGlobal.Ch1Value = item.value;
                                    break;
                                  case 'Ch1NsaValue':
                                    child.permissibility.Ch1NsaValue = item.value;
                                    child.permissibilityGlobal.Ch1NsaValue = item.value;
                                    break;
                                  case 'Ch2Value':
                                    child.permissibility.Ch2Value = item.value;
                                    child.permissibilityGlobal.Ch2Value = item.value;
                                    break;
                                  default:
                                    break;
                                }
                              });
                              child.deviation = false;
                            }
                          }
                          // region
                          const parent = this.getParent(child);
                          const descendantsparent = this.treeControl.getDescendants(parent);
                          const condition1 = descendantsparent.filter(element => element.level === 3).length === descendantsparent
                            .filter(element => element.level === 3 && element.selected === true).length;
                          const condition = descendantsparent.filter(element => element.level === 3 && element.selected === true).length === descendantsparent
                            .filter(element => element.level === 3 && element.deviation === false && element.selected === true).length;
                          if (!parent.selected) {
                            parent.selected = condition1 === true ? true : false;
                            parent.deviation = condition === false ? true : false;
                          }
                          // Area
                          const parentparent = this.getParent(parent);
                          const descendantsparentparent = this.treeControl.getDescendants(parentparent);
                          // tslint:disable-next-line: max-line-length
                          const condition2 = descendantsparentparent.filter(element => element.level === 2).length === descendantsparentparent
                            .filter(element => element.level === 2 && element.selected === true).length;
                          if (!parentparent.selected) {
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
                  
                }
              });
            }
          }
        });
      }
    }
  }
  // to get the activity text
  getActivityGriddata() {
    this.serviceservice.getPermissibilityById(this.IdService).subscribe((data: any) => {
      this.activitityGetText = data.ActivityGrid === null ? '' : data.ActivityGrid;
      this.activityGetDataStore = this.activitityGetText;
      this.activitityBtnName = this.activityGetDataStore;
    });
  }
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
        }
      });
  }
  showcoloumn = () => this.columns =  this.permsibilityget && this.permsibilityget.Euchannel1Piethree !== null ? 10 : 9;
  initializeForm(data: any = {}) {
    if (data.IdConsiderations !== undefined) {
      this.selectedColumn = [];
      this.selectedColumnName = [];
      this.savedOneTime = true;
      this.selectrestriction = this.fb.group({
        idservice: new FormControl(this.IdService),
        countrycode: new FormControl('GLB'),
        SecauditedValue: [data.SecauditedValue],
        SecsubjectValue: [data.SecsubjectValue],
        EuauditedValue: [data.EuauditedValue],
        EusubjectValue: [data.EusubjectValue],
        EuAuditedNoValuationValue: [data.EuAuditedNoValuationValue],
        OtAuditedValue: [data.OtAuditedValue],
        OtSubjectValue: [data.OtSubjectValue],
        Ch1Value: [data.Ch1Value],
        Ch1NsaValue: [data.Ch1nsaValue === null ? '' : data.Ch1nsaValue],
        Ch2Value: [data.Ch2Value],
      });
      // Complete variables to enable dropdowns in the tree
      Object.keys(data).map(item => {
        switch (item) {
          case 'SecauditedValue':
            if (data.SecauditedValue !== '') {
              const temp = {column: 'SecauditedValue', value: data.SecauditedValue};
              this.selectedColumn.push(temp);
              this.selectedColumnName.push('SecauditedValue');
            }
            break;
          case 'SecsubjectValue':
            if (data.SecsubjectValue !== '') {
              const temp = {column: 'SecsubjectValue', value: data.SecsubjectValue};
              this.selectedColumn.push(temp);
              this.selectedColumnName.push('SecsubjectValue');
            }
            break;
          case 'EuauditedValue':
            if (data.EuauditedValue !== '') {
              const temp = {column: 'EuauditedValue', value: data.EuauditedValue};
              this.selectedColumn.push(temp);
              this.selectedColumnName.push('EuauditedValue');
            }
            break;
          case 'EusubjectValue':
            if (data.EusubjectValue !== '') {
              const temp = {column: 'EusubjectValue', value: data.EusubjectValue};
              this.selectedColumn.push(temp);
              this.selectedColumnName.push('EusubjectValue');
            }
            break;
          case 'EuAuditedNoValuationValue':
            if (data.EuAuditedNoValuationValue !== '') {
              const temp = {column: 'EuAuditedNoValuationValue', value: data.EuAuditedNoValuationValue};
              this.selectedColumn.push(temp);
              this.selectedColumnName.push('EuAuditedNoValuationValue');
            }
            break;
          case 'OtAuditedValue':
            if (data.OtAuditedValue !== '') {
              const temp = {column: 'OtAuditedValue', value: data.OtAuditedValue};
              this.selectedColumn.push(temp);
              this.selectedColumnName.push('OtAuditedValue');
            }
            break;
          case 'OtSubjectValue':
            if (data.OtSubjectValue !== '') {
              const temp = {column: 'OtSubjectValue', value: data.OtSubjectValue};
              this.selectedColumn.push(temp);
              this.selectedColumnName.push('OtSubjectValue');
            }
            break;
          case 'Ch1Value':
            if (data.Ch1Value !== '') {
              const temp = {column: 'Ch1Value', value: data.Ch1Value};
              this.selectedColumn.push(temp);
              this.selectedColumnName.push('Ch1Value');
            }
            break;
          case 'Ch1nsaValue':
            if (data.Ch1nsaValue !== '') {
              const temp = {column: 'Ch1NsaValue', value: data.Ch1nsaValue};
              this.selectedColumn.push(temp);
              this.selectedColumnName.push('Ch1NsaValue');
            }
            break;
          case 'Ch2Value':
            if (data.Ch2Value !== '') {
              const temp = {column: 'Ch2Value', value: data.Ch2Value};
              this.selectedColumn.push(temp);
              this.selectedColumnName.push('Ch2Value');
            }
            break;
          default:
            break;
        }
      });
    } else {
      this.selectrestriction = this.fb.group({
        idservice: new FormControl(this.IdService),
        countrycode: new FormControl('GLB'),
        SecauditedValue: [''],
        SecsubjectValue: [''],
        EuauditedValue: [''],
        EusubjectValue: [''],
        EuAuditedNoValuationValue: [''],
        OtAuditedValue: [''],
        OtSubjectValue: [''],
        Ch1Value: [''],
        Ch1NsaValue: [''],
        Ch2Value: [''],
      });
    }
  }
  initializeVariablesLocal(locations) {
    const listOfLocations = locations;
    if (this.countryList.length > 0) { // Local piece
      if (listOfLocations.length > 0) {
        listOfLocations.map(item => {
          if (this.countryList.filter(c => c.countryCode === item.name).length > 0) { // Tree use full name of country, Database only send countryCode, replace countryCode with countryName in name variable
            item.name = this.countryList.filter(c => c.countryCode === item.name)[0].countryName;
          }
        });
        this.nodePermissibility = listOfLocations;
        this.savedOneTime = true;
        this.ngAfterViewInit();
      }
    }
  }
  getColumndata() {
    return this.permissibilityservice.getColumndata(this.serviceline.SLcode)
      .subscribe(data => {
        this.loadingResult = false;
        this.item = data;
        this.permsibilityget = data;
        this.showcoloumn();
      });
  }
  loadingToGetSavedData(close = false) {
    if (close === false) {
      Swal.close();
    } else {
      Swal.fire({
        title: '',
        html: '<i class="material-icons material-spin material-2x">sync</i>',
        allowOutsideClick: false,
        showConfirmButton: false,
        onOpen(this) {}
      });
    }
  }
  activityGridModal = (content) => this.modalService.open(content , { size: 'xl' });
  enableColumn(column: string, value: string) {
    const temp = { column, value };
    const filterColumn = this.selectedColumn.filter(e => e.column !== column);
    const filterColumnName = this.selectedColumnName.filter(e => e !== column);
    if (value !== '') { // when a value is '' means that the user selected the option select in Global
      filterColumnName.push(column);  // send tree-dropdown the new value of the column and dropdown
    }
    filterColumn.push(temp);
    this.selectedColumn = filterColumn;
    this.selectedColumnName = filterColumnName;
    this.updateTreeSelection();
    this.showHideButton = true;
  }
  Submit() {
    if (this.selectrestriction.status === 'VALID') {
      this.savedOneTime = true;
      const Global = [{
        countrycode: 'GLB',
        serviceLineCode: this.serviceline.SLcode.toString(),
        Secaudited: this.permsibilityget.Secchannel1Pieone,
        Secsubject: this.permsibilityget.Secchannel1Pietwo,
        Euaudited: this.permsibilityget.Euchannel1Pieone,
        Eusubject: this.permsibilityget.Euchannel1Pietwo,
        EuAuditedNoValuation: this.permsibilityget.Euchannel1Piethree === null ? '' : this.permsibilityget.Euchannel1Piethree,
        OtAudited: this.permsibilityget.OtherChannel1Pieone,
        OtSubject: this.permsibilityget.OtherChannel1Pietwo,
        Ch1: this.permsibilityget.OtherChannel1 === null ? '' : this.permsibilityget.OtherChannel1,
        Ch1Nsa: this.permsibilityget.OtherChannel1Nsa === null ? '' : this.permsibilityget.OtherChannel1Nsa,
        Ch2: this.permsibilityget.Channel2 === null ? '' : this.permsibilityget.Channel2,
        ...this.selectrestriction.value,
      }];
      Global[0].idservice = this.IdService;
      // logic to calculate progress with permissibility selected by the user
      let totalMandatoryElement = 0;
      Object.keys(Global[0]).map(column => {
        switch (column) {
          case 'SecauditedValue':
            if (Global[0].SecauditedValue !== '') {
              totalMandatoryElement += 1;
            }
            break;
          case 'SecsubjectValue':
            if (Global[0].SecsubjectValue !== '') {
              totalMandatoryElement += 1;
            }
            break;
          case 'OtSubjectValue':
            if (Global[0].OtSubjectValue !== '') {
              totalMandatoryElement += 1;
            }
            break;
          case 'OtAuditedValue':
            if (Global[0].OtAuditedValue !== '') {
              totalMandatoryElement += 1;
            }
            break;
          case 'EusubjectValue':
            if (Global[0].EusubjectValue !== '') {
              totalMandatoryElement += 1;
            }
            break;
          case 'EuauditedValue':
            if (Global[0].EuauditedValue !== '') {
              totalMandatoryElement += 1;
            }
            break;
          case 'EuAuditedNoValuationValue':
            if (Global[0].EuAuditedNoValuationValue !== '') {
              if (this.serviceline.SLcode !== 0) {
                if (this.serviceline.SLcode === '02' || this.serviceline.SLcode === '07' || this.serviceline.SLcode === 2 || this.serviceline.SLcode === 7) {
                  totalMandatoryElement += 1;
                }
              }
            }
            break;
          case 'Ch2Value':
            if (Global[0].Ch2Value !== '') {
              totalMandatoryElement += 1;
            }
            break;
          case 'Ch1Value':
            if (Global[0].Ch1Value !== '') {
              totalMandatoryElement += 1;
            }
            break;
          case 'Ch1NsaValue':
            if (Global[0].Ch1NsaValue !== '') {
              totalMandatoryElement += 1;
            }
            break;
          default:
            break;
        }
      });
      const progress = {
        title: 'Independence Permissibility',
        progress: Math.round((totalMandatoryElement * 100) / this.columns) > 100 ? 100 : Math.round((totalMandatoryElement * 100) / this.columns)
      };
      // Transforming each location's node to the object to save in DB
      const groupAllLocations = [];
      let locationsToSave = this.locationsSaved;
      this.nodePermissibility.map((node: any) => {
        if (node.level === 3) { // Location node
        if (this.countryList.filter(c => c.countryName === node.name).length > 0) {
          const countryCode = this.countryList.filter(c => c.countryName === node.name)[0].countryCode; // Filter node name to get countrycode
          if (this.locationsSaved.map(l => l.CountryCode).includes(countryCode)) { // Validate if that node is a valid location saved
            const countryCodeLocation = this.countryList.filter(c => c.countryName === node.name)[0].countryCode;
            const newNode = { // Create object to save in database
              idservice: this.IdService,
              countrycode: countryCodeLocation,
              serviceLineCode: this.serviceline.SLcode.toString(),
              Secaudited: this.permsibilityget.Secchannel1Pieone,
              Secsubject: this.permsibilityget.Secchannel1Pietwo,
              Euaudited: this.permsibilityget.Euchannel1Pieone,
              Eusubject: this.permsibilityget.Euchannel1Pietwo,
              EuAuditedNoValuation: this.permsibilityget.Euchannel1Piethree === null ? '' : this.permsibilityget.Euchannel1Piethree,
              OtAudited: this.permsibilityget.OtherChannel1Pieone,
              OtSubject: this.permsibilityget.OtherChannel1Pietwo,
              Ch1: this.permsibilityget.OtherChannel1 === null ? '' : this.permsibilityget.OtherChannel1,
              Ch1Nsa: this.permsibilityget.OtherChannel1Nsa === null ? '' : this.permsibilityget.OtherChannel1Nsa,
              Ch2: this.permsibilityget.Channel2 === null ? '' : this.permsibilityget.Channel2,
              SecauditedValue: node.permissibility.SecauditedValue,
              SecsubjectValue: node.permissibility.SecsubjectValue,
              EuauditedValue: node.permissibility.EuauditedValue,
              EusubjectValue: node.permissibility.EusubjectValue,
              EuAuditedNoValuationValue: node.permissibility.EuAuditedNoValuationValue,
              OtAuditedValue: node.permissibility.OtAuditedValue,
              OtSubjectValue: node.permissibility.OtSubjectValue,
              Ch1Value: node.permissibility.Ch1Value,
              Ch1NsaValue: node.permissibility.Ch1NsaValue,
              Ch2Value: node.permissibility.Ch2Value
            };
            groupAllLocations.push(newNode);
            locationsToSave = locationsToSave.filter(e => e.CountryCode !== countryCodeLocation); // Location that missing to create the object
          }
        }
        }
      });
      if (locationsToSave.length > 0) {
        locationsToSave.map(e => {
          const newNode = { // Create object to save in database
            idservice: this.IdService,
            countrycode: e.CountryCode,
            serviceLineCode: this.serviceline.SLcode.toString(),
            Secaudited: this.permsibilityget.Secchannel1Pieone,
            Secsubject: this.permsibilityget.Secchannel1Pietwo,
            Euaudited: this.permsibilityget.Euchannel1Pieone,
            Eusubject: this.permsibilityget.Euchannel1Pietwo,
            EuAuditedNoValuation: this.permsibilityget.Euchannel1Piethree === null ? '' : this.permsibilityget.Euchannel1Piethree,
            OtAudited: this.permsibilityget.OtherChannel1Pieone,
            OtSubject: this.permsibilityget.OtherChannel1Pietwo,
            Ch1: this.permsibilityget.OtherChannel1 === null ? '' : this.permsibilityget.OtherChannel1,
            Ch1Nsa: this.permsibilityget.OtherChannel1Nsa === null ? '' : this.permsibilityget.OtherChannel1Nsa,
            Ch2: this.permsibilityget.Channel2 === null ? '' : this.permsibilityget.Channel2,
            SecauditedValue: this.selectrestriction.value.SecauditedValue,
            SecsubjectValue: this.selectrestriction.value.SecsubjectValue,
            EuauditedValue: this.selectrestriction.value.EuauditedValue,
            EusubjectValue: this.selectrestriction.value.EusubjectValue,
            EuAuditedNoValuationValue: this.selectrestriction.value.EuAuditedNoValuationValue,
            OtAuditedValue: this.selectrestriction.value.OtAuditedValue,
            OtSubjectValue: this.selectrestriction.value.OtSubjectValue,
            Ch1Value: this.selectrestriction.value.Ch1Value,
            Ch1NsaValue: this.selectrestriction.value.Ch1NsaValue,
            Ch2Value: this.selectrestriction.value.Ch2Value
          };
          groupAllLocations.push(newNode);
        });
      }
      if (groupAllLocations.filter(e => e.countrycode === 'GLB').length === 0) { // Validate if Global part is inside of local, if Global is not there, Add Global Part
        groupAllLocations.push(Global[0]);
      }
      const ActivityObj = { IdService: this.IdService, ActivityGridText: this.activitityGetText }; // Activity grid object
      this.saveForm(groupAllLocations, ActivityObj, progress);
    }
  }

  saveActivityGrid() {
    if (this.activityGetDataStore === '') {
      this.activitityBtnName = '';
    } else {
      this.activitityBtnName = 'has value';
    }
    if (this.activitityGetText !== this.activityGetDataStore) {
      const thisElement = this;
      const activityGridvar = { IdService: this.IdService, ActivityGridText: this.activityGetDataStore };
      thisElement.permissibilityservice.insertActivityGrid(activityGridvar).subscribe((data: any) => {
        if (data.message === 'OK') {
          const result = JSON.parse(data.value);
          this.getActivityGriddata();
        }
      })
    }
  }
  saveForm(permissibilityAllLocations, activityGriddata, progress) {
    const thisElement = this;
    Swal.fire({
      title: '',
      html: '<i class="material-icons material-spin material-2x">sync</i>',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen(this) {
        const promise = new Promise<any>((resolve, reject) => {
          thisElement.permissibilityservice.insertPermissibility(permissibilityAllLocations).subscribe(
            (data: any) => {
              if (data.message === 'OK') {
                thisElement.updateProgress.emit(progress);
                thisElement.permissibilityservice.insertActivityGrid(activityGriddata).subscribe((data2: any) => {
                  if (data2.message === 'OK') {
                    const result = JSON.parse(data.value);
                    Swal.close();
                    Swal.fire({
                      title: '',
                      icon: 'success',
                      html: '<h6>Successfully saved</h6>',
                      allowOutsideClick: false,
                      showConfirmButton: true,
                    });
                    resolve();
                  }
                }, errorService => console.log('error endpoint', errorService.message));
              } else {
                Swal.close();
                Swal.fire({
                  title: '',
                  icon: 'error',
                  html: '<h6>You need to create a record in Service Details.</h6>',
                  allowOutsideClick: false,
                  showConfirmButton: true,
                });
              }
            },
            errorService => console.log('error endpoint', errorService.message)
          );
        });
        return promise;
      }
    });
  }
  cancelForm() {
    const thisElement = this;
    Swal.fire({
      title: '',
      html: '<h5>Are you sure? You will lose any unsaved data.</h5>',
      showCancelButton: true,
      confirmButtonColor: '#FFE600',
      cancelButtonColor: '#FFFFF',
      confirmButtonText: 'Yes ',
      cancelButtonText: 'No',
      reverseButtons: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        if (!this.savedOneTime) {
          this.selectrestriction.controls.SecauditedValue.setValue('');
          this.selectrestriction.controls.SecsubjectValue.setValue('');
          this.selectrestriction.controls.EuauditedValue.setValue('');
          this.selectrestriction.controls.EusubjectValue.setValue('');
          this.selectrestriction.controls.EuAuditedNoValuationValue.setValue('');
          this.selectrestriction.controls.OtAuditedValue.setValue('');
          this.selectrestriction.controls.OtSubjectValue.setValue('');
          this.selectrestriction.controls.Ch1Value.setValue('');
          this.selectrestriction.controls.Ch1NsaValue.setValue('');
          this.selectrestriction.controls.Ch2Value.setValue('');
          // Local independence restrictions (permissibility) cancel variables
          this.nodePermissibility = [];
          this.selectedColumn = [];
          this.selectedColumnName = [];
          this.activitityGetText = '';  // activity grid variable
          this.removeDropdownTree();
        } else {
          this.getPermissibilityById.emit();
          this.loadingToGetSavedData(true);
        }
      }
    });
  }

  cancelActivityGrid() {
    this.activityGetDataStore = this.activitityGetText;
  }
  getPermissibilityByNode(node) { // Function to get permissibility in local tree
    const condition = this.nodePermissibility.filter(e => e.level === node.level && e.name === node.name);
    if (condition.length === 0) {
      this.nodePermissibility.push(node); // new node to store
    }
  }

  // Modify the template object for the tree
  transformer = (node: LocationFilterDropdownNode, level: number) => {
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
        deviationCh2Value: false
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
        deviationCh2Value: false
      },
      deviation: node.deviation
    };
  }
  /****
    Default function for the pre-made component - Tree
    https://material.angular.io/components/tree/overview (Angular material)
  *****/
  // tslint:disable-next-line: member-ordering
  treeControl = new FlatTreeControl<LocationFiltreDropdownChildNode>(
    node => node.level,
    node => node.expandable
  );
  // tslint:disable-next-line: member-ordering
  treeFlattener: any = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );
  // tslint:disable-next-line: member-ordering
  checklistSelection = new SelectionModel<LocationFilterDropdownNode>(true);
  // tslint:disable-next-line: member-ordering
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  /**** Default function for the pre-made component with some custom stuff ****/
  hasChild = (_: number, node: LocationFiltreDropdownChildNode) => node.expandable;
  getLevel = (node: LocationFiltreDropdownChildNode) => node.level;
  descendantsPartiallySelected(node: LocationFiltreDropdownChildNode): boolean {
    if (this.readyTree) {
      const descendants = this.treeControl.getDescendants(node);
      const result = descendants.some(child => child.selected === true);
      return result && !this.descendantsAllSelected(node);
    }
    return false;
  }
  descendantsAllSelected(node: LocationFiltreDropdownChildNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child => child.selected === true );
    return descAllSelected;
  }
  getParent(node: LocationFiltreDropdownChildNode) {
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
  openDefaultLevel() {  // open Area level
    this.treeControl.dataNodes.map(node => {
      if (node.name === 'Global') {
        this.treeControl.expand(node);
      }
    });
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
  updateNode(node, type, event) { // update description in tree template before past to the permissibility component
    const oneNode = this.treeControl.dataNodes.filter(e => e.level === node.level && e.name === node.name);
    const globalValue = this.selectedColumn.filter(item => item.column === type)[0].value;
    const region = this.getParent(node);
    const area = this.getParent(region);
    // Calculate deviation by current node
    oneNode[0].permissibility['deviation' + type] = event === globalValue  ? false : true;
    oneNode[0].permissibilityGlobal[type] = globalValue;
    oneNode[0].deviation = oneNode[0].permissibility.deviationSecauditedValue || oneNode[0].permissibility.deviationSecsubjectValue ||
      oneNode[0].permissibility.deviationEuauditedValue || oneNode[0].permissibility.deviationEusubjectValue ||
      oneNode[0].permissibility.deviationEuAuditedNoValuationValue || oneNode[0].permissibility.deviationOtAuditedValue ||
      oneNode[0].permissibility.deviationOtSubjectValue || oneNode[0].permissibility.deviationCh1Value ||
      oneNode[0].permissibility.deviationCh1NsaValue || oneNode[0].permissibility.deviationCh2Value ? true : false;

    // Calculate deviation by region
    const descendantsRegion = this.treeControl.getDescendants(region);
    const condition = descendantsRegion.filter(element => element.level === 3 && element.selected === true).length === descendantsRegion.filter(element => element.level === 3 && element.deviation === false && element.selected === true).length;
    region.deviation = condition === false ? true : false;

    // Calculate deviation by Area
    const descendantsArea = this.treeControl.getDescendants(area);
    const condition1 = descendantsArea.filter(element => element.level === 2).length === descendantsArea.filter(element => element.level === 2 && (element.deviation === false || element.deviation === undefined)).length;
    area.deviation = condition1 === false ? true : false;
    this.getPermissibilityByNode(oneNode[0]);
  }
  updateTreeSelection() { // Function to rebuild the tree with the new values
    this.dataSource.data = this.tree;
    this.ngAfterViewInit();
    this.openDefaultLevel();
    this.showHideButton = true;
  }
  removeDropdownTree() { // Function to reset all permissibility
    this.dataSource.data = this.tree;
    this.ngAfterViewInit();
    this.openDefaultLevel();
  }
}
