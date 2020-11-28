import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/internal/operators/tap';

import { ModalServiceComponent } from '../../../../../public/service-view/default-modal/modal.component';

import { InsertService,
         ServiceLineService,
         SubserviceLineService,
         CompetencyDomainService,
         ClientNeedService,
         DeliveryMethodContentService,
         SolutionService,
         SectorService,
         ServiceService,
         FieldOfPlayService} from '../../../../../../providers/provider.index';

import { ServiceLineModel,
         SubServiceLineModel,
         CompentencyDomainModel,
         SolutionModel,
         SectorModel,
         ClientNeedModel,
         FieldOfPlayModel,
         DeliveryMethodModel } from '../../../../../../models/model.index';


@Component({
  selector: 'app-intake',
  templateUrl: './intake.component.html',
  styleUrls: ['./intake.component.scss']
})
export class IntakeComponent implements OnInit, OnChanges {

  // Input and Output
  @Input() active: any;
  @Input() serviceDetailSaved: any;
  @Input() IdService: any = 0;
  @Input() readonly: any;

  @Output() updateIdService: EventEmitter<any>;
  @Output() updateProgress: EventEmitter<any>;
  @Output() getIdProgress: EventEmitter<any>;
  @Output() serviceline: EventEmitter<any>;
  @Output() enableDelivery: EventEmitter<any>;
  @Output() getServiceDetail: EventEmitter<any>;
  @Output() updateGreyBar: EventEmitter<any>;

  // CKEditor variables
  public Editor = ClassicEditor;
  public EditorReference: any;

  // component variables
  loading: boolean = true;
  allRequest: number = 0;
  IdProgress: number = 0;
  timeout = null;
  storeFieldList;
  originOfList;
  savedOneTime: boolean = false;
  oldSL = '';

  // Declare detail form items
  serviceLines: Array<ServiceLineModel>;
  subServiceLines: Array<SubServiceLineModel>;
  competencyDomains: Array<CompentencyDomainModel>;
  solutions: Array<SolutionModel>;
  sectors: Array<SectorModel>;
  clientNeeds: Array<ClientNeedModel>;
  delivery: Array<DeliveryMethodModel>;
  fieldOfPlayModel: Array<FieldOfPlayModel>;
  gfis: Array<any>;
  mercury: Array<any>;
  ServiceIndex = -1;
  selectedDelivery = [];
  pickoneDelivery = false;
  selectedDeliveryName = [];

  // loading ng-select dependents
  loadingSSL = false;
  loadingCompetency = false;

  // Declare form
  detailForm: FormGroup;

