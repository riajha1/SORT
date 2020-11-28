import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { LocationFilterNode, ServiceModel } from '../../../../../models/model.index';
import { ServiceService } from '../../../../../providers/services/service.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-new-service',
  templateUrl: './new-service.component.html',
  styleUrls: ['./new-service.component.scss']
})
export class NewServiceComponent implements OnInit {

  showEditIcon = false;
  readonly = true;
  // component variables
  IdService = 0;
  idServiceValidation = 0;
  serviceline: any = { SL: '', SLcode: 0, prefix: '' };
  deliverySaved: boolean = false;
  selectedDelivery: any;
  defaultTreeCountry: LocationFilterNode[] = [];
  countryList: Array<any> = [];
  locationServiceTree: any = [];
  enableLocalTree: boolean = false;
  labelSidebar = 'Add Service';
  greyBarData: any = {
    originOfService: '',
    serviceLinePrefix: '',
    serviceTitle: '',
    idService: 0
  };

  // Variable to store data from database
  serviceDetail: any = {};
  location = [];
  businessContactsGlobal = [];
  businessContactsLocal = [];
  qualityContactsGlobal = [];
  qualityContactsLocal = [];
  otherDetail: any = {};
  permissibilityGlobal: any = {};
  permissibilityLocal: any = [];
  activityGrid = '';
  SLguidanceGlobal = '';
  SLguidanceLocal = [];
  independenceConsiderationGlobal = [];
  independenceConsiderationLocal = [];
  EYGuidanceTechnology = '';
  TechnologiesTools = [];
  progressStatusTechnology = '0';
  progressStatusGuidance = '0';
  progressStatusOther = '0';
  publishLocations = [];
  textUrl = '';
  serviceIdText: any;

  serviceInfo: ServiceModel;

  // template to render in sidebar component
  sidebar = [
    {
      id: 0,
      title: 'Service Details',
      subtitle: 'Business Sponsor',
      progress: 0,
      active: true
    },
    {
      id: 2,
      title: 'Locations Offered',
      subtitle: 'Business Sponsor',
      progress: 0,
      active: false
    },
    {
      id: 3,
      title: 'Business Contacts',
      subtitle: 'Business Sponsor',
      progress: 0,
      active: false
    },
    {
      id: 4,
      title: 'EY Technology',
      subtitle: 'Service Line Quality',
      progress: 0,
      active: false
    },
    {
      id: 5,
      title: 'Service Line Guidance',
      subtitle: 'Service Line Quality',
      progress: 0,
      active: false
    },
    {
      id: 6,
      title: 'Quality / Indep. Contacts',
      subtitle: 'Service Line Quality and Independence',
      progress: 0,
      active: false
    },
    {
      id: 7,
      title: 'Independence Permissibility',
      subtitle: 'Service Line Independence Consultant',
      progress: 0,
      active: false
    },
    {
      id: 8,
      title: 'Independence Considerations',
      subtitle: 'Service Line Independence Consultant',
      progress: 0,
      active: false
    },
    {
      id: 9,
      title: 'Conflicts Considerations',
      subtitle: 'Conflicts',
      progress: 0,
      active: false
    },
    {
      id: 10,
      title: 'Other',
      subtitle: '',
      progress: 0,
      active: false
    },
    {
      id: 11,
      title: 'Service Summary',
      subtitle: '',
      progress: 0,
      active: false
    }
  ];

  constructor(private serviceService: ServiceService, private activatedRoute: ActivatedRoute, private locationUrl: Location) {
    this.serviceInfo = new ServiceModel();
    this.activatedRoute.params.subscribe(params => {
      if (params.idService !== undefined) {
        this.serviceIdText = params.idService;
        this.labelSidebar = 'Edit Service';
      } else {
        this.readonly = false;
      }
    }); // Get the IdService
  }
  ngOnInit() {
    const splitted = this.serviceIdText.split('.', 2);
    if (splitted.length > 1) {
      this.getServiceByIdParentVersion(splitted[0], splitted[1]);
    } else {
      this.IdService = this.serviceIdText;
      this.validateInit();
    }
  }

