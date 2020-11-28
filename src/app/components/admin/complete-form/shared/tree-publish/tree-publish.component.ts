import { Component, OnInit, Input, SimpleChanges, OnChanges, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import { LocationFilterPublishNode, LocationFiltrePublishChildNode } from '../../../../../models/model.index';
import { ServiceService, ServicesService, UserService } from '../../../../../providers/provider.index';
import { Subscription } from 'rxjs/internal/Subscription';
@Component({
  selector: 'app-tree-publish',
  templateUrl: './tree-publish.component.html',
  styleUrls: ['./tree-publish.component.scss']
})
export class TreePublishComponent implements OnInit, OnChanges, AfterViewInit {
  // input and output
  @Input() dataSourceTree: any = [];
  @Input() locationsSaved: any = [];
  @Input() countryList: Array<any> = [];
  @Input() dataStore: Array<any> = [];
  @Input() progress: string = '';
  @Input() IdService: any = 0;
  @Input() published: any = [];

  countrySelected = '';

  @Output() sendNode: EventEmitter<any>;

  subscriptionCountry: Subscription;

  // component variables
  loading = true;
  ready: boolean = false;
  showHideButton: boolean = true;
  enableTree: boolean = false;
  loadingButtonGlb: boolean = false;

  constructor(private cdRef: ChangeDetectorRef, private serviceService: ServiceService, private servicesServices: ServicesService, private userService: UserService) {
    this.sendNode = new EventEmitter();
   }

  ngOnInit() {
    this.countrySelected = this.userService.selectedcountry;
    console.log('que viene', this.countrySelected);
    this.subscriptionCountry = this.userService.selectedcountryChanged.subscribe(country => {
      this.countrySelected = country;
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'dataSourceTree': {
            // add template of the object to the tree
            if (this.dataSourceTree.length > 0) {
              this.dataSource.data = this.dataSourceTree;
              this.loading = false;
              this.openDefaultLevel();
            }
            break;
          }
          case 'published': {
            if (this.published.length > 0) {
              this.enableTree = true;
            }
            break;
          }
        }
      }
    }
  }
  ngAfterViewInit() {
    if (this.dataStore.length > 0) {
      if (this.dataStore.filter(e => e.level === 0).length > 0) {
        this.enableTree = true;
      }
    }
    // Logic to select each node based on locations saved by the user in location component
    if (this.locationsSaved.length > 0 ) {
      this.ready = true;
      let isGlobal = false;
      isGlobal = this.locationsSaved.find((e: any) => e.CountryCode === 'GLB');
      if (isGlobal) {
        // If is global, means that all node will be selected
        if (this.treeControl.dataNodes !== undefined) {
          this.treeControl.dataNodes.map(node => {
            const previousData = this.dataStore.filter(e => e.level === node.level && e.name === node.name);
            node.selected = true;
            node.enable = previousData.length > 0 ? previousData[0].enable : true;
            node.RIL = previousData.length > 0 ? previousData[0].RIL : false;
            node.RSQL = previousData.length > 0 ? previousData[0].RSQL : false;
            node.create = previousData.length > 0 ? previousData[0].create : '';
            node.update = previousData.length > 0 ? previousData[0].update : '';
            node.id = previousData.length > 0 ? previousData[0].id : '';
            this.cdRef.detectChanges();
          });
        }
      } else {
        // the user saved specific locations, find this locations in the tree, selected an specific node and also find their parent too
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
                          if (!child.selected) {
                            const previousData = this.dataStore.filter(storedNode => storedNode.level === child.level && storedNode.name === child.name);
                            child.selected = ! child.selected;
                            child.enable = previousData.length > 0 ? previousData[0].enable : true;
                            child.RIL = previousData.length > 0 ? previousData[0].RIL : false;
                            child.RSQL = previousData.length > 0 ? previousData[0].RSQL : false;
                            child.create = previousData.length > 0 ? previousData[0].create : '';
                            child.update = previousData.length > 0 ? previousData[0].update : '';
                            child.id = previousData.length > 0 ? previousData[0].id : '';
                          }
                          // Region node
                          const parent = this.getParent(child);
                          const descendantsparent = this.treeControl.getDescendants(parent);
                          const condition = descendantsparent.filter(element => element.level === 3).length === descendantsparent.filter(element => element.level === 3 && element.selected === true).length;
                          if (!parent.selected) {
                            parent.selected = condition === true ? true : false;
                            const previousDataRegion = this.dataStore.filter(element => element.level === 2 && element.name === parent.name);
                            parent.enable = previousDataRegion.length > 0 ? previousDataRegion[0].enable : true;
                            parent.RIL = previousDataRegion.length > 0 ? previousDataRegion[0].RIL : false;
                            parent.RSQL = previousDataRegion.length > 0 ? previousDataRegion[0].RSQL : false;
                            parent.create = previousDataRegion.length > 0 ? previousDataRegion[0].create : '';
                            parent.update = previousDataRegion.length > 0 ? previousDataRegion[0].update : '';
                            parent.id = previousDataRegion.length > 0 ? previousDataRegion[0].id : '';
                          }
                          // Area node
                          const parentparent = this.getParent(parent);
                          const descendantsparentparent = this.treeControl.getDescendants(parentparent);
                          const condition2 = descendantsparentparent.filter(item => item.level === 2).length === descendantsparentparent.filter(element => element.level === 2 && element.selected === true).length;
                          if (!parentparent.selected) {
                            parentparent.selected = condition2 === true ? true : false;
                          }
                          // Global node
                          const parentparentparent = this.getParent(parentparent);
                          const descendantsparentparentparent = this.treeControl.getDescendants(parentparentparent);
                          const condition3 = descendantsparentparentparent.filter(element => element.level === 1).length === descendantsparentparentparent.filter(element => element.level === 1 && e.selected === true).length;
                          if (!parentparentparent.selected) {
                            parentparentparent.selected = condition3 === true ? true : false;
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
  // functions of the pre-made component
  transformer = (node: LocationFilterPublishNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      selected: node.selected,
      RIL: node.RIL,
      RSQL: node.RSQL,
      status: node.status,
      enable: node.enable,
      id: node.id,
      update: node.update,
      create: node.create
    };
  }
   /****
    Default function for the pre-made component - Tree
    https://material.angular.io/components/tree/overview (Angular material)
  *****/
  // tslint:disable-next-line: member-ordering
  treeControl = new FlatTreeControl<LocationFiltrePublishChildNode>(
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
  checklistSelection = new SelectionModel<LocationFilterPublishNode>(true);
  // tslint:disable-next-line: member-ordering
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  // functions of the pre-made component
  hasChild = (_: number, node: LocationFiltrePublishChildNode) => node.expandable;
  getLevel = (node: LocationFiltrePublishChildNode) => node.level;
  omitSpecialChar = (event) => event.charCode !== 60 &&  event.charCode !== 62;
  descendantsPartiallySelected(node: LocationFiltrePublishChildNode): boolean {
    if (this.ready) {
      const descendants = this.treeControl.getDescendants(node);
      const result = descendants.some(child => child.selected === true);
      return result && !this.descendantsAllSelected(node);
    }
    return false;
  }
  descendantsAllSelected(node: LocationFiltrePublishChildNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child => child.selected === true );
    return descAllSelected;
  }
  getParent(node: LocationFiltrePublishChildNode) {
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
  // custom functions
  openDefaultLevel() { // open Area level
    this.treeControl.dataNodes.map(node => {
      if (node.name === 'Global') {
        this.treeControl.expand(node);
      }
    });
  }

  showAll(action: string) { // expand or hide the tree
    this.showHideButton = !this.showHideButton;
    if (action === 'show') {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
      this.openDefaultLevel();
    }
  }

  updateNode(node) { // update description in tree template
     const currentNode = this.treeControl.dataNodes.filter(e => e.level === node.level && e.name === node.name);
     currentNode[0].status = 'PublishedRegional';
     this.sendNode.emit(currentNode[0]);
  }


  forceTreeData() {
    // this.dataSource.data = this.dataSourceTree;
    // this.ngAfterViewInit();
    // this.openDefaultLevel();
    // this.showHideButton = true;
    // this.setForceTree.emit(false);
  }
  enableTreePublish(node) {
    this.servicesServices.fetchAllServices().subscribe(e=>console.log('all services', e)); // update cach services in the autocomplete
    this.servicesServices.fetchServices(this.countrySelected).subscribe(e=>console.log('Service filter', e));
    this.loadingButtonGlb = true;
    const temp = [{
      IdService: this.IdService,
      CreationDate: '',
      ModificationDate: '',
      Status: 'PublishedRegional',
      CountryCode: 'GLB',
      RegionCode: 'GLB'
    }];
    this.serviceService.publishService(temp).subscribe(e => {
      this.enableTree = true;
      this.loadingButtonGlb = false;
      this.updateNode(node);
    });
  }
}
