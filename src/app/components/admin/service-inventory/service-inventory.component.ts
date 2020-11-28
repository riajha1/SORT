import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ServiceInventoryReport, CountriesService, RegionService, ExcelService, FieldOfPlayService, SolutionService, CompetencyDomainService, SectorService,
  ClientNeedService, DeliveryMethodContentService, ServiceService, ServicesService, ConflictConsiderationService
} from '../../../providers/provider.index';
import { SubServiceLineModel, ServiceLineModel, CompentencyDomainModel, ServiceInventoryModel, CountryModel, SolutionModel, SectorModel, ClientNeedModel, FieldOfPlayModel, DeliveryMethodModel } from '../../../models/model.index';
import { tap } from 'rxjs/internal/operators/tap';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms'
import { Subscription } from 'rxjs';
import { ServiceInventoryReportFilterModel } from '../../../models/model/ServiceInventoryReportFilterModel';
import { AdditionalFilterItems } from '../../../models/model/service-inventory.modal';


@Component({
  selector: 'app-service-inventory',
  templateUrl: './service-inventory.component.html',
  styleUrls: ['./service-inventory.component.scss']
})
export class ServiceInventoryComponent implements OnInit {
  originOfService;
  serviceLine = [];
  subServiceLine;
  compantencyDomain;
  filterValue;
  filterName;
  dataFilterValue = [];
  showFilterListAll: boolean = false;
  areaList = [];
  regionList = [];
  countryList: Array<any>;
  loadingCountry: boolean = true;
  subServiceLines: Array<SubServiceLineModel>;
  serviceLines: Array<ServiceLineModel>;
  competencyDomains: Array<CompentencyDomainModel>;
  subscriptionCountryList: Subscription;
  selectedColumn: ServiceInventoryModel[] = [];
  solutions: Array<AdditionalFilterItems>;
  sectors: Array<AdditionalFilterItems>;
  clientNeeds: Array<AdditionalFilterItems>;
  delivery: Array<AdditionalFilterItems>;
  fieldOfPlayModel: Array<AdditionalFilterItems>;
  gfis: Array<AdditionalFilterItems>;
  mercury: Array<AdditionalFilterItems>;
  listOfServices: Array<AdditionalFilterItems>;
  ServiceIndex = -1;
  selectedDelivery = [];
  pickoneDelivery = false;
  selectedDeliveryName = [];
  storeFieldList;
  showRequiredFilterMessage: boolean = false;
  isAllRegionSelected: boolean = true;
  isAllAreaSelected: boolean = true;
  disableAddNewFilterBtn: boolean = false;

  filters = [
    { isSelected: false, name: "Origin of Service" },
    { isSelected: false, name: "Solution" },
    { isSelected: false, name: "Field of Play" },
    { isSelected: false, name: "Sector" },
    { isSelected: false, name: "Client Need" },
    { isSelected: false, name: "GFIS Code" },
    { isSelected: false, name: "MSC Mercury Code" },
    { isSelected: false, name: "SORT ID" },
    { isSelected: false, name: "Activity Grid" },
    { isSelected: false, name: "Forms of Delivery" },
    { isSelected: false, name: "Conflict Check Required" },
    { isSelected: false, name: "Subject to ISQM1" },
    { isSelected: false, name: "Data Processor" },
  ]

  remaningfilters = this.filters;

  option = [{ id: 1, name: 'Yes' }, { id: 0, name: 'No' }];

  dataDropDownConflict: Array<AdditionalFilterItems> = [{ id: 0, name: 'Not required' }, { id: 1, name: 'Mandatory' }, { id: 2, name: 'Potentially required based on activity' }];

  selectedAdditionalFilterList = [];
  additionalWhereCondition: string = '';

  // loading ng-select dependents
  loadingArea = false;
  loadingRegion = false;
  loadingLocation = false;
  loadingSL = false;
  loadingSSL = false;
  loadingCompetency = false;

  subscriptionSelectedColumn: Subscription;