  validateInit() {
    if (this.IdService !== 0) {
      this.ValidateServiceVersion(this.IdService);
      this.validateServiceUrl(this.IdService);
      this.getPublishedlocations();
      this.getProgressBar();
      this.getServiceDetail();
      this.getLocationById();
      this.getBusinessContact();
      this.getQualityContact();
      this.getEyTechnologyById();
      this.getPermissibilityById();
      this.getGuidanceById();
      this.getIndependenceConsiderationById();
      this.getConflictById();
      this.getOtherById();
    }
  }

  ValidateServiceVersion(idService: any) {
    this.serviceService.validateServiceVersion(idService).subscribe(response => {
      this.IdService = response;
    });
  }
  getPublishedlocations() {
    this.serviceService.getPublishedlocations(this.IdService).subscribe(response => {
      if (response.length > 0) {
        const groupByRegion = [];
        const groupByCountry = [];
        // filter global contacts
        const global = response.filter((item: any) => item.CountryCode === 'GLB');
        if (global.length > 0) {
          const temp = {
            expandable: true,
            level: 0,
            name: global[0].CountryCode,
            selected: false,
            RIL: false,
            RSQL: false,
            status: global[0].Status,
            enable: false,
            id: global[0].Id,
            update: global[0].ModifcationDate,
            create: global[0].CreationDate
          };
          this.publishLocations.push(temp);
        }
        response.filter((item: any) => item.CountryCode === '').map(e => {
          if (e.RegionCode !== '') {
            const exists = groupByRegion.find(item => item.name === e.RegionCode);
            if (exists === undefined) {
              const temp = {
                expandable: true,
                level: 2,
                name: e.RegionCode,
                selected: true,
                RIL: false,
                RSQL: false,
                status: e.Status,
                enable: false,
                id: e.Id,
                update: e.ModifcationDate,
                create: e.CreationDate
              };
              groupByRegion.push(temp);
            }
          }
        });
        // Filter local contacts and transform to the tree structure
        response.filter((item: any) => item.CountryCode !== '' && item.CountryCode !== 'GLB').map(e => {
          if (e.RegionCode !== '') {
            const exists = groupByCountry.find(item => item.name === e.CountryCode);
            if (exists === undefined) {
              const temp = {
                expandable: false,
                level: 3,
                name: e.CountryCode,
                selected: true,
                RIL: false,
                RSQL: false,
                status: e.Status,
                enable: false,
                id: e.Id,
                update: e.ModifcationDate,
                create: e.CreationDate
              };
              groupByCountry.push(temp);
            }
          }
        });
        const locations = [].concat(groupByRegion, groupByCountry);
        this.publishLocations = [].concat(this.publishLocations, locations);
      }
    });
  }
  getProgressBar() {
    // update the template of the sidebar with the progress of te service
    this.serviceService.getProgressBarById(this.IdService).subscribe(e => {
      if (e !== null) {
        this.sidebar[0].id = e.Id;
        this.sidebar[0].progress = e.ServiceDetails;
        this.sidebar[1].progress = e.LocationsOffered;
        this.sidebar[2].progress = e.BusinessContacts;
        this.sidebar[3].progress = e.Eytechnology;
        this.sidebar[4].progress = e.ServiceLineGuidance;
        this.sidebar[5].progress = e.QualityContacts;
        this.sidebar[6].progress = e.IndependencePermissibility;
        this.sidebar[7].progress = e.IndependenceConsiderations;
        this.sidebar[8].progress = e.ConflictsConsiderations;
        this.sidebar[9].progress = e.Other;
        this.sidebar[10].progress = this.sidebar.filter(item => item.progress.toString() !== '100').length !== 1 ? 0 : 100;
      }
    });
  }
  getServiceDetail() {
    this.serviceService.getServiceDetailById(this.IdService).subscribe(res => {
      this.greyBarData.serviceTitle = res.ServiceTitle;
      this.greyBarData.idService = this.IdService;
      if (res.OriginService !== null && res.OriginService.Prefix !== undefined) {
        this.greyBarData.originOfService = res.OriginService.Prefix;
      }
      if (res.SubServiceLine.length > 0) { // transform SubServiceLine object and remove prefix to the SubServiceName, include subServiceLineName key
        const modifySSL = [];
        res.SubServiceLine.map(item => {
          const position = item.SubServiceLineName.indexOf('-') + 1;
          item.SubServiceLineName.replace('-', '');
          const splitlabel = item.SubServiceLineName.substring(position);
          const temp = { ...item, subServiceLineName: splitlabel };
          modifySSL.push(temp);
        });
        res.SubServiceLine = modifySSL;
      }
      if (res.CompetencyDomain.length > 0) { // include competencyDomainName key
        res.CompetencyDomain = res.CompetencyDomain.map(item => ({ ...item, competencyDomainName: item.CompetencyDomainName }));
      }
      if (res.Solution.length > 0) { // include solutionDescription key
        res.Solution = res.Solution.map(item => ({ ...item, solutionDescription: item.SolutionDescription }));
      }
      if (res.Sector.length > 0) { // include sectorName key
        res.Sector = res.Sector.map(item => ({ ...item, sectorName: item.SectorName }));
      }
      if (res.ClientNeed.length > 0) { // include clientNeedName key
        res.ClientNeed = res.ClientNeed.map(item => ({ ...item, clientNeedName: item.ClientNeedName }));
      }
      if (res.GfisCodes.length > 0) { // include merge key
        res.GfisCodes = res.GfisCodes.map(item => ({ ...item, merge: item.Gfiscode + ' ' + item.Name }));
      }
      if (res.MercuryCodes.length > 0) { // include merge key
        res.MercuryCodes = res.MercuryCodes.map(item => ({ ...item, merge: item.MercuryCode + ' ' + item.Name }));
      }
      if (res.DeliveryMethod.length > 0) { // include deliveryMethodName, deliveryMethodDescription keys
        res.DeliveryMethod = res.DeliveryMethod.map(item => ({ ...item, deliveryMethodName: item.DeliveryMethodName, deliveryMethodDescription: item.DeliveryMethodDescription }));
      }
      this.serviceDetail = res; // Store service detail object
      if (res.ServiceLine.length > 0) { // If exist a service line, initialize serviceline object
        this.greyBarData.serviceLinePrefix = res.ServiceLine[0].ServiceLinePrefix;
        const temp = { SL: res.ServiceLine[0].ServiceLineName, SLcode: res.ServiceLine[0].ServiceLineCode };
        this.updateServiceLine(temp);
      }
    });
  }
  getLocationById() {
    this.serviceService.getLocationById(this.IdService).subscribe(res => {
      this.location = res; // Store location object
      this.getLocationServiceTree(res);
    });
  }
  getBusinessContact() {
    this.serviceService.getBusinessContactById(this.IdService).subscribe(res => {
      if (res.length > 0) {
        const groupByRegion = [];
        const groupByCountry = [];
        // filter global contacts
        this.businessContactsGlobal = res.filter((item: any) => item.CountryCode === 'GLB');
        res.filter((item: any) => item.CountryCode === '').map(e => {
          if (e.Region !== '') {
            const exists = groupByRegion.find(item => item.name === e.Region);
            if (exists === undefined) {
              const temp = {
                expandable: true,
                level: 2,
                name: e.Region,
                selected: true,
                contact: [{
                  IdContacts: e.IdContacts,
                  IdService: this.IdService,
                  IdSolutionContacts: e.IdSolutionContacts,
                  IdserviceCountry: e.IdServiceCountry,
                  Location: e.Location,
                  Mail: e.Mail,
                  Name: e.Name,
                  Order: 1,
                  Title: e.Title,
                  Url: e.Url
                }]
              };
              groupByRegion.push(temp);
            } else {
              const temp = [{
                IdContacts: e.IdContacts,
                IdService: this.IdService,
                IdSolutionContacts: e.IdSolutionContacts,
                IdserviceCountry: e.IdServiceCountry,
                Location: e.Location,
                Mail: e.Mail,
                Name: e.Name,
                Order: 1,
                Title: e.Title,
                Url: e.Url
              }];
              exists.contact = [].concat(exists.contact, temp);
            }
          }
        });
        // Filter local contacts and transform to the tree structure
        res.filter((item: any) => item.CountryCode !== '' && item.CountryCode !== 'GLB').map(e => {
          if (e.Region !== '') {
            const exists = groupByCountry.find(item => item.name === e.CountryCode);
            if (exists === undefined) {
              const temp = {
                expandable: false,
                level: 3,
                name: e.CountryCode,
                selected: true,
                contact: [{
                  IdContacts: e.IdContacts,
                  IdService: this.IdService,
                  IdSolutionContacts: e.IdSolutionContacts,
                  IdserviceCountry: e.IdServiceCountry,
                  Location: e.Location,
                  Mail: e.Mail,
                  Name: e.Name,
                  Order: 1,
                  Title: e.Title,
                  Url: e.Url
                }]
              };
              groupByCountry.push(temp);
            } else {
              const temp = [{
                IdContacts: e.IdContacts,
                IdService: this.IdService,
                IdSolutionContacts: e.IdSolutionContacts,
                IdserviceCountry: e.IdServiceCountry,
                Location: e.Location,
                Mail: e.Mail,
                Name: e.Name,
                Order: 1,
                Title: e.Title,
                Url: e.Url
              }];
              exists.contact = [].concat(exists.contact, temp);
            }
          }
        });
        this.businessContactsLocal = [].concat(groupByRegion, groupByCountry);
      }
    });
  }
  getQualityContact() {
    this.serviceService.getQualityContactById(this.IdService).subscribe(res => {
      if (res.length > 0) {
        const groupByRegion = [];
        const groupByCountry = [];
        // filter global contacts
        this.qualityContactsGlobal = res.filter((item: any) => item.CountryCode === 'GLB');
        res.filter((item: any) => item.CountryCode === '').map(e => {
          if (e.Region !== '') {
            const exists = groupByRegion.find(item => item.name === e.Region);
            if (exists === undefined) {
              const temp = {
                expandable: true,
                level: 2,
                name: e.Region,
                selected: true,
                contact: [{
                  IdContacts: e.IdContacts,
                  IdService: this.IdService,
                  IdSolutionContacts: e.IdSolutionContacts,
                  IdserviceCountry: e.IdServiceCountry,
                  Location: e.Location,
                  Mail: e.Mail,
                  Name: e.Name,
                  Order: 1,
                  Title: e.Title,
                  Url: e.Url
                }]
              };
              groupByRegion.push(temp);
            } else {
              const temp = [{
                IdContacts: e.IdContacts,
                IdService: this.IdService,
                IdSolutionContacts: e.IdSolutionContacts,
                IdserviceCountry: e.IdServiceCountry,
                Location: e.Location,
                Mail: e.Mail,
                Name: e.Name,
                Order: 1,
                Title: e.Title,
                Url: e.Url
              }];
              exists.contact = [].concat(exists.contact, temp);
            }
          }
        });
        // Filter local contacts and transform to the tree structure
        res.filter((item: any) => item.CountryCode !== '' && item.CountryCode !== 'GLB').map(e => {
          if (e.Region !== '') {
            const exists = groupByCountry.find(item => item.name === e.CountryCode);
            if (exists === undefined) {
              const temp = {
                expandable: false,
                level: 3,
                name: e.CountryCode,
                selected: true,
                contact: [{
                  IdContacts: e.IdContacts,
                  IdService: this.IdService,
                  IdSolutionContacts: e.IdSolutionContacts,
                  IdserviceCountry: e.IdServiceCountry,
                  Location: e.Location,
                  Mail: e.Mail,
                  Name: e.Name,
                  Order: 1,
                  Title: e.Title,
                  Url: e.Url
                }]
              };
              groupByCountry.push(temp);
            } else {
              const temp = [{
                IdContacts: e.IdContacts,
                IdService: this.IdService,
                IdSolutionContacts: e.IdSolutionContacts,
                IdserviceCountry: e.IdServiceCountry,
                Location: e.Location,
                Mail: e.Mail,
                Name: e.Name,
                Order: 1,
                Title: e.Title,
                Url: e.Url
              }];
              exists.contact = [].concat(exists.contact, temp);
            }
          }
        });
        this.qualityContactsLocal = [].concat(groupByRegion, groupByCountry);
      }
    });
  }
  getEyTechnologyById() {
    this.progressStatusTechnology = '0';
    this.EYGuidanceTechnology = '';
    this.TechnologiesTools = [];
    this.serviceService.getEyTechnologyById(this.IdService).subscribe(e => {
      this.EYGuidanceTechnology = e.EYGuidanceTechnology;
      this.TechnologiesTools = e.TechnologiesTools;
      this.progressStatusTechnology = this.sidebar[3].progress.toString();
      this.loadingToGetSavedData();
    });
  }
  getPermissibilityById() {
    this.permissibilityLocal = [];
    this.serviceService.getPermissibilityById(this.IdService).subscribe(e => {
      this.activityGrid = e.ActivityGrid === null ? '' : e.ActivityGrid; // Store Activity grid
      if (e.Considerations.length > 0) {
        this.permissibilityGlobal = e.Considerations.filter(permissibility => permissibility.CountryCode === 'GLB').length > 0 ? e.Considerations.filter(item => item.CountryCode === 'GLB')[0] : {};
        const groupByCountry = e.Considerations.filter((countryPermissibility: any) => countryPermissibility.CountryCode !== 'GLB');
        const templatePermissibilityLocal = [];
        if (groupByCountry.length > 0) { // Transform all local data to the tree template
          groupByCountry.map(option => {
            const temp = {
              deviation: false,
              expandable: false,
              level: 3,
              name: option.CountryCode,
              permissibility: {
                SecauditedValue: option.SecauditedValue,
                SecsubjectValue: option.SecsubjectValue,
                EuauditedValue: option.EuauditedValue,
                EusubjectValue: option.EusubjectValue,
                EuAuditedNoValuationValue: option.EuAuditedNoValuationValue,
                OtAuditedValue: option.OtAuditedValue,
                OtSubjectValue: option.OtSubjectValue,
                Ch1Value: option.Ch1Value,
                Ch1NsaValue: option.Ch1nsaValue === null ? '' : option.Ch1nsaValue,
                Ch2Value: option.Ch2Value,
                deviationCh1Value: option.Ch1Value === this.permissibilityGlobal.Ch1Value ? false : true,
                deviationCh1NsaValue: option.Ch1nsaValue === this.permissibilityGlobal.Ch1nsaValue ? false : true,
                deviationCh2Value: option.Ch2Value === this.permissibilityGlobal.Ch2Value ? false : true,
                deviationEuAuditedNoValuationValue: option.EuAuditedNoValuationValue === this.permissibilityGlobal.EuAuditedNoValuationValue ? false : true,
                deviationEuauditedValue: option.EuauditedValue === this.permissibilityGlobal.EuauditedValue ? false : true,
                deviationEusubjectValue: option.EusubjectValue === this.permissibilityGlobal.EusubjectValue ? false : true,
                deviationOtAuditedValue: option.OtAuditedValue === this.permissibilityGlobal.OtAuditedValue ? false : true,
                deviationOtSubjectValue: option.OtSubjectValue === this.permissibilityGlobal.OtSubjectValue ? false : true,
                deviationSecauditedValue: option.SecauditedValue === this.permissibilityGlobal.SecauditedValue ? false : true,
                deviationSecsubjectValue: option.SecsubjectValue === this.permissibilityGlobal.SecsubjectValue ? false : true
              },
              permissibilityGlobal: {
                SecauditedValue: this.permissibilityGlobal.SecauditedValue,
                SecsubjectValue: this.permissibilityGlobal.SecsubjectValue,
                EuauditedValue: this.permissibilityGlobal.EuauditedValue,
                EusubjectValue: this.permissibilityGlobal.EusubjectValue,
                EuAuditedNoValuationValue: this.permissibilityGlobal.EuAuditedNoValuationValue,
                OtAuditedValue: this.permissibilityGlobal.OtAuditedValue,
                OtSubjectValue: this.permissibilityGlobal.OtSubjectValue,
                Ch1Value: this.permissibilityGlobal.Ch1Value,
                Ch1NsaValue: this.permissibilityGlobal.Ch1nsaValue === null ? '' : this.permissibilityGlobal.Ch1nsaValue,
                Ch2Value: this.permissibilityGlobal.Ch2Value,
                deviationCh1Value: false,
                deviationCh1NsaValue: false,
                deviationCh2Value: false,
                deviationEuAuditedNoValuationValue: false,
                deviationEuauditedValue: false,
                deviationEusubjectValue: false,
                deviationOtAuditedValue: false,
                deviationOtSubjectValue: false,
                deviationSecauditedValue: false,
                deviationSecsubjectValue: false
              }
            };
            templatePermissibilityLocal.push(temp);
          });
        }
        this.permissibilityLocal = templatePermissibilityLocal;
      }
    });
  }
  getGuidanceById() {
    this.progressStatusGuidance = '0';
    this.SLguidanceGlobal = '';
    this.serviceService.getGuidanceById(this.IdService).subscribe(result => {
      this.SLguidanceGlobal = result.GlobalGuidance === null ? '' : result.GlobalGuidance;
      if (result.LocalGuidance.length > 0) {
        const groupByRegion = [];
        const groupByCountry = [];
        result.LocalGuidance.filter((item: any) => item.CountryCode === '').map(e => {
          if (e.RegionCode !== '') {
            const exists = groupByRegion.find(item => item.name === e.RegionCode);
            if (exists === undefined) {
              const temp = {
                expandable: true,
                level: 2,
                name: e.RegionCode,
                selected: true,
                text: e.QualityRegionGuidance
              };
              groupByRegion.push(temp);
            }
          }
        });
        result.LocalGuidance.filter((item: any) => item.CountryCode !== '').map(e => {
          if (e.RegionCode !== '') {
            const exists = groupByCountry.find(item => item.name === e.CountryCode);
            if (exists === undefined) {
              const temp = {
                expandable: false,
                level: 3,
                name: e.CountryCode,
                selected: true,
                text: e.QualityCountryGuidance
              };
              groupByCountry.push(temp);
              const existsRegion = groupByRegion.find(item => item.name === e.RegionCode);
              if (existsRegion === undefined) {
                const temp1 = {
                  expandable: true,
                  level: 2,
                  name: e.RegionCode,
                  selected: true,
                  text: e.QualityRegionGuidance
                };
                groupByRegion.push(temp1);
              }
            }
          }
        });
        this.SLguidanceLocal = [].concat(groupByRegion, groupByCountry);

      }
      this.progressStatusGuidance = this.sidebar[4].progress.toString();
      this.loadingToGetSavedData();
    });
  }
  getIndependenceConsiderationById() {
    this.serviceService.getIndependenceConsiderationById(this.IdService).subscribe(result => {
      // console.log('independence considerations', result);
      this.independenceConsiderationGlobal = result.Independence.length > 0 ? result.Independence : [];
      if (result.IndependenceCountries.length > 0) {
        const groupByRegion = [];
        const groupByCountry = [];
        result.IndependenceCountries.filter((item: any) => item.CountryCode === '').map(e => {
          if (e.RegionCode !== '') {
            const exists = groupByRegion.find(item => item.name === e.RegionCode);
            if (exists === undefined) {
              const temp = {
                expandable: true,
                level: 2,
                name: e.RegionCode,
                selected: true,
                text: e.IndependenceRegionConsiderations
              };
              groupByRegion.push(temp);
            }
          }
        });
        result.IndependenceCountries.filter((item: any) => item.CountryCode !== '').map(e => {
          if (e.RegionCode !== '') {
            const exists = groupByCountry.find(item => item.name === e.CountryCode);
            if (exists === undefined) {
              const temp = {
                expandable: false,
                level: 3,
                name: e.CountryCode,
                selected: true,
                text: e.IndependenceCountryConsiderationsText
              };
              groupByCountry.push(temp);
              const existsRegion = groupByRegion.find(item => item.name === e.RegionCode);
              if (existsRegion === undefined) {
                const temp1 = {
                  expandable: true,
                  level: 2,
                  name: e.RegionCode,
                  selected: true,
                  text: e.IndependenceRegionConsiderations
                };
                groupByRegion.push(temp1);
              }
            }
          }
        });
        this.independenceConsiderationLocal = [].concat(groupByRegion, groupByCountry);
      }
      this.loadingToGetSavedData();
    });
  }
  getConflictById() {
    this.serviceService.getConflictById(this.IdService).subscribe(e => {
      //  console.log('Conflict', e);
    });
  }
  getOtherById() {
    this.serviceService.getOtherById(this.IdService).subscribe(e => {
      this.progressStatusOther = this.sidebar[9].progress.toString();
      this.otherDetail = e;
    });
  }
  showTab(tab: string) { // Display certain user selection component in the sidebar
    this.sidebar = this.sidebar.map(e => ({ ...e, active: false }));
    const option = this.sidebar.filter(e => e.title === tab);
    if (option.length > 0) {
      option[0].active = true;
    }
  }
  updateIdService = (id: number) => this.IdService = id;  // share new IdService with all components

