import { Component, Input, SimpleChanges, OnChanges, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import { LocationFilterTextareaNode, LocationFiltreTextareaChildNode } from 'src/app/models/model.index';


@Component({
  selector: 'app-tree-textarea',
  templateUrl: './tree-textarea.component.html',
  styleUrls: ['./tree-textarea.component.scss']
})
export class TreeTextareaComponent implements OnChanges, AfterViewInit  {
  // input and output
  @Input() dataSourceTree: any = [];
  @Input() placeholderRegion: string = '';
  @Input() placeholderCountry: string = '';
  @Input() locationsSaved: any = [];
  @Input() countryList: Array<any> = [];
  @Input() dataStore: Array<any> = [];
  @Input() clearTree: boolean = false;
  @Input() forceTree: boolean = false;

  @Output() sendNode: EventEmitter<any>;
  @Output() setclearTree: EventEmitter<any>;
  @Output() setForceTree: EventEmitter<any>;

  // component variables
  loading = true;
  showHideButton: boolean = true;
  ready: boolean = false;

  constructor(private cdRef: ChangeDetectorRef) {
    this.sendNode = new EventEmitter(); // initialize event to emit - OUTPUT
    this.setclearTree = new EventEmitter();
    this.setForceTree = new EventEmitter();
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
            // Flag to clean all node to the treee
            if (this.clearTree) {
              this.removeTextTree();
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
      this.ready = true;
      let isGlobal = false;
      isGlobal = this.locationsSaved.find((e: any) => e.CountryCode === 'GLB');
      if (isGlobal) {
        // If is global, means that all node will be selected
        if (this.treeControl.dataNodes !== undefined) {
          this.treeControl.dataNodes.map(node => {
            const previousText = this.dataStore.filter(e => e.level === node.level && e.name === node.name);
            node.selected = true;
            node.id = this.locationsSaved[0].IdServiceCountry; // add id based on locations saved
            node.text = previousText.length > 0 ? previousText[0].text : ''; // add id based on text store
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
                            const previousText = this.dataStore.filter(storedNode => storedNode.level === child.level && storedNode.name === child.name);
                            child.selected = ! child.selected;
                            child.id = e.IdServiceCountry;
                            child.text = previousText.length > 0 ? previousText[0].text : '';
                          }
                          // Region node
                          const parent = this.getParent(child);
                          const descendantsparent = this.treeControl.getDescendants(parent);
                          const condition = descendantsparent.filter(element => element.level === 3).length === descendantsparent.filter(element => element.level === 3 && element.selected === true).length;
                          if (!parent.selected) {
                            parent.selected = condition === true ? true : false;
                            const previousText = this.dataStore.filter(element => element.level === 2 && element.name === parent.name);
                            parent.text = previousText.length > 0 ? previousText[0].text : '';
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
  transformer = (node: LocationFilterTextareaNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      selected: node.selected,
      text: node.text,
      id: node.text
    };
  }
   /****
    Default function for the pre-made component - Tree
    https://material.angular.io/components/tree/overview (Angular material)
  *****/
  // tslint:disable-next-line: member-ordering
  treeControl = new FlatTreeControl<LocationFiltreTextareaChildNode>(
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
  checklistSelection = new SelectionModel<LocationFilterTextareaNode>(true);
  // tslint:disable-next-line: member-ordering
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  // functions of the pre-made component
  hasChild = (_: number, node: LocationFiltreTextareaChildNode) => node.expandable;
  getLevel = (node: LocationFiltreTextareaChildNode) => node.level;
  omitSpecialChar = (event) => event.charCode !== 60 &&  event.charCode !== 62;
  descendantsPartiallySelected(node: LocationFiltreTextareaChildNode): boolean {
    if (this.ready) {
      const descendants = this.treeControl.getDescendants(node);
      const result = descendants.some(child => child.selected === true);
      return result && !this.descendantsAllSelected(node);
    }
    return false;
  }
  descendantsAllSelected(node: LocationFiltreTextareaChildNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child => child.selected === true );
    return descAllSelected;
  }
  getParent(node: LocationFiltreTextareaChildNode) {
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

  updateText(level: number, name: string, text: any) { // update description in tree template
    const node = this.treeControl.dataNodes.filter(e => e.level === level && e.name === name);
    node[0].text = text.value;
    this.sendNode.emit(node[0]);
  }

  removeTextTree() { // clean each textarea node
    this.dataSource.data = this.dataSourceTree;
    this.ngAfterViewInit();
    this.openDefaultLevel();
    this.showHideButton = true;
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