  constructor(private serviceinventoryreport: ServiceInventoryReport, private fb: FormBuilder, private countryService: CountriesService, private solutionService: SolutionService,
    private regionService: RegionService, private excelService: ExcelService, private sectorService: SectorService, private clientNeedService: ClientNeedService,
    private fieldofplayservice: FieldOfPlayService, private deliveryService: DeliveryMethodContentService, private serviceService: ServiceService,
    private servicesService: ServicesService, private conflictConsiderationService: ConflictConsiderationService, private router: Router
  ) { }

  ServiceInventoryFilterDetails: FormGroup;

  ngOnInit() {
    this.getAllArea();

    this.getDataOriginOfService();
    this.getDataServiceLine();
    this.getDataCompetency();
    this.createFilterForm();
    this.getSolutions();
    this.getSectors();
    this.getClientNeed();
    this.getAllDelivery();
    this.getAllGfis();
    this.getAllMercury();
    this.getfieldofplaylist();
    this.getAllServices();
    this.subscriptionSelectedColumn = this.serviceinventoryreport.selectedColumnChanged.subscribe(selectedColumn => {
      this.selectedColumn = selectedColumn;
    });
  }

  // reactiveform created
  createFilterForm() {
    this.ServiceInventoryFilterDetails = this.fb.group({
      area: new FormControl(['All'], Validators.required),
      region: new FormControl([{ Area: 'All', Region: 'All' }], Validators.required),
      location: new FormControl([{ CountryName: 'All', CountryCode: 'GLB' }], Validators.required),
      serviceLine: new FormControl(null),
      subServiceLine: new FormControl(null),
      competency: new FormControl(null),
      additionalFilters: new FormArray([]),
    })
  }

  // initialising as form Array
  get getAdditionalFilters() {
    return this.ServiceInventoryFilterDetails.get('additionalFilters') as FormArray;
  }

  getAdditionalFilterList() {
    this.remaningfilters = this.filters.filter(f => f.isSelected == false);
  }

  setAddNewFilterBtn() {
    // debugger;
    let a = this.getAdditionalFilters.controls.filter(f => f.value.ctrlFilterValue.length == 0);
    if (a.length == 0) {
      this.disableAddNewFilterBtn = false;
    } else {
      this.disableAddNewFilterBtn = true;
    }

  }

  // deleting the form array dropdown selection
  deleteAdditionalSelectedFilter(i, additionalFilter) {

    let indexOfFilters = this.filters.map(m => m.name).indexOf(additionalFilter.value.filterName.name);
    this.filters[indexOfFilters].isSelected = false;


    this.getAdditionalFilters.removeAt(i);

    this.getAdditionalFilterList();
    this.setAddNewFilterBtn();
  }

  // creating dyamic form array
  addNewFilterList() {
    let addFilter = this.fb.group({
      filterName: '',
      filterValue: [''],
      whereColumnName: '',
      ctrlFilterName: ['', Validators.required],
      ctrlFilterValue: ['', Validators.required]
    });
    this.getAdditionalFilters.push(addFilter);

    this.disableAddNewFilterBtn = !this.disableAddNewFilterBtn;
  }

  // subscribe service line data
  getDataServiceLine() {
    this.serviceinventoryreport.getServiceline().subscribe((data: Array<ServiceLineModel>) => this.serviceLine = data,
      error => console.log('Error getDataServiceLine', error));
  }

  //to get competency data
  getDataCompetency() {
    this.serviceinventoryreport.getCompetencyDomain().subscribe((data) => this.compantencyDomain = data,
      error => console.log('Error getDataCompetency', error));
  }

