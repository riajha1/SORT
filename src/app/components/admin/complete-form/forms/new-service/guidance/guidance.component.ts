import { Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FormGroup, FormControl } from '@angular/forms';
import { LocationFilterNode } from '../../../../../../models/model/filter.model';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ServiceLineService } from '../../../../../../providers/provider.index';

@Component({
  selector: 'app-guidance',
  templateUrl: './guidance.component.html',
  styleUrls: ['./guidance.component.scss']
})
export class GuidanceComponent implements OnInit, OnChanges {
  // input and output
  @Input() active: boolean;
  @Input() IdService: number = 0;
  @Input() tree: LocationFilterNode[] = [];
  @Input() locationsSaved: any = [];
  @Input() enableLocal: boolean = false;
  @Input() countryList: Array<any> = [];
  @Input() SLguidanceGlobal: any = '';
  @Input() SLguidanceLocal: Array<any> = [];
  @Input() progressStatus: any;
  @Input() readonly: any;

  @Output() updateProgress: EventEmitter<any>;
  @Output() getGuidanceById: EventEmitter<any>;
  @Output() loadingToGetSavedData: EventEmitter<any>;

  // component variables
  guidanceForm: FormGroup;
  globalGuidance: boolean = true;
  savedOneTime: boolean = false;

  // Local tree component variables
  nodeGuidance: any = [];
  clearTree: boolean = false;
  forceTree: boolean = false;

  // CKEditor variables
  public Editor = ClassicEditor;
  public EditorReference: any;

  constructor( private serviceLineService: ServiceLineService,
               private cdRef: ChangeDetectorRef) {
                this.updateProgress = new EventEmitter(); // initialize event to emit - OUTPUT
                this.getGuidanceById = new EventEmitter();
                this.loadingToGetSavedData = new EventEmitter();
                this.initializeForm();
              }

