import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IndependenceConsiderationsContentService } from '../../../../../../providers/provider.index';
import { LocationFilterNode } from '../../../../../../models/model/filter.model';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2/dist/sweetalert2.js';
@Component({
  selector: 'app-independence-consideration',
  templateUrl: './independence-consideration.component.html',
  styleUrls: ['./independence-consideration.component.scss']
})
export class IndependenceConsiderationComponent implements OnInit, OnChanges {
  // input and output
  @Input() active: any;
  @Input() IdService: any;
  @Input() tree: LocationFilterNode[] = [];
  @Input() locationsSaved: any = [];
  @Input() enableLocal: boolean = false;
  @Input() countryList: Array<any> = [];
  @Input() independenceConsiderationGlobal: Array<any> = [];
  @Input() independenceConsiderationLocal: Array<any> = [];
  @Input() readonly: any;

  @Output() updateProgress: EventEmitter<any>;
  @Output() getIndependenceConsiderationById: EventEmitter<any>;
  @Output() loadingToGetSavedData: EventEmitter<any>;

  // Local component variables
  nodeConsiderations: any = [];
  clearTree: boolean = false;
  forceTree: boolean = false;

  // component variables
  checked: any = [];
  datastore;
  checkeddetail;
  globalconsiderationdescription;
  isChecked: boolean = true;
  gobalconsideration: boolean = true;
  nonglobe: boolean = false;
  globalconsiderationdata: any = [];
  savedOneTime: boolean = false;

  // CKEditor variables
  public Editor = ClassicEditor;
  public EditorReference: any;

  constructor(private independenceconsiderationscontentService: IndependenceConsiderationsContentService, private cdRef: ChangeDetectorRef) {
    this.updateProgress = new EventEmitter(); // initialize event to emit - OUTPUT
    this.getIndependenceConsiderationById = new EventEmitter();
    this.loadingToGetSavedData = new EventEmitter();
   }

