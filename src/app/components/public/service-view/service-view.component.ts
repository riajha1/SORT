import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { environment } from 'src/environments/environment';
import { ServiceviewModel, ServiceModel, MercuryCountryModel } from '../../../models/model.index';

import {
  ServiceService,
  UserService,
  CountriesService,
  DeliveryMethodContentService,
  SectorService,
  ServicesService,
  ConfigItemsService
} from '../../../providers/provider.index';

import { ModalServiceComponent } from './default-modal/modal.component';
import { ModalContactComponent } from './contact-modal/modal-contact.component';
import { LocationModalComponent } from './location-modal/location-modal.component';
import { filter } from 'rxjs/internal/operators/filter';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-service-view',
  templateUrl: './service-view.component.html',
  styleUrls: ['./service-view.component.scss']
})
export class ServiceViewComponent implements OnInit, OnDestroy {
  // Variables of components
  loading: boolean;
  serviceId: number = 0;
  countryCode: string;
  serviceIdText: any;
  guidanceRegionLocation: any = { region: '', location: '' };
  filter: any;
  months: any;
  client = '';
  environmentURL = environment.assets;
  prolog: string;
  helpText: string;
  urlDelivery = '';
  urlIndependenceRestriction = '';

  overWritePermissibilityRestriction = false;
  emptyFinance = false;
  activityGrid = '';
  gtc = '';
  totalDeliveryItems = 0;
  totalSector = 0;
  breadcrumb: any;
  dateUpdated = '';
  permissibility: any;
  CountryData: any = [];
  locationData: any;
  country = '';
  textUrl = '';
  editIconVisible = false;

  matchFilter: any = {};
  listOfWords: Array<string> = [];
  highlightFinanceCode = false;
  serviceInfo: ServiceModel;
  showGlobalIndependenceConsiderations = false;
  showCountryIndependenceConsiderations = false;
  considerations: any = { region: '', readmoreRegion: false, location: '', readmoreLocation: false };

  constructor(private userService: UserService,
              private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private location: Location,
              private serviceService: ServiceService,
              private deliveryService: DeliveryMethodContentService,
              private countriesService: CountriesService,
              private sectorService: SectorService,
              private servicesService: ServicesService,
              private configService: ConfigItemsService,
              private router: Router,
              private countryService: CountriesService,
  ) {
    this.loading = true;
    this.serviceData = new ServiceviewModel();
    this.mercuryCountry = new MercuryCountryModel();
    this.serviceInfo = new ServiceModel();
    this.filter = this.userService.filter;
    this.months = this.configService.months;

    this.serviceInfo = new ServiceModel();

    // Force to reload the same url
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.router.navigated = false);