  ngOnInit() { }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'SLguidanceGlobal': { // Get service line guidance object from database
            if (this.SLguidanceGlobal !== '') {
              this.initializeForm(this.SLguidanceGlobal);
              this.savedOneTime = true;
            }
            break;
          }
          case 'SLguidanceLocal': { // Get service line guidance object from database
            if (this.SLguidanceLocal.length > 0 && this.countryList.length > 0) {
              this.initializeVariablesLocal(this.SLguidanceLocal);
            }
            break;
          }
          case 'countryList': {
            if (this.countryList.length > 0) {
              this.initializeVariablesLocal(this.SLguidanceLocal);
            }
            break;
        }
        case 'progressStatus': {
          if (this.progressStatus === '100' && this.SLguidanceGlobal === '') {
            this.globalGuidance = false;
            this.savedOneTime = true;
          }
          break;
        }
        }
      }
    }
  }
  initializeForm(data: any = '') {
    this.guidanceForm = new FormGroup({ // Declare guidance form
      IdService: new FormControl(''),
      QualityConsiderations: new FormControl(data)
    });
  }
  initializeVariablesLocal(locations) {
    const listOfLocations = locations;
    if (this.countryList.length > 0) { // Local piece
      if (listOfLocations.length > 0) {
        this.savedOneTime = true;
        listOfLocations.map(item => {
          if (this.countryList.filter(c => c.countryCode === item.name).length > 0) { // Tree use full name of country, Database only send countryCode, replace countryCode with countryName in name variable
            item.name = this.countryList.filter(c => c.countryCode === item.name)[0].countryName;
          }
        });
        this.nodeGuidance = listOfLocations;
        this.forceTree = true;
      }
    }
  }
  omitSpecialChar = (event) => event.charCode !== 60 &&  event.charCode !== 62; // Function to avoid special chars
  showHideGuidance = (e) => this.globalGuidance = !e.checked; // checkbox No global service line guidance

  submit() { // Function to send complete form to Database - subscribe
    this.savedOneTime = true;
    const locations = [];
    const country = [];
    const regions = [];
    this.guidanceForm.value.IdService = this.IdService;
    // Logic to calculate progress
    const progress = { title: 'Service Line Guidance', progress: 0 };
    if (!this.globalGuidance) {
      this.guidanceForm.value.QualityConsiderations = '';
      progress.progress = 100;
    } else {
      if (this.guidanceForm.value.QualityConsiderations !== '') {
        progress.progress = 100;
      } else {
        progress.progress = 0;
      }
    }
     // regions that apply by country
    this.locationsSaved.map(l => {
      if (this.countryList.filter(c => c.countryCode === l.CountryCode).length > 0) {
        const region = this.countryList.filter(c => c.countryCode === l.CountryCode)[0].region;
        regions.push(region);
      }
    });

    // clean nodeGuidance with no location selected
    const onlyLocation = this.nodeGuidance.filter(node => node.level !== 2 && node.text !== '');
    let onlyregion = this.nodeGuidance.filter(node => node.level === 2 && node.text !== '');

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
        onlyregion.map( only => {
          if (regions.includes(only.name)) {
            const regionNode = {
              IdService: this.IdService,
              CountryCode: '',
              QualityCountryGuidance: '',
              QualityRegionGuidance: only.text,
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
        const condition = this.nodeGuidance.filter(r => r.name === this.countryList.filter(c => c.countryName === location.name)[0].region && r.level === 2).length > 0;
        if (condition) {
          onlyregion = onlyregion.filter(o => o.name !== this.countryList.filter(c => c.countryName === location.name)[0].region );
        }
        const temp =  {
           IdService: this.IdService,
           CountryCode: this.countryList.filter(c => c.countryName === location.name)[0].countryCode,
           QualityCountryGuidance: location.text,
           QualityRegionGuidance: condition ?
           this.nodeGuidance.filter(r => r.name === this.countryList.filter(c => c.countryName === location.name)[0].region && r.level === 2)[0].text : '',
           RegionCode: this.countryList.filter(c => c.countryName === location.name)[0].region,
           IdServiceCountry: location.id
        };
        locations.push(temp);
      });
      // Verify onlyregion
      if (onlyregion.length > 0) {
        onlyregion.map( only => {
          if (regions.includes(only.name)) {
            const regionNode = {
              IdService: this.IdService,
              CountryCode: '',
              QualityCountryGuidance: '',
              QualityRegionGuidance: only.text,
              RegionCode: only.name,
              IdServiceCountry: 0
            };
            locations.push(regionNode);
          }
        });
      }
    }
    const thisElement = this;
    Swal.fire({
      title: '',
      html: '<i class="material-icons material-spin material-2x">sync</i>',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen(this) {
        const promise = new Promise<any>((resolve, reject) => {
          thisElement.serviceLineService.saveServiceLineGuidance(thisElement.guidanceForm.value).subscribe(
            (data: any) => {
              if (data.message === 'OK') {
                thisElement.updateProgress.emit(progress);
                if (thisElement.enableLocal) {
                  if (locations.length > 0) {
                    thisElement.serviceLineService.saveCountryServiceLineGuidance(locations).subscribe(
                      (data1: any) => {
                        Swal.close();
                        Swal.fire({
                          title: '',
                          icon: 'success',
                          html:
                            '<h6>Successfully saved</h6>',
                            allowOutsideClick: false,
                            showConfirmButton: true,
                        });
                        resolve();
                      },
                      errorService => console.log('error endpoint', errorService.message)
                      );
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
            errorService => console.log('error endpoint', errorService.message)
          );
        }).then();
        return promise;
      }
    });
  }
  cancel() { // Function to clean the complete form if the user is agree
    Swal.fire({
      title: '',
      html: '<h6>Are you sure? You will lose any unsaved data.</h6>',
      showCancelButton: true,
      confirmButtonColor: '#FFE600',
      cancelButtonColor: '#FFFFF',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No ',
      reverseButtons: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        if (this.savedOneTime) {
          this.nodeGuidance = [];
          this.globalGuidance = true;
          this.getGuidanceById.emit();
          this.loadingToGetSavedData.emit(true);
          this.forceTree = true;
        } else {
          this.nodeGuidance = []; // Clear node Tree
          this.clearTree = true;
        }
        this.initializeForm();
        this.globalGuidance = true;
      }
    });
  }
  getGuidanceByNode(node) { // Function to get guidance in local tree
    const condition = this.nodeGuidance.filter(e => e.level === node.level && e.name === node.name);
    if (condition.length === 0) {
      this.nodeGuidance.push(node); // new node to store
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