  getAllArea() {
    this.loadingArea = true;
    this.regionService.getAllArea()
      .pipe(tap(() => this.loadingArea = false))
      .subscribe((data: Array<string>) => {
        this.areaList = data;
        this.areaList[this.areaList.indexOf("Global")] = "All";
        this.areaList.splice(0, 0, this.areaList.splice(this.areaList.indexOf("All"), 1)[0]);

        this.regionList = [{ Area: 'All', Region: 'All' }];
        this.countryList = [{ CountryName: 'All', CountryCode: 'GLB' }];
        this.ServiceInventoryFilterDetails.controls['area'].setValue(['All']);
        this.ServiceInventoryFilterDetails.controls['region'].setValue(['All']);
        this.ServiceInventoryFilterDetails.controls['location'].setValue([{ CountryName: 'All', CountryCode: 'GLB' }]);

      }, error => console.log('Error getAllArea', error));
  }

  onAreaChange(event: any) {
    this.loadingRegion = true;

    if (this.ServiceInventoryFilterDetails.controls['area'].value[this.ServiceInventoryFilterDetails.controls['area'].value.length - 1] == "All") {
      this.ServiceInventoryFilterDetails.controls['area'].setValue(this.ServiceInventoryFilterDetails.controls['area'].value.filter(obj => obj == "All"));
      this.isAllAreaSelected = true;
      this.regionList = [{ Area: 'All', Region: 'All' }];
      this.countryList = [{ CountryName: 'All', CountryCode: 'GLB' }];
      this.ServiceInventoryFilterDetails.controls['region'].setValue([{ Area: 'All', Region: 'All' }]);
      this.ServiceInventoryFilterDetails.controls['location'].setValue([{ CountryName: 'All', CountryCode: 'GLB' }]);
      return;

    } else {
      this.ServiceInventoryFilterDetails.controls['area'].setValue(this.ServiceInventoryFilterDetails.controls['area'].value.filter(obj => obj != "All"));
      if (this.isAllAreaSelected == true) {
        this.ServiceInventoryFilterDetails.controls['region'].setValue([]);
        this.ServiceInventoryFilterDetails.controls['location'].setValue([]);
        this.isAllAreaSelected = false;
      }
    }

    this.regionService.getRegionsByArea(event)
      .pipe(tap(() => this.loadingRegion = false))
      .subscribe((data: Array<string>) => {
        this.regionList = data;
        this.regionList[this.regionList.map(m => m.Region).indexOf("Global")] = "All"
        this.regionList.splice(0, 0, this.regionList.splice(this.regionList.indexOf("All"), 1)[0]);
      },
        error => console.log('Error getRegionsByArea', error));
  }

  onRemoveArea(event) { // Function to remove area selected by the user
    const matchRegion = this.ServiceInventoryFilterDetails.get('region').value.filter((e: any) => e.Area !== event.value);
    this.ServiceInventoryFilterDetails.controls['region'].setValue(matchRegion);

    const matchLocation = this.ServiceInventoryFilterDetails.get('location').value.filter((e: any) => e.Area !== event.value);
    this.ServiceInventoryFilterDetails.controls['location'].setValue(matchLocation);
  }

  onRegionChange(event: any) {

    if (this.ServiceInventoryFilterDetails.controls['region'].value.map(m => m.Region).indexOf("All") != -1) {
      this.ServiceInventoryFilterDetails.controls['region'].setValue(this.ServiceInventoryFilterDetails.controls['region'].value.filter(obj => obj.Region == "All"));
      this.isAllRegionSelected = true;
    } else {
      this.ServiceInventoryFilterDetails.controls['region'].setValue(this.ServiceInventoryFilterDetails.controls['region'].value.filter(obj => obj.Region != "All"));
      if (this.isAllRegionSelected == true) {
        this.ServiceInventoryFilterDetails.controls['location'].setValue([]);
        this.isAllRegionSelected = false;
      }
    }

    if (this.isAllRegionSelected == false) {
      this.loadingLocation = true;
      this.countryService.getCountriesByRegion(Array.prototype.map.call(event, s => s.Region).toString())
        .pipe(tap(() => this.loadingLocation = false))
        .subscribe((data: Array<any>) => {
          this.countryList = data;
          const GBLIndex = this.countryList.map(item => item.CountryCode).indexOf('GLB');

          if (GBLIndex > 0) {
            this.countryList[GBLIndex].CountryName = "All";
            this.countryList.splice(0, 0, this.countryList.splice(GBLIndex, 1)[0]);
          }
        },
          error => console.log('Error getCountriesByRegion', error));
    }
  }