  // Locations functions
  getDefaultTree = (tree: LocationFilterNode[]) => this.defaultTreeCountry = tree; // Share tree of countries
  getCountryList = (list: any) => this.countryList = list;  // Store country List
  getLocationServiceTree = (locations: any) => { // if any location is saved enable local section in all form components and share data
    this.enableLocalTree = locations.length > 0 ? true : false;
    return this.locationServiceTree = locations;
  }

  // Progress functions
  getIdProgress = (id: number) => this.sidebar[0].id = id;  // get id progress bar to update in the future
  updateProgress(item) { // update progress in each form in the sidebar template
    const option = this.sidebar.filter(e => e.title === item.title);
    this.sidebar[10].progress = 0; // reset service summary
    if (option.length > 0) {
      option[0].progress = item.progress;
    }
    this.sidebar[10].progress = this.sidebar.filter(element => element.progress.toString() !== '100').length !== 1 ? 0 : 100;
    if (this.sidebar[0].id === 0) { // Create a new record to save progress
      this.serviceService.fetchProgressBar(this.IdService, this.sidebar).subscribe((e: any) => this.getIdProgress(e.value));
    } else {
      this.serviceService.updateProgressBar(this.IdService, this.sidebar, this.sidebar[0].id).subscribe(e => { });
    }
  }
  updateGreyBar = (greyObj) => this.greyBarData = greyObj;
  loadingToGetSavedData(close = false) {
    if (close === false) {
      Swal.close();
    } else {
      Swal.fire({
        title: '',
        html: '<i class="material-icons material-spin material-2x">sync</i>',
        allowOutsideClick: false,
        showConfirmButton: false,
        onOpen(this) { }
      });
    }
  }
  // others Functions
  updateServiceLine = (SL) => this.serviceline = SL;
  getserviceline(object) {
    this.serviceline = {
      SL: object.SL,
      SLcode: object.SLcode
    };
    // Service Line changed, the system need to reset the progress of permissibility component
    const option = this.sidebar.filter(e => e.title === 'Independence Permissibility');
    if (option.length > 0) {
      option[0].progress = 0;
    }
  }
  getcheckeddeliverary(value) {
    // Flag to execute again savedDeliverymethods in conflict component
    this.deliverySaved = value;
  }