  constructor(private serviceLineService: ServiceLineService,
              private subserviceLineService: SubserviceLineService,
              private competencyDomainService: CompetencyDomainService,
              private solutionService: SolutionService,
              private sectorService: SectorService,
              private clientNeedService: ClientNeedService,
              private deliveryService: DeliveryMethodContentService,
              private serviceService: ServiceService,
              private fieldofplayservice: FieldOfPlayService,
              private insertService: InsertService,
              private modalService: NgbModal) {

                // initialize event to emit - OUTPUT
                this.updateIdService = new EventEmitter();
                this.updateProgress = new EventEmitter();
                this.getIdProgress = new EventEmitter();
                this.serviceline = new EventEmitter();
                this.enableDelivery = new EventEmitter();
                this.getServiceDetail = new EventEmitter();
                this.updateGreyBar = new EventEmitter();
                this.serviceLines = new Array<ServiceLineModel>();
                this.subServiceLines = new Array<SubServiceLineModel>();
                this.competencyDomains = new Array<CompentencyDomainModel>();
                this.solutions = new Array<SolutionModel>();
                this.sectors = new Array<SectorModel>();
                this.clientNeeds = new Array<ClientNeedModel>();
                this.fieldOfPlayModel = new Array<FieldOfPlayModel>();
                this.delivery = new Array<DeliveryMethodModel>();
                this.gfis = new Array<any>();
                this.initializeDetailForm();
  }
  ngOnInit() { // Functions to get the complete data for each item
    // console.log(this.readonly);

    this.getServicelines();
    this.getSolutions();
    this.getSectors();
    this.getClientNeed();
    this.getAllDelivery();
    this.getAllGfis();
    this.getAllMercury();
    this.getoriginoflist();
    this.getfieldofplaylist();
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'serviceDetailSaved': { // Get service detail object from database
            if (this.serviceDetailSaved.ServiceTitle !== undefined) { // Validate if the object bring data
              this.initializeDetailForm(this.serviceDetailSaved);
              this.savedOneTime = true;
              this.loadingToGetSavedData();
            }
            break;
          }
        }
      }
    }
  }
  initializeDetailForm(data: any = {}) { // Declare Reactive form with default value also with some validations - detailForm
    if (data.ServiceTitle !== undefined) {
      this.savedOneTime = true;
      this.oldSL = data.ServiceLine.length > 0 ? data.ServiceLine[0].ServiceLineName : '';
      this.detailForm = new FormGroup({
        IdService: new FormControl(this.IdService),
        title: new FormControl(data.ServiceTitle, [Validators.maxLength(125)],  this.validateServiceName.bind(this)),
        serviceline: new FormControl(data.ServiceLine.length > 0 ? data.ServiceLine[0].ServiceLineName : ''), // validate if serviceline comming, follow the bindValue to the ng-select to get the right value
        subserviceline: new FormControl(data.SubServiceLine.length > 0 ? data.SubServiceLine : []), // add array to formControl, be careful with bindLabel
        competencyDomain: new FormControl(data.CompetencyDomain.length > 0 ? data.CompetencyDomain : []),
        solution: new FormControl(data.Solution.length > 0 ? data.Solution : []),
        sector: new FormControl(data.Sector.length > 0 ? data.Sector : []),
        clientNeed: new FormControl(data.ClientNeed.length > 0 ? data.ClientNeed : []),
        gfisCodes: new FormControl(data.GfisCodes.length > 0 ? data.GfisCodes : []),
        mercuryCodes: new FormControl(data.MercuryCodes.length > 0 ? data.MercuryCodes : []),
        financeCodeFreeText: new FormControl(data.FinanceCodes),
        headlineDescription: new FormControl(data.HeadLineDescription, [Validators.maxLength(250)]),
        description: new FormControl(data.FullServiceDescription),
        deliveryMethod: new FormControl([]),
        status: new FormControl(data.Status),
        ServiceLineCollateral: new FormControl(data.ServiceLineCollateral),
        OriginOfService : new FormControl(data.OriginService !== null && data.OriginService.Prefix !== undefined ? data.OriginService.Prefix : ''),
        FieldOfPlay: new FormControl(data.FieldOfPlay.length > 0 ? data.FieldOfPlay : []),
      });
      // Calling dependent functions
      if (data.ServiceLine.length > 0) {
        this.getSubserviceLineByServiceLine(data.ServiceLine[0].ServiceLineCode);
      }
      if (data.SubServiceLine.length > 0) {
        this.onValueChangeSubService(data.SubServiceLine);
      }
      if (data.DeliveryMethod.length > 0) { // store delivery from database and store
        this.selectedDelivery = data.DeliveryMethod;
        this.selectedDeliveryName = data.DeliveryMethod.map(e => e.deliveryMethodName);
      }
    } else {
      this.detailForm = new FormGroup({
        IdService: new FormControl(this.IdService),
        title: new FormControl('', [Validators.maxLength(125)], this.validateServiceName.bind(this)),
        serviceline: new FormControl(''),
        subserviceline: new FormControl([]),
        competencyDomain: new FormControl([]),
        solution: new FormControl([]),
        sector: new FormControl([]),
        clientNeed: new FormControl([]),
        gfisCodes: new FormControl([]),
        mercuryCodes: new FormControl([]),
        financeCodeFreeText: new FormControl(''),
        headlineDescription: new FormControl('', [Validators.maxLength(250)]),
        description: new FormControl(''),
        deliveryMethod: new FormControl([]),
        status: new FormControl('InitiaDraft'),
        ServiceLineCollateral: new FormControl(''),
        OriginOfService : new FormControl(''),
        FieldOfPlay: new FormControl([]),
      });
    }
  }
  onValueChangeSL = (event: any) => { // Function to get service line selected by the user and get dependent SSL with that SL
    this.loadingSSL = true;
    this.getSubserviceLineByServiceLine(event.serviceLineCode);
    this.clearSSLandCompetency(); // Reset ng-select (SSL and Competency Domain) when a SL is selected
  }
  onValueChangeSector = (event: any) => { // Function to get sector selected by the user, if All is selected, the system deselects the other options by default
    if (event.length > 0 ) {
      const option = event[event.length - 1].sectorName;
      let onlyAll = [];
      if (option === 'All') {
         onlyAll = this.detailForm.get('sector').value.filter(u => u.sectorName === 'All');
      } else {
         onlyAll = this.detailForm.get('sector').value.filter(u => u.sectorName !== 'All');
      }
      this.detailForm.controls.sector.setValue(onlyAll);
    }
  }
  onValueChangeSolution = (event: any) => { // Function to get solution selected by the user, if All is selected, the system deselects the other options by default
    if (event.length > 0 ) {
      const option = event[event.length - 1].solutionDescription;
      let onlyAll = [];
      if (option === 'All') {
         onlyAll = this.detailForm.get('solution').value.filter(u => u.solutionDescription === 'All');
      } else {
         onlyAll = this.detailForm.get('solution').value.filter(u => u.solutionDescription !== 'All');
      }
      this.detailForm.controls.solution.setValue(onlyAll);
    }
  }
  onValueChangeClientNeed = (event: any) => { // Function to get client need selected by the user, if All is selected, the system deselects the other options by default
    if (event.length > 0 ) {
      const option = event[event.length - 1].clientNeedName;
      let onlyAll = [];
      if (option === 'All') {
         onlyAll = this.detailForm.get('clientNeed').value.filter(u => u.clientNeedName === 'All');
      } else {
         onlyAll = this.detailForm.get('clientNeed').value.filter(u => u.clientNeedName !== 'All');
      }
      this.detailForm.controls.clientNeed.setValue(onlyAll);
    }
  }
  onValueChangeSubService(event: any) { // Function to get SSL selected by the user and get dependent competency domain with that SSL
    if (event.length > 0) {
      this.loadingCompetency = true;
      const temp = [];
      event.map(x => {
        this.competencyDomainService.getCompetencyDomainBySubServiceCode(x.idSubServiceCode === undefined ? x.IdSubServiceCode : x.idSubServiceCode)
        .pipe(tap(() => this.loadingCompetency = false))
        .subscribe((data: Array<CompentencyDomainModel>) => {
          data.map(e => temp.push(e));
          const organizado =  [...temp].sort((a, b) => a.competencyDomainName.localeCompare(b.competencyDomainName));
          this.competencyDomains = organizado;
        });
      });
    } else {
      this.competencyDomains = [];
    }
  }
  validateServiceName(control: FormControl): Promise<any> | Observable<any> { // Function to validate if the service name is available
   if (control.value !== null ) {
      const temp = { idService: this.IdService, serviceTitle: control.value.trim() };
      clearTimeout(this.timeout);
      const promise = new Promise<any>((resolve, reject) => {
        if (!control.pristine) {
          this.timeout = setTimeout(() => { // Wait a 500 miliseconds before submitting the request
            this.serviceService.getServiceNameValidator(temp).subscribe(
              (data: any) => data.value === 'true' ?  resolve({serviceNameIsBusy: true}) : resolve(null),
              errorService => console.log('error endpoint validateServiceName', errorService.message)
            );
          }, 500);
        } else {
          resolve(null);
        }
      });
      return promise;
   } else {
    return new Promise<any>((resolve, reject) => {});
   }
  }
  openModal() { // Function  to open a default modal and pass data
    const modalRef = this.modalService.open(ModalServiceComponent, { backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.title = 'Definition';
    modalRef.componentInstance.prolog = `Include all MSCs mapped to this SORT, even if only extended to certain locations (SORT will present them appropriately).
     If a new MSC is needed, business to work with Finance to establish code which will make it available for section prior to SORT publish.`;
  }
  clearSSLandCompetency() { // Reset ng-select
    this.detailForm.get('subserviceline').patchValue([]);
    this.detailForm.get('competencyDomain').patchValue([]);
  }
  onRemoveCompetency(event) { // Function to remove competency domain selected by the user
    const matchCompetency = this.detailForm.get('competencyDomain').value.filter((e: any) => e.idSubServiceCode !== event.value.idSubServiceCode);
    this.detailForm.controls.competencyDomain.setValue(matchCompetency);
  }
  selectedDeliveryOption(item: any ) { // Function to get Delivery selected and deselected by the user
    const index = this.selectedDelivery.map(u => u.deliveryMethodName).indexOf(item.deliveryMethodName);
    if (item !== null) {
      if (index !== -1) {
        this.selectedDelivery.splice(index, 1);
        this.selectedDeliveryName.splice(index, 1);
      } else {
        this.selectedDelivery.push(item);
        this.selectedDeliveryName.push(item.deliveryMethodName);
      }
    }
  }
  omitSpecialChar = (event) => event.charCode !== 60 &&  event.charCode !== 62; // Function to avoid special chars

  // Request HTTP - subscribe
  getServicelines() {
    this.serviceLineService.getServiceLineModel()
    .subscribe(
      (data: Array<ServiceLineModel>) => {
        this.serviceLines = data;
        this.allRequest += 1;
        this.allReady();
      },
      error => console.log('Error Service Line', error));
  }
  getSubserviceLineByServiceLine(slCode: string) {
    this.subserviceLineService.getSubserviceLineByServiceLineIntake(slCode)
    .pipe(tap(() => this.loadingSSL = false))
    .subscribe(
      (data: Array<SubServiceLineModel>) =>  this.subServiceLines = data,
      error => console.log('Error SubServiceLine', error));
  }
  getSolutions() {
    this.solutionService.getSolution()
    .subscribe(
      (data: Array<SolutionModel>) => {
        const all = { // Include All default option at the beginning of the array
          idSolution: 99,
          solutionDescription: 'All',
          sortServiceFilters: []
        };
        data.unshift(all);
        this.solutions = data;
        this.allRequest += 1;
        this.allReady();
      },
      error => console.log('Error getSolutions', error));
  }
  getSectors() {
    this.sectorService.getSector()
    .subscribe(
      (data: Array<SectorModel>) => {
        const all = { // Include All default option at the beginning of the array
          idSector: 99,
          sectorName: 'All',
          sortServiceFilters: []
        };
        data.unshift(all);
        this.sectors = data;
        this.allRequest += 1;
        this.allReady();
      },
      error => console.log('Error getSectors', error));
  }
  getClientNeed() {
    this.clientNeedService.getClientNeed()
    .subscribe(
      (data: Array<ClientNeedModel>) => {
        const all = { // Include All default option at the beginning of the array
          idClientNeed: 99,
          clientNeedName: 'All',
          clientNeedDescription: '',
          sortServiceFilters: []
        };
        data.unshift(all);
        this.clientNeeds = data;
        this.allRequest += 1;
        this.allReady();
      },
      error => console.log('Error getSectors', error));
  }
  getAllGfis() {
    this.serviceService.getAllGfis()
    .subscribe(
      (data: Array<any>) => {
        this.gfis = data.map(e => ({...e, merge: e.Gfiscode + ' ' + e.Name})); // add additional key to the object (merge)
        this.allRequest += 1;
        this.allReady();
      },
      error => console.log('Error getAllGfis', error));
  }
  getAllMercury() {
      this.serviceService.getAllMercury()
    .subscribe(
      (data: any) => {
        this.mercury = data.map(e => ({...e, merge: e.MercuryCode + ' ' + e.Name})); // add additional key to the object (merge)
        this.allRequest += 1;
        this.allReady();
      },
      error => console.log('Error getAllMercury', error));
  }
  getAllDelivery() {
    this.deliveryService.getDeliveryMethodsContent()
    .subscribe(
      (data: any) => {
        this.delivery = data.map(item => ({
            idService: 99,
            deliveryMethodName: item.deliveryMethodName,
            deliveryMethodDescription: item.deliveryMethodDescription,
            order: item.order
          }));
        this.allRequest += 1;
        this.allReady();
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  allReady() { // Loading removal function
    if (this.allRequest === 7) { // I make sure the main data is loaded
     this.loading = false;
    }
  }
 // subscribe the field of play response
  getfieldofplaylist() {
    this.fieldofplayservice.getfieldofplay()
      .subscribe((data: Array<FieldOfPlayModel>) => {
        this.storeFieldList = data;
        this.storeFieldList.sort();
        [...this.storeFieldList].sort((a, b) => a.FopName.localeCompare(b.FopName));
      },
        error => console.log('Error getSectors', error));
  }
  // subscribe the Origin of response
  getoriginoflist() {
    this.fieldofplayservice.getOriginOfService()
    .pipe(tap(() => this.loadingSSL = false))
    .subscribe((data: any) => {
      this.originOfList = data;
    });
  }
  submit() { // Validate the form and build structure to submit data
    if (this.detailForm.status === 'VALID') {
      const greyBar = {originOfService : '', serviceLinePrefix : '', serviceTitle : ''};
      this.detailForm.value.IdService = this.IdService;

      if (this.selectedDelivery.length > 0) {
        this.detailForm.value.deliveryMethod = this.selectedDelivery;
      }
      if ( this.detailForm.value.gfisCodes) {
        this.detailForm.value.gfisCodes = this.detailForm.value.gfisCodes.map((e: any) => ({Gfiscode: e.Gfiscode, Name: e.Name}));
      }
      if ( this.detailForm.value.mercuryCodes) {
        this.detailForm.value.mercuryCodes = this.detailForm.value.mercuryCodes.map((delivery: any) => ({MercuryCode: delivery.MercuryCode, Name: delivery.Name}));
      }
      if (this.detailForm.value.serviceline !== '' && this.detailForm.value.serviceline !== null) {
        if (this.oldSL !== '') { // verify if the SL is changed and update permissibility progress
          if (this.oldSL !== this.detailForm.value.serviceline) {
            const tempSL = {  // get Service Line selected by the user to share with other components
              SL: this.detailForm.value.serviceline,
              SLcode: this.serviceLines.filter(e => e.serviceLineName === this.detailForm.value.serviceline)[0].serviceLineCode,
            };
            this.serviceline.emit(tempSL);   // Output to share SL to new-service
            this.oldSL = this.detailForm.value.serviceline;
          }
        } else {
          this.oldSL = this.detailForm.value.serviceline;
          const tempSL = {  // get Service Line selected by the user to share with other components
            SL: this.detailForm.value.serviceline,
            SLcode: this.serviceLines.filter(e => e.serviceLineName === this.detailForm.value.serviceline)[0].serviceLineCode,
          };
          this.serviceline.emit(tempSL);   // Output to share SL to new-service
        }
        greyBar.serviceLinePrefix =  this.serviceLines.filter(e => e.serviceLineName === this.detailForm.value.serviceline)[0].serviceLinePrefix;
      }
      // calculate progress based of mandatory elements
      let totalMandatoryElement = 0;
      Object.keys(this.detailForm.value).map(input => { // iterate each value of the form
        switch (input) { // Only valid mandatory values
          case 'title':
             if (this.detailForm.value.title !== '') {
               totalMandatoryElement += 1;
               greyBar.serviceTitle =  this.detailForm.value.title;
             }
             break;
            case 'OriginOfService':
              if (this.detailForm.value.OriginOfService !== '') {
                greyBar.originOfService =  this.detailForm.value.OriginOfService;
                totalMandatoryElement += 1;
              }
              break;
            case 'serviceline':
              if (this.detailForm.value.serviceline !== '') {
                totalMandatoryElement += 1;
              }
              break;
            case 'subserviceline':
              if (this.detailForm.value.subserviceline.length > 0) {
                totalMandatoryElement += 1;
              }
              break;
            case 'competencyDomain':
              if (this.detailForm.value.competencyDomain.length > 0) {
                totalMandatoryElement += 1;
              }
              break;
            case 'gfisCodes':
              if (this.detailForm.value.gfisCodes.length > 0) {
                totalMandatoryElement += 1;
              }
              break;
            case 'mercuryCodes':
              if (this.detailForm.value.mercuryCodes.length > 0) {
                totalMandatoryElement += 1;
              }
              break;
            case 'headlineDescription':
              if (this.detailForm.value.headlineDescription !== '') {
                totalMandatoryElement += 1;
              }
              break;
            case 'description':
              if (this.detailForm.value.description !== '') {
                totalMandatoryElement += 1;
              }
              break;
          default:
            break;
        }
      });
      this.updateGreyBar.emit(greyBar);
      const progress = {
        title: 'Service Details',
        progress: Math.round(( totalMandatoryElement * 100 ) / 9) };
      if (this.IdService === 0) { // first record
        this.saveForm(this.detailForm.value, progress); // new service detail
      } else { // Update progress record
        this.updateForm(this.detailForm.value, progress); // update service detail
      }
    } else if (this.detailForm.status === 'PENDING') {
      Swal.fire({
        title: '',
        icon: 'info',
        html:
          '<h6>SORT is validating the Service Title. Please wait...</h6>',
          allowOutsideClick: false,
          showConfirmButton: true,
      });
    } else {
      Swal.fire({
        title: '',
        icon: 'error',
        html:
          '<h6>The name of Service already exists.</h6>',
          allowOutsideClick: false,
          showConfirmButton: true,
      });
    }
  }
  saveForm(detailForm, progress) { // Function to send complete form to Database - subscribe
    const thisElement = this;
    this.savedOneTime = true;
    Swal.fire({
      title: '',
      html: '<i class="material-icons material-spin material-2x">sync</i>',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen(this) {
        const promise = new Promise<any>((resolve, reject) => {
          thisElement.insertService.insertServiceDetail(detailForm).subscribe(
            (data: any) => {
              if (data.message === 'OK') {
                const result = JSON.parse(data.value);
                thisElement.enableDelivery.emit(true);
                thisElement.updateIdService.emit(result.IdService);
                thisElement.updateProgress.emit(progress);
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
          },
            errorService => console.log('error endpoint', errorService.message)
          );
        });
        return promise;
      }
    });
  }
  updateForm(detailForm, progress) { // Function to update complete form in Database - subscribe
    this.savedOneTime = true;
    const thisElement = this;
    Swal.fire({
      title: '',
      html: '<i class="material-icons material-spin material-2x">sync</i>',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen(this) {
        const promise = new Promise<any>((resolve, reject) => {
          thisElement.insertService.updateServiceDetail(detailForm).subscribe(
            (data: any) => {
              thisElement.updateProgress.emit(progress);
              thisElement.enableDelivery.emit(true);
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
        });
        return promise;
      }
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
        onOpen(this) {
        }
      });
    }
  }
  cancelForm() { // Function to clean the complete form if the service is new or get previous data if user is agree
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
        if (!this.savedOneTime) {
          this.initializeDetailForm();
          this.IdService = 0;
          this.updateIdService.emit(0);
          this.selectedDelivery = [];
          this.selectedDeliveryName = [];
        } else {
          this.selectedDelivery = [];
          this.selectedDeliveryName = [];
          this.getServiceDetail.emit();
          this.loadingToGetSavedData(true);
        }
      }
    });
  }
}