  onRemoveRegion(event) { // Function to remove competency domain selected by the user
    const matchLocation = this.ServiceInventoryFilterDetails.get('location').value.filter((e: any) => e.Region !== event.value.Region);
    this.ServiceInventoryFilterDetails.controls['location'].setValue(matchLocation);
  }

  onLocationChange(event: any) {

    if (event[event.length - 1].CountryName == "All") {
      this.ServiceInventoryFilterDetails.controls['location'].setValue(this.ServiceInventoryFilterDetails.controls['location'].value.filter(obj => obj.CountryName == "All"));
    } else {
      this.ServiceInventoryFilterDetails.controls['location'].setValue(this.ServiceInventoryFilterDetails.controls['location'].value.filter(obj => obj.CountryName != "All"));
    }
  }

  // to get service line selected by the user and get dependent SSL with that SL
  onValueChangeSL = (event: any) => {
    if (event.length > 0) {
      this.loadingSSL = true;
      this.getSubserviceLineByServiceLine(event);
    }
    else {
      this.subServiceLines = [];
      this.competencyDomains = [];
    }
  }

  // to remove competency domain selected by the user
  onRemoveSL(event) {
    const matchSSL = this.ServiceInventoryFilterDetails.get('subServiceLine').value.filter((e: any) => e.serviceLineCode !== event.value.serviceLineCode);
    this.ServiceInventoryFilterDetails.controls['subServiceLine'].setValue(matchSSL);

    const matchCompetency = this.ServiceInventoryFilterDetails.get('competency').value.
      filter(f => this.ServiceInventoryFilterDetails.get('subServiceLine').value.some(item => item.idSubServiceCode === f.idSubServiceCode));

    this.ServiceInventoryFilterDetails.controls.competency.setValue(matchCompetency);

    this.competencyDomains = this.competencyDomains.filter(f => this.ServiceInventoryFilterDetails.get('subServiceLine').value.some(item => item.idSubServiceCode === f.idSubServiceCode));
  }

  // to remove competency domain selected by the user
  onRemoveSSL(event) {
    const matchCompetency = this.ServiceInventoryFilterDetails.get('competency').value.filter((e: any) => e.idSubServiceCode !== event.value.idSubServiceCode);
    this.ServiceInventoryFilterDetails.controls.competency.setValue(matchCompetency);
  }

  // to get data of sub service line based on selection of service line
  getSubserviceLineByServiceLine(slCode: string) {
    this.serviceinventoryreport.getSubserviceLineByServiceLineIntake(Array.prototype.map.call(slCode, s => s.serviceLineCode).toString())
      .pipe(tap(() => this.loadingSSL = false))
      .subscribe(
        (data: Array<SubServiceLineModel>) => this.subServiceLines = data,
        error => console.log('Error SubServiceLine', error));
  }

  // to get SSL selected by the user and get dependent competency domain with that SSL
  onValueChangeSubService(event: any) {
    if (event.length > 0) {
      this.loadingCompetency = true;
      const temp = [];
      event.map(x => {
        this.serviceinventoryreport.getCompetencyDomainBySubServiceCode(x.idSubServiceCode === undefined ? x.IdSubServiceCode : x.idSubServiceCode)
          .pipe(tap(() => this.loadingCompetency = false))
          .subscribe((data: Array<CompentencyDomainModel>) => {
            data.map(e => temp.push(e));
            const organizado = [...temp].sort((a, b) => a.competencyDomainName.localeCompare(b.competencyDomainName));
            this.competencyDomains = organizado;
          });
      });
    } else {
      this.competencyDomains = [];
    }
  }

  getFilterKey(data, i) {
    this.dataFilterValue = []
    switch (data.name) {
      case 'Origin of Service': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.originOfService,
          whereColumnName: 'S.IsGlobal',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });

        this.dataFilterValue = this.originOfService;
        break;
      }

      case 'Solution': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.solutions,
          whereColumnName: 'SL.idSolution',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.solutions;
        break;
      }

      case 'Field of Play': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.storeFieldList,
          whereColumnName: 'FP.IdFop',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.storeFieldList;
        break;
      }

      case 'Sector': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.sectors,
          whereColumnName: 'SC.IdSector',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.sectors;
        break;
      }

      case 'Client Need': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.clientNeeds,
          whereColumnName: 'CN.IdClientNeed',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.clientNeeds;
        break;
      }

      case 'GFIS Code': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.gfis,
          whereColumnName: 'GFIS.GFISCode',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.gfis;
        break;
      }

      case 'MSC Mercury Code': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.mercury,
          whereColumnName: 'MC.MercuryCode',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.mercury;
        break;
      }

      case 'SORT ID': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.listOfServices,
          whereColumnName: 'S.IdService',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.mercury;
        break;
      }

      case 'Forms of Delivery': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.delivery,
          whereColumnName: 'DMD.IdDeliveryMethodData',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.delivery;
        break;
      }

      case 'Activity Grid': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.option,
          whereColumnName: 'BC.ActivityGrid',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.option;
        break;
      }

      case 'Conflict Check Required': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.dataDropDownConflict,
          whereColumnName: 'C.CheckRequired',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.option;
        break;
      }

      case 'Subject to ISQM1': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.option,
          whereColumnName: 'ISQM.ISQMCheck',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.option;
        break;
      }

      case 'Data Processor': {
        this.getAdditionalFilters.controls[i].setValue({
          filterName: data,
          filterValue: this.option,
          whereColumnName: 'ISQM.ProcessorData',
          ctrlFilterName: this.getAdditionalFilters.controls[i].value.ctrlFilterName,
          ctrlFilterValue: new FormControl('', Validators.required),
        });
        this.dataFilterValue = this.option;
        break;

      }

    }

    for (let val of this.filters) {

      let index = this.getAdditionalFilters.controls.map(m => m.value.filterName.name).indexOf(val.name);

      if (index == -1) {
        val.isSelected = false;
      }
      else {
        val.isSelected = true;
      }
    }
    this.getAdditionalFilterList();
    this.setAddNewFilterBtn();
  }

  // subscribe origin of data
  getDataOriginOfService() {
    this.serviceinventoryreport.getOriginOfService().subscribe((data) => this.originOfService = data.map(o => {
      return {
        id: o.Id,
        name: o.Name
      }
    }),
      error => console.log('Error Origin Of Service', error));
  }

  getSolutions() {
    this.solutionService.getSolution()
      .subscribe(
        (data: Array<SolutionModel>) => {
          //const all = { // Include All default option at the beginning of the array
          //  idSolution: 99,
          //  solutionDescription: 'All',
          //  sortServiceFilters: []
          //};
          //data.unshift(all);
          this.solutions = data.map(o => {
            return {
              id: o.idSolution,
              name: o.solutionDescription
            }
          });
        },
        error => console.log('Error getSolutions', error));
  }

  getSectors() {
    this.sectorService.getSector()
      .subscribe(
        (data: Array<SectorModel>) => {
          //const all = { // Include All default option at the beginning of the array
          //  idSector: 99,
          //  sectorName: 'All',
          //  sortServiceFilters: []
          //};
          //data.unshift(all);
          this.sectors = data.map(o => {
            return {
              id: o.idSector,
              name: o.sectorName
            }
          });
        },
        error => console.log('Error getSectors', error));
  }

  getClientNeed() {
    this.clientNeedService.getClientNeed()
      .subscribe(
        (data: Array<ClientNeedModel>) => {
          //const all = { // Include All default option at the beginning of the array
          //  idClientNeed: 99,
          //  clientNeedName: 'All',
          //  clientNeedDescription: '',
          //  sortServiceFilters: []
          //};
          //data.unshift(all);
          this.clientNeeds = data.map(o => {
            return {
              id: o.idClientNeed,
              name: o.clientNeedName
            }
          });
        },
        error => console.log('Error getSectors', error));
  }

  getfieldofplaylist() {
    this.fieldofplayservice.getfieldofplay()
      .subscribe((data: Array<FieldOfPlayModel>) => {
        this.storeFieldList = data.map(o => {
          return {
            id: o.IdFop,
            name: o.FopName
          }
        });
        this.storeFieldList.sort();
        [...this.storeFieldList].sort((a, b) => a.name.localeCompare(b.name));
      },
        error => console.log('Error getSectors', error));
  }

  getAllGfis() {
    this.serviceService.getAllGfis()
      .subscribe(
        (data: Array<any>) => {
          this.gfis = data.map(e => { return { id: e.Gfiscode, name: e.Gfiscode + ' ' + e.Name } }); // add additional key to the object (merge)
        },
        error => console.log('Error getAllGfis', error));
  }
  getAllMercury() {
    this.serviceService.getAllMercury()
      .subscribe(
        (data: any) => {
          this.mercury = data.map(e => {
            return { id: e.MercuryCode, name: e.MercuryCode + ' ' + e.Name }
          }); // add additional key to the object (merge)
        },
        error => console.log('Error getAllMercury', error));
  }

  getAllServices() {
    this.servicesService.fetchCompleteListOfService().subscribe(
      (data: any) => {
        this.listOfServices = data.filter(f => f.status == 'PublishedRegional').map(item => {
          return {
            id: item.idService,
            name: item.name
          }
        });
      },
      errorService => console.log('error endpoint getAllServices', errorService.message));
  }

  getAllDelivery() {
    this.deliveryService.getDeliveryMethodsContent()
      .subscribe(
        (data: any) => {
          this.delivery = data.map(item => ({
            id: item.idDeliveryMethodData,
            name: item.deliveryMethodName,
          }));
        },
        errorService => console.log('error endpoint', errorService.message));
  }


  getFilterValue(name, whereColumnName, data) {
    this.setAddNewFilterBtn();
    //debugger;
    //let index = this.selectedAdditionalFilterList.map(f => f.name).indexOf(name);
    //if (index == -1) {
    //  this.selectedAdditionalFilterList.push({ name: name, whereColumnName: whereColumnName, data: data });
    //}
    //else {
    //  this.selectedAdditionalFilterList[index].data = data;
    //}
  }


  exportAsXLSX(): void {
    if (this.ServiceInventoryFilterDetails.valid) {
      // debugger;
      this.showRequiredFilterMessage = false;
      this.additionalWhereCondition = '';

      this.selectedAdditionalFilterList = this.getAdditionalFilters.controls;

      for (let i = 0; i < this.selectedAdditionalFilterList.length; i++) {

        if (this.selectedAdditionalFilterList[i].value.ctrlFilterName == "Origin of Service") {
          this.additionalWhereCondition = this.additionalWhereCondition + ' and ' + this.selectedAdditionalFilterList[i].value.whereColumnName + ' in (' + Array.prototype.map.call(this.selectedAdditionalFilterList[i].value.ctrlFilterValue, s => s == 1 ? 1 : 0).toString() + ')';
        }
        else if (this.selectedAdditionalFilterList[i].value.ctrlFilterName == "Activity Grid") {
          if (this.selectedAdditionalFilterList[i].value.ctrlFilterValue.length == 1) {
            if (this.selectedAdditionalFilterList[i].value.ctrlFilterValue[0] == "1") {
              this.additionalWhereCondition = this.additionalWhereCondition + " and " + this.selectedAdditionalFilterList[i].value.whereColumnName + " != 0x";
            } else if (this.selectedAdditionalFilterList[i].value.ctrlFilterValue[0] == "0") {
              this.additionalWhereCondition = this.additionalWhereCondition + " and " + this.selectedAdditionalFilterList[i].value.whereColumnName + " = 0x";
            }
          }
        }
        else if (this.selectedAdditionalFilterList[i].value.ctrlFilterName == "Subject to ISQM1" || this.selectedAdditionalFilterList[i].value.ctrlFilterName == "Data Processor") {
          if (this.selectedAdditionalFilterList[i].value.ctrlFilterValue.length == 1) {
            if (this.selectedAdditionalFilterList[i].value.ctrlFilterValue[0] == "1") {
              this.additionalWhereCondition = this.additionalWhereCondition + ' and ' + this.selectedAdditionalFilterList[i].value.whereColumnName + ' in (' + Array.prototype.map.call(this.selectedAdditionalFilterList[i].value.ctrlFilterValue, s => s).toString() + ')';
            } else if (this.selectedAdditionalFilterList[i].value.ctrlFilterValue[0] == "0") {
              this.additionalWhereCondition = this.additionalWhereCondition + " and IsNull(" + this.selectedAdditionalFilterList[i].value.whereColumnName + ",0) =0";
            }
          }
        }
        else {
          this.additionalWhereCondition = this.additionalWhereCondition + ' and ' + this.selectedAdditionalFilterList[i].value.whereColumnName + ' in (' + Array.prototype.map.call(this.selectedAdditionalFilterList[i].value.ctrlFilterValue, s => s).toString() + ')';
        }
      }

      let serviceInventoryReportFilterModel: ServiceInventoryReportFilterModel = new ServiceInventoryReportFilterModel();

      if (this.selectedColumn.length == 0) {
        serviceInventoryReportFilterModel.selectQuery = '';
      }
      else {
        serviceInventoryReportFilterModel.selectQuery = ',' + Array.prototype.map.call(this.selectedColumn, s => s.column + ' as [' + s.name + ']').toString();
      }

      serviceInventoryReportFilterModel.locationCondition = Array.prototype.map.call(this.ServiceInventoryFilterDetails.controls['location'].value, s => s.CountryCode).toString();

      if (this.ServiceInventoryFilterDetails.controls['serviceLine'].value != null && this.ServiceInventoryFilterDetails.controls['serviceLine'].value.length != 0) {
        serviceInventoryReportFilterModel.competancyDomainCondition = ' and SLN.ServiceLineCode in (' + Array.prototype.map.call(this.ServiceInventoryFilterDetails.controls['serviceLine'].value, s => s).toString() + ')';
      }
      if (this.ServiceInventoryFilterDetails.controls['subServiceLine'].value != null && this.ServiceInventoryFilterDetails.controls['subServiceLine'].value != 0) {
        serviceInventoryReportFilterModel.competancyDomainCondition = serviceInventoryReportFilterModel.competancyDomainCondition + "and SSL.IdSubServiceCode in (" + Array.prototype.map.call(this.ServiceInventoryFilterDetails.controls["subServiceLine"].value, s => "'" + s.idSubServiceCode + "'").toString() + ")";
      }
      if (this.ServiceInventoryFilterDetails.controls['competency'].value != null && this.ServiceInventoryFilterDetails.controls['competency'].value != 0) {
        serviceInventoryReportFilterModel.competancyDomainCondition = serviceInventoryReportFilterModel.competancyDomainCondition + 'and SF.IdCompetencyDomain in (' + Array.prototype.map.call(this.ServiceInventoryFilterDetails.controls['competency'].value, s => s.idCompetencyDomain).toString() + ')';
      }
      serviceInventoryReportFilterModel.additionalWhereCondition = this.additionalWhereCondition;
      serviceInventoryReportFilterModel.baseURL = window.location.href.substring(0, window.location.href.indexOf(this.router.url));

      this.serviceinventoryreport.getServiceInventoryReport(serviceInventoryReportFilterModel).subscribe((data: any) => {
        if (data.message === 'OK') {
          const result = JSON.parse(data.value);
          this.excelService.generateExcel(result);
        }
      });
    } else {
      this.showRequiredFilterMessage = true;
    }
  }

}

