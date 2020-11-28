import { Component, OnInit, OnChanges, OnDestroy, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService, ServiceService, DeliveryMethodContentService, ServicesService, LocationsOfferedService, OriginServiceService, PermissibilityService } from 'src/app/providers/provider.index';
import { IconsWordModel, LocationsOffered, OriginServiceModel, Permissibilitygetmodel } from 'src/app/models/model.index';
import { MercuryCountryModel } from 'src/app/models/model/mercuryCountry.model';

// POC msWord
// import * as htmlDocx from 'html-docx-js/dist/html-docx';
import { asBlob } from 'html-docx-js-typescript';
import * as FileSaver from 'file-saver';
import { stringify } from 'querystring';
const months = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec'
};
@Component({
  selector: 'app-print-word',
  templateUrl: './print-word.component.html',
  styleUrls: ['./print-word.component.scss']
})
export class PrintWordComponent implements OnInit, OnChanges, OnDestroy {
  // POC WORD - references
  @ViewChild('exportContent', { static: false }) exportContent: ElementRef;


  // Input, Output and references
  @Input() serviceData1: any;
  @Input() breadcrumb: any;
  @Input() dateUpdated: any;
  @Input() country: any;
  @Input() serviceId: any;
  @Input() allCountries: any;
  @Input() permissibility: any;
  @Input() activityGrid: any;

  // @Input() serviceId: any;
  // @ViewChild('pdfService', { static: false }) pdfService: ElementRef;
  iconsWord: IconsWordModel;
  // tslint:disable-next-line: max-line-length

  locationDataExt: any;
  loading: boolean;
  // serviceId: number = 8;
  prolog: string;
  prologDelivery: string;
  prologIndependece: string;
  helpText: string;
  totalDeliveryItems = 0;
  overWrite = false;

  gtc = '';
  originServiceString = '';
  // totalDeliveryItems = 0;
  totalSector = 0;
  // breadcrumb: any;
  // dateUpdated = '';

  CountryData: any;
  locationsData: any;
  // country = '';
  emptyFinance = false;
  listOfWords: Array<string> = [];
  matchFilter: any = {};
  highlightFinanceCode = false;

  loadingFinance = false;
  globalGfis = [];
  localGfis = [];
  mercuryModel = false;

  // Variables of the component
  date = new Date();
  year = this.date.getFullYear();
  monthIndex = this.date.getMonth();
  day = this.date.getDate();
  create = ('0' + this.day).slice(-2) + '/' + ('0' + (this.monthIndex + 1)).slice(-2) + '/' + this.year;
  subscription: Subscription;
  filter: any;
  client = '';
  environmentURL = environment.assets;
  countryCode = '';
  csCountry = '';
  region = '';
  isGlobal = true;
  considerations: any = { region: '', readmoreRegion: false, location: '', readmoreLocation: false };
  guidanceRegionLocation: any = { region: '', location: '' };
  enableReadmore = false;
  highlight = [];

  // local location variables
  locationsOffered: Array<LocationsOffered>;
  originOfService: OriginServiceModel;
  permsibilityget: Permissibilitygetmodel;

  subscriptionCountry: Subscription;
  subscriptionMatch: Subscription;
  // structure of service data

  mercuryCountry: MercuryCountryModel;

  constructor(private userService: UserService, private serviceService: ServiceService, private deliveryService: DeliveryMethodContentService,
    private servicesService: ServicesService, private locationsWordService: LocationsOfferedService, private originService: OriginServiceService,
    private permissibilityservice: PermissibilityService) {
    this.loading = true;
    this.mercuryCountry = new MercuryCountryModel();
    this.iconsWord = new IconsWordModel();
    this.filter = this.userService.filter;
    this.locationsOffered = new Array<LocationsOffered>();
    this.originOfService = new OriginServiceModel();
    this.permsibilityget = new Permissibilitygetmodel();
  }

