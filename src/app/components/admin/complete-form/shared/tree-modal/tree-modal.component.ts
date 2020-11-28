import { Component, EventEmitter, Output, Input, ChangeDetectorRef, SimpleChanges, OnChanges, AfterViewInit, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import { LocationFilterModalSolutionNode, LocationFiltreModalSolutionChildNode } from 'src/app/models/model.index';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import { ModalTreeComponent } from './modal-contact/modal-contact.component';
@Component({
  selector: 'app-tree-modal',
  templateUrl: './tree-modal.component.html',
  styleUrls: ['./tree-modal.component.scss']
})
export class TreeModalComponent implements OnInit, OnChanges, AfterViewInit {
   // input and output
  @Input() IdService: any;
  @Input() dataSourceTree: any = [];
  @Input() locationsSaved: any = [];
  @Input() countryList: Array<any> = [];
  @Input() dataStore: Array<any> = [];
  @Input() clearTree: boolean = false;
  @Input() forceTree: boolean = false;
  @Output() sendNode: EventEmitter<any>;
  @Output() setclearTree: EventEmitter<any>;
  @Output() setForceTree: EventEmitter<any>;

 // initialize forms
  contactForm: FormGroup;
  urlForm: FormGroup;

  // Local Components Variables
  loading = true;
  businessContact = [];
  orgContact = [];

  // show / hide tree variables
  showHideButton: boolean = true;
  readyTree: boolean = false;

  constructor( private cdRef: ChangeDetectorRef, private modalService: NgbModal) {
     // initialize event to emit - OUTPUT
    this.sendNode = new EventEmitter();
    this.setclearTree = new EventEmitter();
    this.setForceTree = new EventEmitter();
  }
  ngOnInit() {
    this.contactForm = new FormGroup({
      contactTitle: new FormControl('')
    });
    this.urlForm = new FormGroup({
      IdService: new FormControl(''),
      QualityConsiderations: new FormControl('')
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
          case 'clearTree': {
            // Flag to clean all node to the tree
            if (this.clearTree) {
              this.removeTree();
            }
            break;
          }
          case 'forceTree': {
            // Flag to force all node to the tree
            if (this.forceTree) {
              this.forceTreeData();
            }
            break;
          }
        }
      }
    }
  }
  ngAfterViewInit() {
    // Logic to select each node based on locations saved by the user in location component
    if (this.locationsSaved.length > 0 ) {
      this.readyTree = true;
      let isGlobal = false;
      isGlobal = this.locationsSaved.find((e: any) => e.CountryCode === 'GLB');
      if (isGlobal) {
        // If is global, means that all node will be selected
        if (this.treeControl.dataNodes !== undefined) {
          this.treeControl.dataNodes.map(node => {
            const previousContact = this.dataStore.filter(e => e.level === node.level && e.name === node.name);
            node.selected = true;
            if (previousContact.length > 0 && (previousContact[0].Name !== '' || previousContact[0].Url !== '')) {
              node.contact = previousContact[0].contact;
            }  else {
              node.contact = [];
            }
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
                  if (countryData[0] !== undefined) {
                    if ( node.name === countryData[0].area ) {
                      const countries = this.treeControl.getDescendants(node);
                      countries.map(child => {
                        if (child.name === countryData[0].countryName && child.level === 3 ) {
                          if (!child.selected) {
                            const previousContact = this.dataStore.filter(storedNode => storedNode.level === child.level && storedNode.name === child.name);
                            child.selected = ! child.selected;
                            if (previousContact.length > 0 && (previousContact[0].Name !== '' || previousContact[0].Url !== '')) {
                              child.contact = previousContact[0].contact;
                            } else {
                              child.contact = [];
                            }
                          }
                          // Region node
                          const parent = this.getParent(child);
                          const descendantsparent = this.treeControl.getDescendants(parent);
                          const condition = descendantsparent.filter(element => element.level === 3).length === descendantsparent.filter(element => element.level === 3 && element.selected === true).length;
                          if (!parent.selected) {
                            parent.selected = condition === true ? true : false;
                            const previousContact = this.dataStore.filter(element => element.level === 2 && element.name === parent.name);
                            if (previousContact.length > 0 && (previousContact[0].Name !== '' || previousContact[0].Url !== '')) {
                              parent.contact = previousContact[0].contact;
                            }  else {
                              parent.contact = [];
                            }
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
  transformer = (node: LocationFilterModalSolutionNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      selected: node.selected,
      contact: [{
        IdService: this.IdService,
        IdContacts: null,
        IdSolutionContacts: null,
        Name: '',
        Title: '',
        Mail: '',
        Url: '',
        Location: '',
        Order: 0,
        IdserviceCountry: null,
        countryCode: '',
        region: '',
        isLocal: false
      }]
    };
  }

  /****
    Default function for the pre-made component - Tree
    https://material.angular.io/components/tree/overview (Angular material)
  *****/
  // tslint:disable-next-line: member-ordering
  treeControl = new FlatTreeControl<LocationFiltreModalSolutionChildNode>(
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
  checklistSelection = new SelectionModel<LocationFilterModalSolutionNode>(true);
  // tslint:disable-next-line: member-ordering
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  // functions of the pre-made component
  hasChild = (_: number, node: LocationFiltreModalSolutionChildNode) => node.expandable;
  getLevel = (node: LocationFiltreModalSolutionChildNode) => node.level;
  omitSpecialChar = (event) => event.charCode !== 60 &&  event.charCode !== 62;
  descendantsPartiallySelected(node: LocationFiltreModalSolutionChildNode): boolean {
    if (this.readyTree) {
      const descendants = this.treeControl.getDescendants(node);
      const result = descendants.some(child => child.selected === true);
      return result && !this.descendantsAllSelected(node);
    }
    return false;
  }
  descendantsAllSelected(node: LocationFiltreModalSolutionChildNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child => child.selected === true );
    return descAllSelected;
  }
  getParent(node: LocationFiltreModalSolutionChildNode) {
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
  showAll(action: string) { // function to expand or hide the tree
    this.showHideButton = !this.showHideButton;
    if (action === 'show') {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
      this.openDefaultLevel();
    }
  }
  showContactModal(node) { // function to use modal with specific data
    const modalRef = this.modalService.open(ModalTreeComponent, {
      backdrop: 'static',
      size: 'xl'
    });
    modalRef.componentInstance.IdService = this.IdService;
    modalRef.componentInstance.node = node;
    modalRef.componentInstance.updateNode.subscribe(($e) => this.updateNode($e));
  }

  updateNode(completeNode: any) {  // update contact node in tree template
    const currentNode = this.treeControl.dataNodes.filter(e => e.level === completeNode.node.level && e.name === completeNode.node.name);
    currentNode[0].contact = completeNode.businessContact;
    this.sendNode.emit(currentNode[0]);
  }

  removeTree() { // Function to reset all Tree
    this.dataSource.data = this.dataSourceTree;
    this.ngAfterViewInit();
    this.openDefaultLevel();
    this.setclearTree.emit(false);
  }

  forceTreeData() {
    this.dataSource.data = this.dataSourceTree;
    this.ngAfterViewInit();
    this.openDefaultLevel();
    this.showHideButton = true;
    this.setForceTree.emit(false);
  }

}