    this.activatedRoute.params.subscribe(params => {
      this.serviceId = params.id;
      this.serviceIdText = params.id;
    });
  }

  // Variables of the finance modal
  loadingFinance = false;
  globalGfis = [];
  localGfis = [];
  mercuryModel = false;

  subscriptionFilter: Subscription;
  subscriptionCountry: Subscription;
  subscriptionCountrySelected: Subscription;
  subscriptionMatch: Subscription;
  subscriptionSector: Subscription;

  // structure of service data
  serviceData: ServiceviewModel;
  mercuryCountry: MercuryCountryModel;



  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const splitted = this.serviceIdText.split('.', 2);
    if (splitted.length > 1) {
      this.getServiceByIdParentVersion(splitted[0], splitted[1]);
    } else {
      this.validateInit(userData);
    }
  }

  validateInit(userData: any) {
    const countryStorage = JSON.parse(localStorage.getItem('locationSelected'));
    if (userData.Roles === 'Service Admin' || userData.Roles === 'Global Admin') {
      this.editIconVisible = true;
    }


    if (this.country === 'GLB') {
      this.showCountryIndependenceConsiderations = false;
    } else {
      this.getCountryConsideration(this.serviceId);
    }
    if (countryStorage !== null) {
      this.userService.saveCountry(countryStorage);
      this.country = countryStorage;
    } else {
      this.country = this.userService.selectedcountry;
      localStorage.setItem('locationSelected', JSON.stringify(this.userService.selectedcountry));
    }
    this.matchFilter = this.servicesService.matchFilter;
    this.totalSector = this.sectorService.sector.length;
    if (this.matchFilter && this.matchFilter.word !== '') {
      this.listOfWords = this.matchFilter.word.trim().split(' ');
    }
    this.subscriptionFilter = this.userService.getfilterApp().subscribe(filternav => {
      this.filter = filternav;
    });
    this.subscriptionSector = this.sectorService.sectorChanged
      .subscribe((sector: any) => this.totalSector = sector.length);

    if (userData !== null) {
      this.userService.getLastFrenquentViewByUser(userData, this.serviceId).subscribe(e => { });
    }
    if (this.CountryData.length === 0) {
      this.getCountry();
    } else {
      this.getLocationOffering(this.serviceId);
      this.updateCountryFinance();
    }
    if (this.totalSector === 0) {
      this.getAllSector(this.serviceId);
    } else {
      this.getBreadcrumbByService(this.serviceId);
    }
    this.getHeader(this.serviceId);
    this.getIndependenceService(this.serviceId, this.country);
    this.getDelivery(this.serviceId);
    this.getConsiderationService(this.serviceId);
    this.getBusinessService(this.serviceId);
    this.getConflictsService(this.serviceId);
    this.getMercuryCode(this.serviceId);
   // this.getContactsIndependece(this.serviceId,this.countrycode);
   this.getContactsQuality(this.serviceId,this.country);
   this.getContactsSL(this.serviceId,this.country);
    this.getISQM(this.serviceId);
    // this.getHighligthService(this.serviceId);
    this.getStandardText();
    this.getDateUpdate(this.serviceId);
    this.updateMatchFilter();
    this.validateMercury();
    this.validateServiceUrl(this.serviceId);
    this.subscriptionCountry = this.countriesService.countryListChanged
      .subscribe((countries: any) => {
        if (countries.all !== undefined) {
          this.CountryData = countries;
          this.getLocationOffering(this.serviceId);
          this.updateCountryFinance();
        }
      });

    this.subscriptionCountrySelected = this.userService.selectedcountryChanged.subscribe(countryCode => {
      this.country = countryCode;
      if (countryCode === "GLB") {
        this.showCountryIndependenceConsiderations = false;
      } else {
        this.getCountryConsideration(this.serviceId);
      }

      console.log('IdService updateCountryFinance', this.serviceId);
      this.getFinanceCode(this.serviceId, countryCode);
      this.getIndependenceService(this.serviceId, countryCode);
      this.getContactsSL(this.serviceId,countryCode);
      this.getContactsQuality(this.serviceId,countryCode)
      this.validateMercury();
    });
  }
  ngOnDestroy() {
    if (this.subscriptionCountry !== undefined) {
      this.subscriptionCountry.unsubscribe();
    }
    if (this.subscriptionMatch !== undefined) {
      this.subscriptionMatch.unsubscribe();
    }
    if (this.subscriptionFilter !== undefined) {
      this.subscriptionFilter.unsubscribe();
    }
    if (this.subscriptionCountrySelected !== undefined) {
      this.subscriptionCountrySelected.unsubscribe();
    }
  }

  back = () => this.location.back();

  // Modal data
  openModal(section: string) {
    const modalRef = this.modalService.open(ModalServiceComponent, { backdrop: 'static', size: 'lg' });
    if (section === 'considerations') {
      modalRef.componentInstance.title = 'Preamble';
      modalRef.componentInstance.prolog = this.prolog;
    } else if (section === 'gtc') {
      modalRef.componentInstance.title = 'GTC Module';
      modalRef.componentInstance.prolog = this.gtc !== '' ? this.gtc : '';
    } else if (section === 'activity') {
      modalRef.componentInstance.title = 'Activity Grid';
      modalRef.componentInstance.prolog = this.activityGrid !== '' ? this.activityGrid : '';
    }
  }
  openContact() {
    const modalRef = this.modalService.open(ModalContactComponent, { backdrop: 'static', size: 'xl' });
    modalRef.componentInstance.contacts = this.serviceData.contactIndependece;
    modalRef.componentInstance.contactsl = this.serviceData.contactsl;
    modalRef.componentInstance.contactQuality = this.serviceData.contactQuality;

  }
  openFinance = (content) => this.modalService.open(content, { backdrop: 'static', size: 'xl' });
  openLocation() {
    const modalRef = this.modalService.open(LocationModalComponent, { backdrop: 'static', size: 'lg' });
    modalRef.componentInstance.country = this.CountryData;
    modalRef.componentInstance.location = this.locationData;
  }

  // Get All Information about the service

  getStandardText() { // help text to each section
    this.serviceService.getStandardText().subscribe(
      (data: any) => {
        if (data) {
          data.map(e => {
            switch (e.Name) {
              case 'IndependenceConsiderationsPreamble':
                this.prolog = e.Value;
                break;
              case 'BreadcrumbHelptText':
                this.helpText = e.Value;
                break;
              case 'Independence Restriction help':
                this.urlIndependenceRestriction = e.Value;
                break;
              case 'Forms of Delivery help':
                this.urlDelivery = e.Value;
                break;
              default:
                break;
            }
          });
        }
      },
      errorService => {
        console.log('error endpoint', errorService.message);
      }
    );
  }
  getHeader(serviceId: number) {
    this.serviceService.getHeaderService(serviceId)
      .then(
        () => this.serviceData.header = this.serviceService.serviceHeader
      )
      .catch(
        () => {
          //If a non-existant ID keyed in via URL, show the warning message and navigate back to home.
          //ToDo. Dilip. Bring this back. this.showServiceNotOfferedMessage();
        }
      );

    //Check the country offers the service. If not, show the warning message and navigate back to home.
    /*
    //ToDo. Dilip. Bring this back.
    this.countryService.isServiceOfferedInCountry(this.userService.selectedcountry, this.serviceId.toString()).subscribe(
      (data: any) => {
        if (data == false) {
          this.showServiceNotOfferedMessage();
        }
      }
    );*/
  }
  showServiceNotOfferedMessage() {
    const thisElement = this;
    Swal.fire({
      title: '',
      icon: 'warning',
      html:
        '<h5>The service is not offered in this location. Click OK.</h5>',
      allowOutsideClick: false,
      confirmButtonText: 'OK',
    }).then((result) => {
      this.router.navigate(['/home']);
    });
  }
  getDelivery(serviceId: number) {
    this.deliveryService.getDeliveryService(serviceId).then(() => {
      this.serviceData.delivery = this.deliveryService.serviceDelivery;
      this.totalDeliveryItems = this.deliveryService.totalDeliveryItems;
    });
  }
  getIndependenceService(serviceId: number, countryCode: string) {
    this.serviceService.getIndependenceService(serviceId, countryCode).then(() => {
      this.serviceData.independece = this.serviceService.serviceIndepende;
    });
  }
  getConsiderationService(serviceId: number) {
    this.serviceService.getConsiderationService(serviceId).subscribe(
      (data: any) => {
        this.serviceData.considerations = data;
        if (this.serviceData.considerations.length == 1 && this.serviceData.considerations[0].IndependenceName == null) {
          this.showGlobalIndependenceConsiderations = false;
        } else {
          this.showGlobalIndependenceConsiderations = true;
        }
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  getBusinessService(serviceId: number) {
    this.serviceService.getBusinessContentService(serviceId).then(() => {
      this.serviceData.business = this.serviceService.serviceBusiness;
      this.activityGrid = this.serviceService.serviceBusiness ? this.serviceService.serviceBusiness.activityGrid : '';
      this.getEyTechnology(this.serviceId);
    });
  }
  getEyTechnology(serviceId: number) {
    this.serviceService.getEyTechnology(serviceId).subscribe(
      (data: any) => this.serviceData.technology = data,
      errorService => console.log('error endpoint', errorService.message));
  }
  getConflictsService(serviceId: number) {
    this.serviceService.getConflictsService(serviceId).then(() => {
      this.serviceData.conflicts = this.serviceService.serviceConflicts;
      if (this.serviceService.serviceConflicts) {
        this.getConflictsDelivery(this.serviceData.conflicts.idConflicts);
      }
    });
  }
  getConflictsDelivery(serviceId: number) {
    this.deliveryService.getConflictsDelivery(serviceId).then(() => {
      this.serviceData.conflictsDelivery = this.deliveryService.conflictDelivery;
    });
  }
  getContactsSL(serviceId: number,countrycode:string) {

    this.serviceService.getContactSolutionService(serviceId,countrycode).then(() => {
      this.serviceData.contactsl = this.serviceService.serviceContactsSl;
      console.log('this.serviceService.serviceContactsSl', this.serviceService.serviceContactsSl)
    });
  }
  getContactsQuality(serviceId: number,countrycode:string) {
    this.serviceService.getContactQualityService(serviceId,countrycode).then(() => {
      this.serviceData.contactQuality = this.serviceService.serviceContactQuality;
      console.log('this.serviceService.serviceContactQuality',this.serviceService.serviceContactQuality);
    });
  }
  // getContactsIndependece(serviceId: number) {
  //   this.serviceService.getContactIndependeceService(serviceId).then(() => {
  //     this.serviceData.contactIndependece = this.serviceService.serviceContactIndependece;
  //   });
  // }


  getISQM(serviceId: number) {
    this.serviceService.getIsqmService(serviceId).subscribe(
      (data: any) => {
        if (data.IdIsqm) {
          this.serviceData.isqm = data;
          this.gtc = data.Gtcmodule;
        }
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  // getHighligthService(serviceId: number) { // cambiara
  //   this.serviceService.getHighligthService(serviceId).then(() => this.permissibility = this.serviceService.highlight);
  // }
  getCountry() {
    this.countriesService.fetchCountries().subscribe(
      (data: any) => {
        this.CountryData = data;
        this.getLocationOffering(this.serviceId);
        this.updateCountryFinance();
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  getLocationOffering(serviceId: number) {
    this.serviceService.getLocationOffering(serviceId).subscribe(
      (data: any) => {
        this.locationData = data;
        this.loading = false;
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  getMercuryCode(serviceId: number) {
    this.serviceService.getMercury(serviceId).subscribe(
      (data: any) => this.serviceData.mercury = data.map(e => ({ ...e, Join: e.MercuryCode + ' - ' + e.Name })),
      errorService => console.log('error endpoint', errorService.message));
  }
  getFinanceCode(serviceId: number, countryCode: string) {
    /** If countrycode is global show both codes (mercury and global gfis)
     * If Pace Model is mercury, global y local will be false
     * If Pace Model is PACE or GFIS global, global will be true, hide mercury code and local
     * If Pace Model is GFIS
     */
    this.highlightFinanceCode = false;
    this.serviceData.gfis = [];
    this.loadingFinance = true;
    this.mercuryModel = false;
    this.localGfis = [];
    this.globalGfis = [];
    this.emptyFinance = false;
    this.serviceService.getGfis(serviceId, countryCode).subscribe(
      (data: any) => {
        if (data.length > 0) {
          this.emptyFinance = false;
          this.loadingFinance = false;
          const filterData = data.filter(e => e.IsGlobal !== null);
          if (filterData.length > 0) {
            const type = filterData[0].IsGlobal; // what is the value of the flag, True is global, false is Local
            if (countryCode === 'GLB') { // Global GFIS
              this.serviceData.gfis = data.filter(e => e.IsGlobal === type && e.PaceModel === null).map(e => ({ ...e, Join: e.Gfiscode + ' - ' + e.Name }));
              this.globalGfis = this.serviceData.gfis; // group by the falg value
              this.localGfis = [];
              this.mercuryModel = false;
            } else {
              const paceModel = filterData[0].PaceModel;
              if (!type && paceModel === 'GFIS Local') {
                this.serviceData.gfis = data.filter(e => e.IsGlobal === type && e.PaceModel === paceModel).map(e => ({ ...e, Join: e.Gfiscode + ' - ' + e.Name }));
                this.localGfis = this.serviceData.gfis;
                this.globalGfis = [];
                this.mercuryModel = false;
              } else {
                if (type && (paceModel === 'PACE' || paceModel === 'GFIS Global')) {
                  this.serviceData.gfis = data.filter(e => e.IsGlobal === type && e.PaceModel === paceModel).map(e => ({ ...e, Join: e.Gfiscode + ' - ' + e.Name }));
                  this.globalGfis = this.serviceData.gfis;
                  this.localGfis = [];
                  this.mercuryModel = false;
                }
              }
            }
          } else {
            const filterNull = data.filter(e => e.IsGlobal === null);
            if (filterNull.length > 0) {
              const paceModel = filterNull[0].PaceModel;
              const type = filterNull[0].IsGlobal; // what is the value of the flag, True is global, false is Local, null mercury
              if (type === null && paceModel === 'Mercury') {
                this.localGfis = [];
                this.globalGfis = [];
                this.mercuryModel = true;
              }
            } else {
              // null result and empty array
              this.serviceData.gfis = [];
              this.localGfis = [];
              this.globalGfis = [];
              this.mercuryModel = false;
            }
          }
        } else {
          this.emptyFinance = true;
          this.loadingFinance = false;
        }
        // Validate if is neccesary to highlight finance Codes item
        const codes = [].concat(this.localGfis, this.globalGfis);
        this.findWordCodes(this.serviceData.mercury, codes);
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  findWordCodes(mercury, codes) {
    if ((codes.length > 0 || mercury.length > 0) && this.listOfWords.length > 0) {
      const a = new RegExp(`(${this.listOfWords.join('|')})`, 'gi');
      codes.map(e => {
        if (!this.highlightFinanceCode) {
          this.highlightFinanceCode = a.test(e.Join);
        }
      });
      mercury.map(e => {
        if (!this.highlightFinanceCode) {
          this.highlightFinanceCode = a.test(e.Join);
        }
      });
    }
  }
  getBreadcrumbByService(idService: number) {
    this.serviceService.getBreadcrumbByService(idService).then(() => {
      this.breadcrumb = {
        sl: this.serviceService.breadcrumb.sl,
        ssl: this.serviceService.breadcrumb.sl.length === 1 ? this.serviceService.breadcrumb.sslshort : this.serviceService.breadcrumb.ssl,
        competency: this.serviceService.breadcrumb.competency,
        sector: this.serviceService.breadcrumb.sector.length === this.totalSector ? ['All Sectors'] : this.serviceService.breadcrumb.sector,
        solution: this.serviceService.breadcrumb.solution,
        client: this.serviceService.breadcrumb.client,
        filter:this.serviceService.breadcrumb.filter,
      };
    });
  }
  getDateUpdate(idService: number) {
    this.serviceService.getDateUpdatedService(idService).subscribe(
      (data: any) => {
        if (data !== '') { // formatting the date
          const date = new Date(Date.parse(data));
          const monthIndex = date.getMonth();
          this.dateUpdated = `${date.getDate()} ${this.months[monthIndex]} ${date.getFullYear()}`;
        } else {
          this.dateUpdated = '';
        }
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  getAllSector(idService) {
    this.sectorService.getSector().subscribe(
      (data: any) => {
        this.totalSector = data.length;
        this.getBreadcrumbByService(idService);
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  // additional functionality
  OverwritePermissibility = (e) => this.overWritePermissibilityRestriction = e === 'Managed services/Operate' ? true : false;

  updateCountryFinance() {
    this.getFinanceCode(this.serviceId, this.country);
    this.getIndependenceService(this.serviceId, this.country);
  }

  updateMatchFilter() {
    this.subscriptionMatch = this.servicesService.matchFiltertChanged
      .subscribe((res: any) => {
        this.matchFilter = res;
        if (this.matchFilter && this.matchFilter.word !== '') {
          this.listOfWords = this.matchFilter.word.trim().split(' ');
          const codes = [].concat(this.localGfis, this.globalGfis);
          this.findWordCodes(this.serviceData.mercury, codes);
        } else {
          this.listOfWords = [];
        }
      });
  }


  validateMercury() {
    if (this.country !== 'GLB') { // validate mercury code against country
      this.mercuryCountry.countryCode = this.country;
      this.mercuryCountry.idService = this.serviceId;
      this.serviceService.getValidateMercury(this.mercuryCountry).subscribe((data: any) => {
        this.serviceData.mercury = data.map(e => ({ ...e, Join: e.MercuryCode + ' - ' + e.Name }));
      });
    } else {
      this.getMercuryCode(this.serviceId);
    }
  }

  getCountryGuidance(countryCode, idservice) {
    this.guidanceRegionLocation = { region: '', location: '' };
    this.serviceService.getServiceLineByCountryCode(countryCode, idservice).subscribe(
      (data: any) => {
        if (data.length > 0) {
          if (data.length === 1) {
            // only region
            if (data[0].CountryCode === this.country) {
              this.guidanceRegionLocation.region = data[0].QualityRegionGuidance;
              this.guidanceRegionLocation.location = data[0].QualityCountryGuidance;
            } else {
              this.guidanceRegionLocation.region = data[0].QualityRegionGuidance;
            }
          } else if (data.length > 1) {
            this.guidanceRegionLocation.region = data[0].QualityRegionGuidance;
            this.guidanceRegionLocation.location = data[1].QualityCountryGuidance;
          }
        }
      },
      errorService => {
        console.log('error endpoint', errorService.message);
        this.guidanceRegionLocation = { region: '', location: '' };
      });
  }

  redirectSam = () => this.router.navigate(['/sam', this.serviceId]);

  validateServiceUrl(serviceId: number) {
    this.serviceService.validateServiceUrl(serviceId).subscribe(
      (data: any) => {
        if (data !== null) {
          this.serviceInfo = data;
          if (this.serviceInfo.IdServiceParent !== null) {
            this.textUrl = `service/${this.serviceInfo.FirstIdServiceParent}.${this.serviceInfo.Version}`;
            this.location.replaceState(this.textUrl);
          } else {
            this.textUrl = `service/${this.serviceInfo.IdService}`;
            this.location.replaceState(this.textUrl);
          }
        }
      }
    );
  }

  async getServiceByIdParentVersion(idService: any, version: any) {
    await this.serviceService.getServiceByIdParentVersion(idService, version).then(() => {
      this.serviceInfo = this.serviceService.serviceInfo;
      const userData = JSON.parse(localStorage.getItem('userData'));
      this.serviceId = this.serviceInfo.IdService;
      // this.serviceId = valuePromise;
      this.validateInit(userData);
    });
  }

  getCountryConsideration(idService) {
    this.serviceService.getCountryConsideration(idService, this.country).subscribe(
      (data: any) => {
        if (data) {
          if (data.IdIndependence) {
            if (data.CountryCode === this.country) {
              this.considerations.region = data.IndependenceRegionConsiderations ? data.IndependenceRegionConsiderations : '';
              this.considerations.location = data.IndependenceCountryConsiderationsText ? data.IndependenceCountryConsiderationsText : '';
            } else {
              this.considerations.region = data.IndependenceRegionConsiderations ? data.IndependenceRegionConsiderations : '';
              this.considerations.location = '';
            }
            if (this.considerations.region !== '' || this.considerations.location !== '') {
              this.showCountryIndependenceConsiderations = true;
            }

          } else {
            this.showCountryIndependenceConsiderations = false;
          }
        } else {
          this.showCountryIndependenceConsiderations = false;
        }
      },
      errorService => console.log('error endpoint', errorService.message));
  }
}