  validateServiceUrl(serviceId: number) {
    this.serviceService.validateServiceUrlSam(serviceId).subscribe(
      (data: any) => {
        if (data !== null) {
          this.serviceInfo = data;
          if (this.serviceInfo.Status !== 'PublishedRegional') {
            this.showEditIcon = false;
            this.readonly = false;
          } else {
            this.showEditIcon = true;
            this.readonly = true;
          }
          if (this.serviceInfo.IdServiceParent !== null) {
            this.textUrl = `sam/${this.serviceInfo.FirstIdServiceParent}.${this.serviceInfo.Version}`;
            this.locationUrl.replaceState(this.textUrl);
          } else {
            this.textUrl = `sam/${this.serviceInfo.IdService}`;
            this.locationUrl.replaceState(this.textUrl);
          }
        } else {
          const userData = JSON.parse(localStorage.getItem('userData'));
          this.serviceService.validateServiceUrl(serviceId).subscribe((dataService: any) => {
            // terminar para publicar
            if (dataService.Status !== 'PublishedRegional') {
              if (userData.Roles === 'Global Admin') {
                this.showEditIcon = false;
                this.readonly = false;
              }
            } else {

              if (userData.Roles === 'Global Admin') {
                this.showEditIcon = true;
                this.readonly = true;
              }
            }
          });

        }
      }
    );
  }

  async getServiceByIdParentVersion(idService: any, version: any) {
    await this.serviceService.getServiceByIdParentVersion(idService, version).then(() => {
      this.serviceInfo = this.serviceService.serviceInfo;
      this.IdService = this.serviceInfo.IdService;
      this.validateInit();
    });
  }

}