  ngOnInit() {
    this.globalconsiderationcheckbox();
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'independenceConsiderationGlobal': { // Get service line guidance object from database
            // console.log('independenceConsiderationGlobal', this.independenceConsiderationGlobal);
            break;
          }
          case 'independenceConsiderationLocal': { // Get service line guidance object from database
            if (this.independenceConsiderationLocal.length > 0 && this.countryList.length > 0) {
              this.initializeVariablesLocal(this.independenceConsiderationLocal);
              this.savedOneTime = true;
            }
            break;
          }
          case 'countryList':
            if (this.countryList.length > 0) {
              this.initializeVariablesLocal(this.independenceConsiderationLocal);
            }
            break;
        }
      }
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
        this.nodeConsiderations = listOfLocations;
        this.savedOneTime = true;
        this.forceTree = true;
      }
    }
  }
  globalconsiderationcheckbox() {
    this.independenceconsiderationscontentService.getshowhidedata().
      subscribe((data: any) => {
        this.datastore = data;
        // console.log(this.datastore);
      });
  }
  getcheckbox(event, checkbox) {
    if (event.checked) {
      this.showHidetool(false);
      const item = this.datastore.filter(item => item.independenceName === checkbox.independenceName && item.independenceDescription && item.order)[0];
      this.checked.push({
        value: item.independenceName,
        description: item.independenceDescription,
        textboxdescription: '',
        order: item.order,
        chk: event.checked,
      });
    } else {
      const index = this.checked.findIndex(item => item.value === checkbox.independenceName);
      this.checked.splice(index, 1);
    }
  }
  getstandardtext(data) {
    this.datastore.filter((val) => {
      if (val.independenceName === data && val.independenceDescription) {
        this.globalconsiderationdescription = val.independenceDescription;
      }
    });
  }

  showHidetool(e) {
    this.gobalconsideration = !e.checked;
    this.nonglobe = e.checked;
    if (e.checked === true && this.datastore.length > 0) {
      this.datastore = this.datastore.map(item => ({...item, isChecked : false}), this.checked = []);
    }
  }
  cancel() {
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
        if (this.savedOneTime) {
        this.nodeConsiderations = []; // Clear node Tree
        this.checked = [];
        this.nonglobe = false;
        this.datastore = this.datastore.map(item => {
          item.isChecked = false;
          return item;
        });
        this.getIndependenceConsiderationById.emit();
        this.loadingToGetSavedData.emit(true);
        this.forceTree = true;
        } else {
          this.nodeConsiderations = []; // Clear node Tree
          this.clearTree = true; // Clear node Tree
        }
      }
    });
  }
  Submit() {
    this.savedOneTime = true;
    const progress = { title: 'Independence Considerations', progress: 0 }; // constante to save the progress of the component
    if (this.nonglobe === true) {
      progress.progress = 100; // No Global independence was selected by the user
      this.globalconsiderationdata = [{
        IdService: this.IdService
      }];
    } else {
      this.globalconsiderationdata = this.checked.map((items) => {
        return {
          IdService: this.IdService,
          IndependenceName: items.value,
          GeneralPrinciples: items.description,
          SpecificConsiderations: items.textboxdescription,
          Order: items.order,
        };
      });
      if (this.globalconsiderationdata.length > 0) {
        progress.progress = 100;
      }
    }
    if (this.globalconsiderationdata.length === 0) {
      progress.progress = 0;
      this.globalconsiderationdata = [{
        IdService: this.IdService
      }];
    }
    this.updateProgress.emit(progress); // Output to send progress constante to new-service
    this.saveForm(this.globalconsiderationdata);
  }

  saveForm(detaildatas) {
    // Local independence considerations save logic
    const locations = [];
    const country = [];
    const regions = [];

    // regions that apply by country
    this.locationsSaved.map(l => {
      if (this.countryList.filter(c => c.countryCode === l.CountryCode).length > 0) {
        const region = this.countryList.filter(c => c.countryCode === l.CountryCode)[0].region;
        regions.push(region);
      }
    });

    // clean nodeConsiderations with no location selected
    const onlyLocation = this.nodeConsiderations.filter(node => node.level !== 2 && node.text !== '');
    let onlyregion = this.nodeConsiderations.filter(node => node.level === 2 && node.text !== '');

    // Create an object with the locations that apply and if text is available in the region it's added
    onlyLocation.map(e => {
      if (this.countryList.filter(c => c.countryName === e.name).length > 0) {
        const countryCode = this.countryList.filter(c => c.countryName === e.name)[0].countryCode;
        if (this.locationsSaved.map(l => l.CountryCode).includes(countryCode)) {
          country.push(e);
        }
      }
    });
    if (country.length === 0) {
      // Locations doesn't have text, verify Regions
      if (onlyregion.length > 0) {
        onlyregion.map(only => {
          if (regions.includes(only.name)) {
            const regionNode = {
              IdService: this.IdService,
              CountryCode: '',
              IndependenceCountryConsiderationsText: '',
              IndependenceRegionConsiderations: only.text,
              RegionCode: only.name,
              IdServiceCountry: 0
            };
            locations.push(regionNode);
          }
        });
      }
    } else if (country.length > 0) {
      // locations with region, remove each regions that have a location from onlyregion
      country.filter(e => e.level !== 2).map(location => {
        const condition = this.nodeConsiderations.filter(r => r.name === this.countryList.filter(c => c.countryName === location.name)[0].region && r.level === 2).length > 0;
        if (condition) {
          onlyregion = onlyregion.filter(o => o.name !== this.countryList.filter(c => c.countryName === location.name)[0].region);
        }
        const temp = {
          IdService: this.IdService,
          CountryCode: this.countryList.filter(c => c.countryName === location.name)[0].countryCode,
          IndependenceCountryConsiderationsText: location.text,
          IndependenceRegionConsiderations: condition ?
            this.nodeConsiderations.filter(r => r.name === this.countryList.filter(c => c.countryName === location.name)[0].region && r.level === 2)[0].text : '',
          RegionCode: this.countryList.filter(c => c.countryName === location.name)[0].region,
          IdServiceCountry: location.id
        };
        locations.push(temp);
      });
      // Verify onlyregion
      if (onlyregion.length > 0) {
        onlyregion.map(only => {
          if (regions.includes(only.name)) {
            const regionNode = {
              IdService: this.IdService,
              CountryCode: '',
              IndependenceCountryConsiderationsText: '',
              IndependenceRegionConsiderations: only.text,
              RegionCode: only.name,
              IdServiceCountry: 0
            };
            locations.push(regionNode);
          }
        });
      }
    }
    // End Local independence considerations save logic
    const thisElement = this;
    Swal.fire({
      title: '',
      html: '<i class="material-icons material-spin material-2x">sync</i>',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen(this) {
        const promise = new Promise<any>((resolve) => {
          thisElement.independenceconsiderationscontentService.globalconsideration(detaildatas).subscribe(
            (data: any) => {
              if (data.message === 'OK') {
                const result = JSON.parse(data.value);
                // Local independence considerations method to save
                if (thisElement.enableLocal) {
                  if (locations.length > 0) {
                    thisElement.independenceconsiderationscontentService.insertLocalConsiderations(locations).subscribe(
                      (data1: any) => {
                        const result1 = JSON.parse(data1.value);
                        Swal.close();
                        Swal.fire({
                          title: '',
                          icon: 'success',
                          html:
                            '<h6>Successfully saved</h6>',
                          allowOutsideClick: false,
                          showConfirmButton: true,
                        });
                      },
                      errorService => console.log('error endpoint', errorService.message)
                    );
                  } else {
                    Swal.close();
                    Swal.fire({
                          title: '',
                          icon: 'success',
                          html: '<h6>Successfully saved</h6>',
                          allowOutsideClick: false,
                          showConfirmButton: true,
                        });
                  }
                } else {
                  Swal.close();
                  Swal.fire({
                    title: '',
                    icon: 'success',
                    html:
                      '<h6>Successfully saved</h6>',
                      allowOutsideClick: false,
                      showConfirmButton: true,
                  });
                }
                // End Local independence considerations method to save
              }
            },
            errorService => console.log('error endpoint', errorService.message)
          );
        });
        return promise;
      }
    });
  }
   // Local functions
   getConsiderationByNode(node) { // Function to get independence considerations in local tree
    const condition = this.nodeConsiderations.filter(e => e.level === node.level && e.name === node.name);
    if (condition.length === 0) {
      this.nodeConsiderations.push(node); // new node to store
    } else {
      condition[0].text = node.text;
    }
  }
  setClearFlag = (e) => { // Function to update flag to rebuild tree
    this.clearTree = false;
    this.cdRef.detectChanges();
  }
  setForceFlag = (e) => { // Function to update flag to force tree
    this.forceTree = false;
    this.cdRef.detectChanges();
  }
}
