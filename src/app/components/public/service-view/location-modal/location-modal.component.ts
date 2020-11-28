import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectorRef } from '@angular/core';
import { LocationFilterNode, LocationFiltreChildNode } from '../../../../models/model.index';
import { CountriesService, ServiceService, UserService } from 'src/app/providers/provider.index';
import { ActivatedRoute } from '@angular/router';


/**
 * @title Tree with flat nodes use for filter
 */

@Component({
  selector: 'app-location-modal',
  templateUrl: './location-modal.component.html',
  styleUrls: ['./location-modal.component.scss']
})
export class LocationModalComponent implements OnInit, AfterViewInit {
  constructor(public activeModal: NgbActiveModal, private cdRef: ChangeDetectorRef,
              private serviceService: ServiceService, private userService: UserService,
              private countryService: CountriesService) {
              }
  @Input() location: any;
  @Input() country: any;
  ready = false;
  public transformer = (node: LocationFilterNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      selected: node.selected
    };
  }
  // tslint:disable-next-line: member-ordering
  treeControl = new FlatTreeControl<LocationFiltreChildNode>(
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
  ngOnInit() {
    const options: LocationFilterNode[] = [
      {
        label: 'Global',
        selected: true,
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
                children: this.country.america.filter(e => e.region === 'BBC')
              },
              {
                name: 'Canada',
                selected: false,
                children: this.country.america.filter(e => e.region === 'Canada')
              },
              {
                name: 'EYC',
                selected: false,
                children: this.country.america.filter(e => e.region === 'EYC')
              },
              {
                name: 'Israel',
                selected: false,
                children: this.country.america.filter(e => e.region === 'Israel')
              },
              {
                name: 'LAN',
                selected: false,
                children: this.country.america.filter(e => e.region === 'LAN')
              },
              {
                name: 'LAS',
                selected: false,
                children: this.country.america.filter(e => e.region === 'LAS')
              },
              {
                name: 'US',
                selected: false,
                children: this.country.america.filter(e => e.region === 'US')
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
                children: this.country.emeia.filter(e => e.region === 'Africa')
              },
              {
                name: 'CESA',
                selected: false,
                children: this.country.emeia.filter(e => e.region === 'CESA')
              },
              {
                name: 'GSA',
                selected: false,
                children: this.country.emeia.filter(e => e.region === 'GSA')
              },
              {
                name: 'India',
                selected: false,
                children: this.country.emeia.filter(e => e.region === 'India')
              },
              {
                name: 'Mediterranean',
                selected: false,
                children: this.country.emeia.filter(e => e.region === 'Mediterranean')
              },
              {
                name: 'MENA',
                selected: false,
                children: this.country.emeia.filter(e => e.region === 'MENA')
              },
              {
                name: 'Nordics',
                selected: false,
                children: this.country.emeia.filter(e => e.region === 'Nordics')
              },
              {
                name: 'UK&I',
                selected: false,
                children: this.country.emeia.filter(e => e.region === 'UK&I')
              },
              {
                name: 'WEM',
                selected: false,
                children: this.country.emeia.filter(e => e.region === 'WEM')
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
                children: this.country.asia.filter(e => e.region === 'ASEAN')
              },
              {
                name: 'Greater China',
                selected: false,
                children: this.country.asia.filter(e => e.region === 'Greater China')
              },
              {
                name: 'Korea',
                selected: false,
                children: this.country.asia.filter(e => e.region === 'Korea')
              },
              {
                name: 'Oceania',
                selected: false,
                children: this.country.asia.filter(e => e.region === 'Oceania')
              },
              {
                name: 'Japan',
                selected: false,
                children: this.country.asia.filter(e => e.region === 'Japan')
              }]
          }
        ]
      }
    ];
    this.dataSource.data = options;
  }


  ngAfterViewInit() {
    // Logic to select each node based on locations saved by the user in location component
    if (this.location.length > 0 ) {
      this.ready = true;
      let isGlobal = false;
      isGlobal = this.location.find((e: any) => e.CountryCode === 'GLB');
      if (isGlobal) {
        // If is global, means that all node will be selected
        this.treeControl.dataNodes.map(node => node.selected = true );
        this.treeControl.dataNodes.map(node => {
          this.allItemSelectionToggle(node);
          if (node.name === 'Global') {
            this.treeControl.expand(node);
          }
        });
      } else {
        // the user saved specific locations, find this locations in the tree, selected an specific node and also find their parent too
        this.location.map(e => {
          const countryData = this.country.all.filter(item => item.countryCode === e.CountryCode);
          if (countryData.length > 0) {
            this.treeControl.dataNodes.map(node => {
              if (e.IsSelectedCountry) {
                if (node.name === countryData[0].area ) {
                    const countries = this.treeControl.getDescendants(node);
                    countries.map(child => {
                      if (child.name === countryData[0].countryName && child.level === 3 ) {
                        if (!child.selected) { child.selected = ! child.selected;
                        }
                        // Region node
                        const parent = this.getParent(child);
                        const descendantsparent = this.treeControl.getDescendants(parent);
                        const condition = descendantsparent.filter(element => element.level === 3).length === descendantsparent.filter(element => element.level === 3 && element.selected === true).length;
                        if (!parent.selected) {
                          parent.selected = condition === true ? true : false;
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
              if (node.name === 'Global') {
                this.treeControl.expand(node);
              }
            });
          }
        });
      }
    }
  }
   getLevel = (node: LocationFiltreChildNode) => node.level;

  allItemSelectionToggle(node: LocationFiltreChildNode): void {
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

  getParent(node: LocationFiltreChildNode) {
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

  SomeItemSelectionToggle(node: LocationFiltreChildNode, countryData = [], filter = '') {
    if ( node.level > 0) {
      if (filter === 'country') {
        if (countryData[0] !== undefined) {
          if ( node.name === countryData[0].area ) {
            const descendants = this.treeControl.getDescendants(node);
            descendants.map(child => {
              const parent = this.getParentNode(child);
              if (parent.name === countryData[0].area) {
                if (!parent.selected) {
                  parent.selected = ! parent.selected;
                }
              }
              if (child.name === countryData[0].region) {
                if (!child.selected) {
                  child.selected = ! child.selected;
                }
              }
              if (child.name === countryData[0].countryName && child.level === 3 ) {
                if (!child.selected) {
                  child.selected = ! child.selected;
                }
              }
              this.cdRef.detectChanges();
            });
          }
        }
      } else if (filter === 'Region') {
        if (countryData[0] !== undefined) {
          if (countryData[0] && node.name === countryData[0].area ) {
            const descendants = this.treeControl.getDescendants(node);
            descendants.map(child => {
              const parent = this.getParentNode(child);
              if (parent.name === countryData[0].area) {
                if (!parent.selected) {
                  parent.selected = ! parent.selected;
                }
              }
              if (child.name === countryData[0].region) {
                if (!child.selected) {
                  child.selected = ! child.selected;
                  const descendantsSelected = this.treeControl.getDescendants(child);
                  descendantsSelected.map(childSelected => childSelected.selected = true);
                }
              }
              this.cdRef.detectChanges();
            });
          }
        }
      } else if (filter === 'Area') {
        if (countryData[0] !== undefined) {
          if ( node.name === countryData[0].area ) {
            const descendants = this.treeControl.getDescendants(node);
            descendants.map(child => {
              const parent = this.getParentNode(child);
              if (parent.name === countryData[0].area) {
                if (!parent.selected) {
                  parent.selected = ! parent.selected;
                  const descendantsSelected = this.treeControl.getDescendants(parent);
                  descendantsSelected.map(childSelected => childSelected.selected = true);
                  this.cdRef.detectChanges();
                }
              }
            });
          }
        }
      }
    }
  }
  getParentNode(node: LocationFiltreChildNode): LocationFiltreChildNode | null {
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
    return null;
  }
  hasChild = (_: number, node: LocationFiltreChildNode) => node.expandable;

  countrySelection(countrySelection): void {
    const code = this.countryService.getCountryList().all.filter(e => e.countryName === countrySelection)[0].countryCode;
    this.userService.saveCountry(code);
    this.activeModal.close('Close click');
   }

     /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: LocationFiltreChildNode): boolean {
    if (this.ready) {
      const descendants = this.treeControl.getDescendants(node);
      const result = descendants.some(child => child.selected === true);
      return result && !this.descendantsAllSelected(node);
    }
    return false;
  }
  descendantsAllSelected(node: LocationFiltreChildNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child => child.selected === true );
    return descAllSelected;
  }

}
