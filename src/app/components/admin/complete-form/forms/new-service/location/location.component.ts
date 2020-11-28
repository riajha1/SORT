import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, AfterViewInit, SimpleChanges } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import { CountriesService } from 'src/app/providers/provider.index';
import { LocationFilterNode, LocationFiltreChildNode } from '../../../../../../models/model.index';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit, AfterViewInit {
  // Input and Output
  @Input() active: any;
  @Input() IdService: any = 0;
  @Input() locationDatabase: any = [];
  @Input() readonly: any;

  @Output() defaultTreeCountry: EventEmitter<any>;
  @Output() locationByService: EventEmitter<any>;
  @Output() countryList: EventEmitter<any>;
  @Output() updateProgress: EventEmitter<any>;
  @Output() getLocationById: EventEmitter<any>;

  // component variables
  country: any = [];
  ready = false;
  loadingResult = true;
  allLocations = [];

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
  // Modify the template object for the tree
  transformer = (node: LocationFilterNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      selected: node.selected
    };
  }

  /****
    Default function for the pre-made component - Tree
    https://material.angular.io/components/tree/overview (Angular material)
  *****/
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
  /**** End Default function for the pre-made component ****/

  constructor(  private countriesService: CountriesService, private cdRef: ChangeDetectorRef) {
    // initialize event to emit - OUTPUT
    this.defaultTreeCountry = new EventEmitter();
    this.locationByService = new EventEmitter();
    this.countryList = new EventEmitter();
    this.updateProgress = new EventEmitter();
    this.getLocationById = new EventEmitter();
   }

  ngOnInit() {
    this.getCountry();
  }

  // Function to get all countries store in database
  ngAfterViewInit() {
    // Logic to select each node based on locations saved by the user in location component
    if (this.locationDatabase.length > 0 ) {
      this.ready = true;
      let isGlobal = false;
      isGlobal = this.locationDatabase.find((e: any) => e.CountryCode === 'GLB');
      if (isGlobal) {
        // If is global, means that all node will be selected
        this.treeControl.dataNodes.map(node => node.selected = true );
      } else {
        // the user saved specific locations, find this locations in the tree, selected an specific node and also find their parent too
        this.locationDatabase.map(e => {
          const countryData = this.country.all.filter(item => item.countryCode === e.CountryCode);
          if (countryData) {
            this.treeControl.dataNodes.map(node => {
              if (e.IsSelectedCountry) {
                if (countryData[0] !== undefined) {
                  if ( node.name === countryData[0].area ) {
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
               
              }
            });
          }
        });
      }
    }
  }
  getCountry() {
    this.countriesService.fetchCountries().subscribe(
      (data: any) => {
        this.fillDefaultTree(data);
        this.openDefaultLevel();
        this.country = data;
        this.countryList.emit(data.all);
        this.ngAfterViewInit();
      },
      errorService => {
        console.log('error endpoint', errorService.message);
      }
    );
  }

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
    this.defaultTreeCountry.emit(this.locations);
    this.loadingResult = false;
  }

  openDefaultLevel() { // open Area level
    this.treeControl.dataNodes.map(node => {
      if (node.name === 'Global') {
        this.treeControl.expand(node);
      }
    });
  }

  /**** Default function for the pre-made component with some custom stuff ****/
  hasChild = (_: number, node: LocationFiltreChildNode) => node.expandable;
  getLevel = (node: LocationFiltreChildNode) => node.level;

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
  cleanTree = () => this.treeControl.dataNodes.map(e => e.selected = false);
  /**** End Default function for the pre-made component with some custom stuff  ****/

  submit(button) { // Transforming information to send to database
    this.allLocations = [];
    const IsGlobal = this.treeControl.dataNodes.filter( e => e.level === 0 && e.selected === true);
    if (IsGlobal.length > 0) { // Global is selected
      // iterate the complete tree and create each local template to save
      this.treeControl.dataNodes.filter( e => e.level === 3).map(e => {
        const temp = {
          idService: this.IdService,
          CountryCode: this.country.all.filter( item => item.countryName === e.name )[0].countryCode,
          IsSelectedArea: true,
          IsSelectedRegion: true,
          IsSelectedCountry: true,
          IsGlobal: true,
          CountryName: this.country.all.filter( item => item.countryName === e.name )[0].countryName,
          Region: this.country.all.filter( item => item.countryName === e.name )[0].region,
          Area: this.country.all.filter( item => item.countryName === e.name )[0].area
        };
        this.allLocations.push(temp);
      });
      // Add Global record
      const globalRecord = {
        idService: this.IdService,
        CountryCode: 'GLB',
        IsSelectedArea: true,
        IsSelectedRegion: true,
        IsSelectedCountry: true,
        IsGlobal: true,
        CountryName: 'Global',
        Region: 'Global',
        Area: 'Global'
      };
      this.allLocations.push(globalRecord);
    } else {
    // Iterate each location without area and region and create each local template to save
    const countriesName = this.treeControl.dataNodes.filter( e => e.level === 3 && e.selected === true).map(e => e.name);
    const CountryList = this.country.all.filter( e => countriesName.includes(e.countryName));
    CountryList.map(element => {
      const localRecord = {
        idService: this.IdService,
        CountryCode: element.countryCode,
        IsSelectedArea: true,
        IsSelectedRegion: true,
        IsSelectedCountry: true,
        IsGlobal: false,
        CountryName: element.countryName,
        Region: element.region,
        Area: element.area
      };
      this.allLocations.push(localRecord);
    });
    }
    if (this.allLocations.length === 0) { // modal to show a warning message
      Swal.fire({
        title: '',
        icon: 'error',
        html:
          '<h6>Please select at least one location</h6>',
          allowOutsideClick: false,
          showConfirmButton: true,
      });
    } else { // save location selected by the user
      const progress = { title: 'Locations Offered', progress: 0 };
      if (button === 'confirm') {
        progress.progress = 100;
        this.saveForm('confirm', progress); // save location as Confirm
      } else {
        progress.progress = 50;
        this.saveForm('save', progress); // save location
      }
      // Function to update progress in database
    }
  }
  saveForm(type: string, progress) {  // functions to save locations in database
    const thisElement = this;
    if (this.allLocations.length > 0) {
      Swal.fire({
        title: '',
        html: '<i class="material-icons material-spin material-2x">sync</i>',
        allowOutsideClick: false,
        showConfirmButton: false,
        onOpen(this) {
          const promise = new Promise<any>((resolve, reject) => {
            thisElement.countriesService.insertLocationByService(thisElement.allLocations).subscribe(
              (data: any) => {
                if (data.message === 'OK') {
                  const result = JSON.parse(data.value);
                  thisElement.updateProgress.emit(progress);
                  thisElement.locationByService.emit(result);
                  thisElement.getLocationById.emit();
                  Swal.close();
                  if (type === 'confirm') {
                    Swal.fire({
                      title: '',
                      icon: 'success',
                      html:
                        '<h6>Successfully confirmed</h6>',
                        allowOutsideClick: false,
                        showConfirmButton: true,
                    });
                  } else {
                    Swal.fire({
                      title: '',
                      icon: 'success',
                      html:
                        '<h6>Successfully saved</h6>',
                        allowOutsideClick: false,
                        showConfirmButton: true,
                    });
                  }
                } else if (data.message === 'Error') {
                  Swal.fire({
                    title: '',
                    icon: 'error',
                    html:
                      '<h6>You need to create a record in Service Details.</h6>',
                      allowOutsideClick: false,
                      showConfirmButton: true,
                  });
                }
            },
              errorService => console.log('error endpoint insertLocationByService', errorService.message)
            );
          });
          return promise;
        }
      });
    }
  }
  cancel() { // functions to reset the tree if the user is agree
    Swal.fire({
      title: '',
      html: '<h6>Are you sure? You will lose any unsaved data.</h6>',
      showCancelButton: true,
      confirmButtonColor: '#FFE600',
      cancelButtonColor: '#FFFFF',
      confirmButtonText: 'Yes ',
      cancelButtonText: 'No',
      reverseButtons: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        if (this.locationDatabase.length > 0) {
          this.cleanTree();
          this.ngAfterViewInit();
        } else {
          this.cleanTree();
          this.allLocations = [];
        }
      }
    });
  }
}