  ngOnInit() {
    this.updateCountry();
    if (this.country !== 'GLB') {
      this.getCountryGuidance(this.country, this.serviceId);
    }
    this.formatAMPM(this.date);
    this.matchFilter = this.servicesService.matchFilter;
    if (this.matchFilter && this.matchFilter.word !== '') {
      this.listOfWords = this.matchFilter.word.trim().split(' ');
    }
    this.updateFilter();
    this.country = this.userService.selectedcountry;
    this.getStandardText();
    this.getLocationOffering(this.serviceId);
    this.getISQM(this.serviceId);
    this.getOriginOfService(this.serviceId);


    if (this.country !== 'GLB') {
      this.getNameAndRegion(this.country);
    } else {
      this.countryCode = this.country;
    }
    this.updateCountryFinance();
  }
  getOriginOfService(serviceId: any) {
    this.originService.getService(this.serviceId).subscribe(data => {
      this.originOfService = data;
      this.originServiceString = this.originOfService.IsGlobal === true ? 'Globally driven' : 'Local market';
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'permissibility': {
            if (this.permissibility !== undefined) {
              this.updateFilter(true);
            }
          }
        }
      }
    }
  }

  updateCountryFinance() {

    this.getFinanceCode(this.serviceId, this.country);
    // this.getIndependenceService(this.serviceId, this.country);
    this.subscriptionCountry = this.userService.selectedcountryChanged.subscribe(countryCode => {
      this.country = countryCode;
      this.getFinanceCode(this.serviceId, countryCode);
      // this.getIndependenceService(this.serviceId, countryCode);
      this.validateMercury();

    });
  }
  validateMercury() {
    if (this.country !== 'GLB') { // validate mercury code against country
      this.mercuryCountry.countryCode = this.country;
      this.mercuryCountry.idService = this.serviceId;
      this.serviceService.getValidateMercury(this.mercuryCountry).subscribe((data: any) => {
        this.serviceData1.mercury = data.map(e => ({ ...e, Join: e.MercuryCode + ' - ' + e.Name }));
      });
    } else {
      this.getMercuryCode(this.serviceId);
    }
  }

  getMercuryCode(serviceId: number) {
    this.serviceService.getMercury(serviceId).subscribe(
      (data: any) => this.serviceData1.mercury = data.map(e => ({ ...e, Join: e.MercuryCode + ' - ' + e.Name })),
      errorService => console.log('error endpoint', errorService.message));
  }

  updateCountry() {
    this.subscriptionCountry = this.userService.selectedcountryChanged.subscribe(
      countryCode => {
        this.country = countryCode;
        if (countryCode !== 'GLB') {
          this.getCountryGuidance(this.country, this.serviceId);
          this.getNameAndRegion(countryCode);
        } else {
          this.guidanceRegionLocation = { region: '', location: '' };
          this.isGlobal = true;
        }
      });
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

  getISQM(serviceId: number) {
    this.serviceService.getIsqmService(serviceId).subscribe(
      (data: any) => {
        if (data.IdIsqm) {
          this.serviceData1.isqm = data;
          this.gtc = data.Gtcmodule;
        }
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  getNameAndRegion(countryCode) {
    this.csCountry = this.allCountries.all.filter(e => e.countryCode === countryCode)[0].countryName;
    this.region = this.allCountries.all.filter(e => e.countryCode === countryCode)[0].region;
    this.countryCode = countryCode;
    this.getCountryConsideration(this.serviceId, this.countryCode);
  }
  getCountryConsideration(idService, countryCode) {
    this.isGlobal = true;
    this.loading = true;
    this.serviceService.getCountryConsideration(idService, countryCode).subscribe(
      (data: any) => {
        if (data) {
          this.isGlobal = false;
          if (data.IdIndependence) {
            if (data.CountryCode === this.countryCode) {
              this.considerations.region = data.IndependenceRegionConsiderations ? data.IndependenceRegionConsiderations : '';
              this.considerations.readmoreRegion = data.IndependenceRegionConsiderations && data.IndependenceRegionConsiderations.length > 350 ? true : false;
              this.considerations.location = data.IndependenceCountryConsiderationsText ? data.IndependenceCountryConsiderationsText : '';
              this.considerations.readmoreLocation = data.IndependenceCountryConsiderationsText && data.IndependenceCountryConsiderationsText.length > 350 ? true : false;
            } else {
              this.considerations.region = data.IndependenceRegionConsiderations ? data.IndependenceRegionConsiderations : '';
              this.considerations.readmoreRegion = data.IndependenceRegionConsiderations.length > 350 ? true : false;
              this.considerations.location = '';
              this.considerations.readmoreLocation = false;
            }
          } else {
            this.isGlobal = true;
            this.considerations = { region: '', readmoreRegion: false, location: '', readmoreLocation: false };
          }
        } else {
          this.isGlobal = true;
        }
        this.loading = false;
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  updateFilter(initial = false) {
    this.subscription = this.userService.getfilterApp().subscribe(filter => {
      if (this.permissibility !== undefined) {
        const serviceLineCode = this.permissibility.find(d => d.serviceLineCode);
        if (serviceLineCode !== undefined) {
          this.permissibilityservice.getColumndata(serviceLineCode.serviceLineCode).subscribe(data => {
            this.permsibilityget = data;
          });
        }

        this.filter = filter;
        this.getHighLightItem(filter);
      }
    });
    if (initial) {
      this.getHighLightItem(this.filter);
    }

  }

  getHighLightItem(filter) {
    this.overWrite = false;
    if (this.permissibility.length > 0) {
      this.permissibility.map(e => {
        if (filter.client.GISId === e.gisid) {
          this.overWrite = true;
          if (e.secaudited !== '') {
            this.highlight.push(1);
          }
          if (e.secsubject !== '') {
            this.highlight.push(2);
          }
          if (e.euaudited !== '') {
            this.highlight.push(3);
          }
          if (e.eusubject !== '') {
            this.highlight.push(4);
          }
          if (e.euAuditedNoValuation !== '') {
            this.highlight.push(5);
          }
          if (e.otAudited !== '') {
            this.highlight.push(6);
          }
          if (e.otSubject !== '') {
            this.highlight.push(7);
          }
          if (e.ch1 !== '') {
            this.highlight.push(8);
          }
          if (e.ch1nsa !== '' && e.ch1nsa !== null) {
            this.highlight.push(9);
          }
          if (e.ch2 !== '') {
            this.highlight.push(10);
          }
        }
      });
    }

  }

  formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    this.create = this.create + ' ' + strTime;
  }
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  getStandardText() { // help text to each section
    this.serviceService.getStandardText().subscribe(
      (data: any) => {
        if (data) {
          data.map(e => {
            switch (e.Name) {
              case 'IndependenceConsiderationsPreamble':
                this.prolog = e.Value;
                break;
              case 'DeliveryMethodIntroduction':
                this.prologDelivery = e.Value;
                break;
              case 'IndependenceRestrictionIntroduction':
                this.prologIndependece = e.Value;
                break;
              case 'BreadcrumbHelptText':
                this.helpText = e.Value;
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

  getEyTechnology(serviceId: number) {
    this.serviceService.getEyTechnology(serviceId).subscribe(
      (data: any) => this.serviceData1.technology = data,
      errorService => console.log('error endpoint', errorService.message));
  }

  getConflictsDelivery(serviceId: number) {
    this.deliveryService.getConflictsDelivery(serviceId).then(() => {
      this.serviceData1.conflictsDelivery = this.deliveryService.conflictDelivery;
    });
  }

  getLocationOffering(serviceId: number) {
    this.locationsWordService.getLocationOfferingWord(serviceId).subscribe(
      (data: any) => {

        this.locationsOffered = data;

        // this.GroupLocations();
      },
      errorService => console.log('error endpoint', errorService.message));
  }

  getFinanceCode(serviceId: number, countryCode: string) {
    /** If countrycode is global show both codes (mercury and global gfis)
     * If Pace Model is mercury, global y local will be false
     * If Pace Model is PACE or GFIS global, global will be true, hide mercury code and local
     * If Pace Model is GFIS
     */
    this.serviceData1.gfis = [];
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
              this.serviceData1.gfis = data.filter(e => e.IsGlobal === type && e.PaceModel === null);
              this.globalGfis = this.serviceData1.gfis; // group by the falg value
              this.localGfis = [];
              this.mercuryModel = false;
            } else {
              const paceModel = filterData[0].PaceModel;
              if (!type && paceModel === 'GFIS Local') {
                this.serviceData1.gfis = data.filter(e => e.IsGlobal === type && e.PaceModel === paceModel);
                this.localGfis = this.serviceData1.gfis;
                this.globalGfis = [];
                this.mercuryModel = false;
              } else {
                if (type && (paceModel === 'PACE' || paceModel === 'GFIS Global')) {
                  this.serviceData1.gfis = data.filter(e => e.IsGlobal === type && e.PaceModel === paceModel);
                  this.globalGfis = this.serviceData1.gfis;
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
              this.serviceData1.gfis = [];
              this.localGfis = [];
              this.globalGfis = [];
              this.mercuryModel = false;
            }
          }
        } else {
          this.emptyFinance = true;
          this.loadingFinance = false;
        }
      },
      errorService => console.log('error endpoint', errorService.message));
  }

  updateMatchFilter() {
    this.subscriptionMatch = this.servicesService.matchFiltertChanged
      .subscribe((res: any) => {
        this.matchFilter = res;
        if (this.matchFilter && this.matchFilter.word !== '') {
          this.listOfWords = this.matchFilter.word.trim().split(' ');
          const codes = [].concat(this.localGfis, this.globalGfis);
          this.findWordCodes(this.serviceData1.mercury, codes);
        } else {
          this.listOfWords = [];
        }
      });
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

  saveWord() {
    let htmlDocument = '<!DOCTYPE html><html><head><meta charset="utf-8"><title></title>';
    htmlDocument = htmlDocument + '</head><body>' + this.exportContent.nativeElement.innerHTML + '</body></html>';
    // const converted = htmlDocx.asBlob(htmlDocument);
    // console.log(htmlDocument);
    asBlob(htmlDocument).then(data => {
      FileSaver.saveAs(data, this.serviceData1.header.title + '.docx');
    });
  }
}
