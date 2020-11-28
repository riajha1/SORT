import * as _ from 'lodash';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';

import { FieldOfPlayService, SolutionService, CompetencyDomainService, SectorService,
         ClientNeedService, ServiceLineService, SubserviceLineService, ServicesService,
         UserService, CountriesService, PermissibilityService, LeftHandFilterService, ConfigItemsService} from '../../../providers/provider.index';

import { PreviewService, SubserviceLineFilter, SubserviceLineOptions, SolutionFilter,
         CompetencyFilter, SectorFilter, ClientFilter, FilterNodeParent, FieldOfPlayFilter } from '../../../models/model.index';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [ServiceLineService]
})
export class DashboardComponent implements OnInit, OnDestroy  {
  // Variables of the component
  @ViewChild('sortOptions', {static: false}) sortOptions: ElementRef;
  scrollbarOptions = { axis: 'y', theme: 'minimal'};

  iconArray = [];
  defaultColor = '#2E2E38';

  enableGrid: boolean = false;
  enableLeftHandFilter: boolean = false; // responsive
  enableBucketsLeftHand: Array<string> = [];

  loading: boolean = true;
  loadingResult: boolean = true;
  onlyOneServiceLine: boolean = true; // enable or disable prefix of subservice line - Left-handFilter

  all: number = 0; // counter of request ready
  previosLeftHand: boolean = false;
  previousResult: Array<any> = [];
  extraterritorial: boolean = false;

  stringSearch: string = '';
  country: string = '';
  previousCountry: string = '';
  previousClient: any = {};
  client: any = {};
  selectedssl = [];
  sameBucket: string[] = [];
  sameFilter: boolean;

  // search result items
  result = 0;
  limit = 6;
  sortby: boolean = true;
  // pagination variables
  page = 1;
  pageSize = 12;
  maxPages = 3;

  overWrite = [
    {item: 'ch1', optional: 'Ch1'},
    {item: 'ch1nsa', optional: 'Ch1nsa'},
    {item: 'euAuditedNoValuation', optional: 'EuAuditedNoValuation'},
    {item: 'euaudited', optional: 'Euaudited'},
    {item: 'euAuditedNoValuation', optional: 'EuauditedNoTax'},
    {item: 'eusubject', optional: 'Eusubject'},
    {item: 'otAudited', optional: 'OtAudited'},
    {item: 'otSubject', optional: 'OtSubject'},
    {item: 'secaudited', optional: 'Secaudited'},
    {item: 'secsubject', optional: 'Secsubject'},
    {item: 'ch2', optional: 'Ch2'}
  ];

  moreRestrictive = [
    { value: 'Prohib', ranking: 5},
    { value: 'AA', ranking: 4},
    { value: 'ASTCC', ranking: 3},
    { value: 'Allowed', ranking: 2},
    { value: 'N/A', ranking: 1}];

  FilterTree: FilterNodeParent [];
  resultFilter: PreviewService[] = [];
  enableResultFilter: number = 0;
  resultFilterSL: PreviewService[] = [];
  data: PreviewService[] = [];
  allssl: SubserviceLineFilter[] = [];
  allSolution: SolutionFilter[] = [];
  allCompetency: CompetencyFilter[] = [];
  allFieldofplay: FieldOfPlayFilter[] = [];
  allSector: SectorFilter[] = [];
  allClient: ClientFilter[] = [];
  serviceLineOptions: SubserviceLineOptions[] = [];
  matchFilter: any = {};
  filterNav: any;
  countryList: Array<any> = [];
  allIndependenceSelected = [];
  allIndependenceSelectedString = '';

  // subscription
  subscription: Subscription;
  subscriptionSSL: Subscription;
  subscriptionSolution: Subscription;
  subscriptionCompetency: Subscription;
  subscriptionSector: Subscription;
  subscriptionClient: Subscription;
  subscriptionMatch: Subscription;
  subscriptionFilter: Subscription;
  subscriptionCountry: Subscription;
  subscriptionCountryList: Subscription;
  subscriptionPermissibility: Subscription;
  subscriptionFieldofPlay: Subscription;

  constructor(private serviceLineService: ServiceLineService , private subserviceLineService: SubserviceLineService,
              private solutionsService: SolutionService, private competencyDomainService: CompetencyDomainService,
              private sectorService: SectorService, private clientNeedService: ClientNeedService,
              private servicesService: ServicesService, private userService: UserService,
              private countryService: CountriesService, private permissibilityservice: PermissibilityService,
              private fieldofplayService: FieldOfPlayService, private leftHandService: LeftHandFilterService,
              private configService: ConfigItemsService,
              private cdRef: ChangeDetectorRef
              ) {}

  // hooks
  ngOnInit() {
    this.getServiceLine();
    this.subscriptionFunctions();
    this.getIndependenceRestrictionOption();
    this.FilterTree = this.leftHandService.FilterTree;
    this.countryList = this.countryService.countryList;
    this.data = this.servicesService.services;
    this.allssl = this.subserviceLineService.subserviceline;
    this.allSolution = this.solutionsService.solution;
    this.allCompetency = this.competencyDomainService.competencydomain;
    this.allSector = this.sectorService.sector;
    this.allClient = this.clientNeedService.clientNeed;
    this.allFieldofplay = this.fieldofplayService.fieldofplay;
    this.country = this.userService.selectedcountry;
    this.previousCountry = this.userService.previousselectedcountry;
    if (this.previousCountry === '') {
      this.userService.savePreviousCountry(this.country);
    } else if (this.previousCountry !== this.country) {
      // this.getServices('normal');
      // this.servicesService.fetchAllPermissibility(this.country).subscribe();
      this.userService.savePreviousCountry(this.country);
    }

    // filters
    this.filterNav = this.userService.filter;
    this.client = this.filterNav.client;
    this.previousClient = this.userService.previousselectedclient;

    this.matchFilter = this.servicesService.matchFilter;
    this.allIndependenceSelected = this.servicesService.independencePermissibilityByUser;

    if (this.allssl.length === 0) {
      this.getAllSubserviceLine();
    }
    if (this.allSolution.length === 0) {
      this.getAllSolutions();
    }
    if (this.allFieldofplay.length === 0) {
      this.getAllFieldofPlay();
    }
    if (this.allCompetency.length === 0) {
      this.getAllCompetency();
    }
    if (this.allSector.length === 0) {
      this.getAllSector();
    }
    if (this.allClient.length === 0) {
      this.getAllClientNeeds();
    }
    if (this.countryList.length === 0) {
      this.getCountryList();
    }
  }

  subscriptionFunctions() {  // call all subscriptions
    this.subscriptionCountry = this.userService.selectedcountryChanged.subscribe(country => {
      this.loadingResult = true;
      this.country = country;
      this.data = [];
      this.resultFilter = [];
      this.enableResultFilter = 0;
      this.removeMatchFilter();
      this.userService.savePreviousCountry(this.country);
      let tokenOverride = [];
      if (this.filterNav.client.GISId) {
        if (this.filterNav.client.permissibility.length > 0) {
            const override = [];
            _.forOwn(this.filterNav.client.permissibility[0], (value, key) => {
              if (value === 'override') {
                override.push(key);
              }
            });
            tokenOverride = override;
          }
        if (tokenOverride.length > 0) {
            this.extraterritorial = true;
            this.userService.savePreviousClient(this.filterNav.client);
          }

      }
      console.log('token cliente', tokenOverride);
      if (tokenOverride.length > 0) {
        this.getServices('extraterritorial', tokenOverride);
      } else {
        this.getServices('normal');
        this.servicesService.fetchAllPermissibility(country).subscribe();
      }
    });

    this.subscriptionCountryList = this.countryService.countryListChanged
    .subscribe((countries: any[]) => this.countryList = countries );

    this.subscription = this.servicesService.servicesChanged
    .subscribe((services: PreviewService[]) => {
       this.data = services;
       if (this.data && this.data.length > 0 && this.data[0].independenceRestrictions) {
         // console.log('service complete', this.data);
         this.checkFilterItems('subcribe data');
         this.setTotalServiceLineOption();
       }
       return;
    });

    this.subscriptionSSL = this.subserviceLineService.subservicelineChanged
    .subscribe((serviceLine: SubserviceLineFilter[]) => this.allssl = serviceLine);

    this.subscriptionSolution = this.solutionsService.solutionChanged
    .subscribe((solution: SolutionFilter[]) => this.allSolution = solution);

    this.subscriptionCompetency = this.competencyDomainService.competencyChanged
    .subscribe((competency: CompetencyFilter[]) => this.allCompetency = competency);

    this.subscriptionSector = this.sectorService.sectorChanged
    .subscribe((sector: SectorFilter[]) => this.allSector = sector);

    this.subscriptionFieldofPlay = this.fieldofplayService.fieldofplayChanged
    .subscribe((fop: FieldOfPlayFilter[]) => this.allFieldofplay = fop);

    this.subscriptionClient = this.clientNeedService.clientNeedChanged
    .subscribe((client: SectorFilter[]) => this.allClient = client);

    this.subscriptionPermissibility = this.servicesService.independencePermissibilityByUserChanged
    .subscribe((result: any) => {
      console.log('allIndependenceSelected sub', result);
      this.allIndependenceSelected = result;
      if (this.allIndependenceSelected.length > 0) {
        const selectedValues = this.allIndependenceSelected.reduce((value, selectedValue) => { const final = this.iconArray[this.iconArray.map(icon => icon.value).indexOf(selectedValue)].label;
                                                                                               return value.concat(final); }, [] );
        this.allIndependenceSelectedString = selectedValues.join(', ');
        this.checkFilterItems('permissibility');
      }
    });

    this.subscriptionMatch = this.servicesService.matchFiltertChanged
    .subscribe((res: any) => {
      this.matchFilter = res;
      if (this.matchFilter.word !== '' && this.matchFilter) {
        this.checkFilterItems('subscribe subscriptionMatch');
      }
    });

    this.subscriptionFilter = this.userService.getfilterApp()
    .subscribe(filterData => {
      console.log('subscriptionFilter', filterData);
      this.filterNav = filterData;
      console.log('this.extraterritorial 1111', this.extraterritorial);
      if (this.filterNav.client.GISId) {
        if (!this.client.GISId) {
          let tokenOverride = [];
          if (this.filterNav.client.permissibility.length > 0) {
            const override = [];
            _.forOwn(this.filterNav.client.permissibility[0], (value, key) => {
              if (value === 'override') {
                override.push(key);
              }
            });
            tokenOverride = override;
          }
          if (tokenOverride.length > 0) {
          this.loadingResult = true;
          this.data = [];
          this.resultFilter = [];
          this.enableResultFilter = 0;
          this.extraterritorial = true;
          this.getServices('extraterritorial', tokenOverride);
          }
          this.client = this.filterNav.client;
          this.userService.savePreviousClient(this.client);
        }
        if (!this.matchFilter) {
            this.checkFilterItems('subscriptionFilter !this.matchFilter');
          } else {
            if (this.matchFilter.word === '') {
              this.checkFilterItems('subscriptionFilter !this.matchFilter else');
            }
          }
      } else {
        if (this.filterNav.client.GISId || this.client.GISId) {
          console.log('this.extraterritorial', this.extraterritorial);
          if (this.extraterritorial) {
            console.log('execute 1');
            this.servicesService.fetchAllPermissibility(this.country).subscribe();
            this.extraterritorial = false;
          }
          this.checkFilterItems('subscriptionFilter filterNav remove');
          this.updateCardFilter(this.FilterTree);
          this.orderByServices('asc', 'Service Title');
          this.client = {};
          this.servicesService.removeIndependencePermissibilityByUser();
        }
      }
    } );
  }
  getServiceLine() {
    this.serviceLineService.getServiceLineValues()
    .subscribe((data: SubserviceLineOptions[]) => {
      this.serviceLineOptions = data;
      this.getAdminTable();
      let tokenOverride = [];
      let copytoken = [];
      // console.log('prev', this.previousClient);
      if (this.filterNav.client.GISId) {
        if (this.filterNav.client.permissibility.length > 0) {
            const override = [];
            _.forOwn(this.filterNav.client.permissibility[0], (value, key) => {
              if (value === 'override') {
                override.push(key);
              }
            });
            if (!this.previousClient.GISId) {
              tokenOverride = override;
            } else if (override.length > 0) {
              this.extraterritorial = true;
            }
            copytoken = override;
        }
       
        this.userService.savePreviousClient(this.filterNav.client);
        // console.log('lleno', this.previousClient);
        }
      // console.log('client', this.filterNav.client);
      // console.log('token', tokenOverride);
      if (this.data && this.data.length > 0 && this.data[0].independenceRestrictions && tokenOverride.length === 0) {
        if (this.previousCountry !== this.country) {
          // console.log('token extraterritorial', this.extraterritorial);
          if (this.extraterritorial) {
            // console.log('por aqui this.previousCountry !== this.country  tokenoverride 0');
            this.loadingResult = true;
            this.data = [];
            this.resultFilter = [];
            this.enableResultFilter = 0;
            this.extraterritorial = true;
            this.getServices('extraterritorial', copytoken);
          } else {
            this.setTotalServiceLineOption();
          }
        } else {
          // console.log('con data y tokenoverride 0');
          this.setTotalServiceLineOption();
        }
      } else if (this.data && this.data.length > 0 && tokenOverride.length > 0) {
        // console.log('con data y tokenoverride > 0');
        this.loadingResult = true;
        this.data = [];
        this.resultFilter = [];
        this.enableResultFilter = 0;
        this.extraterritorial = true;
        this.getServices('extraterritorial', tokenOverride);
      }
      if (this.data.length === 0 && this.previousCountry === '' && tokenOverride.length === 0) {
        // console.log('if 1', this.extraterritorial);
        this.getServices('normal');
        this.servicesService.fetchAllPermissibility(this.country).subscribe();
      } else if (this.data.length === 0 && this.previousCountry === '' && tokenOverride.length > 0) {
        this.extraterritorial = true;
        // console.log('else if 2', this.extraterritorial);
        this.getServices('extraterritorial', tokenOverride);
      } else {
        this.checkFilterItems('getServiceLine');
      }
      this.validateUploadedInformation();
    });
  }
  getAdminTable() {
    this.configService.fetchAdminTable().subscribe(adminItem => {
      this.serviceLineOptions.filter(op => op.value !== 'All').map(item => {
        const record = adminItem.filter(ele => ele.ServiceLineCode === item.value);
        if (record.length > 0) {
          const options = [];
          _.forOwn(record[0], (value: boolean, key: string) => {
            if (key !== 'Id' && key !== 'ServiceLineCode' && value) {
              options.push(key);
            }
          });
          item.dependency = options;
        }
      });
      if (this.filterNav.serviceLine.length > 0) {
        this.checkAllSLSelectedInHome();
      }
    });
  }
  getShowingItems(totalItems) {
    this.limit = totalItems;
    this.cdRef.detectChanges();
  }
  showPermissibility = (e) => this.servicesService.setPermissibilitySelectedByUser(e);

  removeMatchFilter = () => { // Remove fuzzy filter
    this.servicesService.removeMatchFilter();
    this.removeFilter();
  }

  removeIndepenceRestrictionsFilter = () => { // Remove fuzzy filter
     this.servicesService.removeIndependencePermissibilityByUser();
     this.removeFilter();
  }

  removeFilter(): void {
    this.previousResult = [];
    this.stringSearch = '';
    this.checkFilterItems('remove removeMatchFilter');
    this.updateCardFilter(this.FilterTree);
  }
  displayFilters = () => this.enableLeftHandFilter = !this.enableLeftHandFilter;
  listGridView = () => this.enableGrid = !this.enableGrid;

  validateUploadedInformation() {
    if (this.allClient.length > 0 && this.allCompetency.length > 0 && this.allSector.length > 0
      && this.allSolution.length > 0 && this.allssl.length > 0 && this.allFieldofplay.length > 0) {
      const selectedOptions = this.serviceLineOptions.filter( item => item.selected);
      if (selectedOptions.length === 1 && selectedOptions[0].name === 'All') {
        this.serviceLineOptions.map(item => ({...item, selected: item.name === 'All' ? true : false}));
        this.callFilterByParent(this.serviceLineOptions);
      } else {
        this.onlyOneServiceLine =  selectedOptions.length === 1 ? false : true ;
        this.callFilterByParent(selectedOptions);
      }
      this.FilterTree[2].children = this.allSolution;
      this.FilterTree[3].children = this.allFieldofplay;
      this.FilterTree[4].children = this.allSector;
      this.FilterTree[5].children = this.allClient;
      this.loading = false;
      }
  }
  callFilterByParent(parent) {
    this.getSubserviceLineByParent(parent);
    this.getCompetencyDomainByParent(parent);
  }
  orderByServices(order = '', option = '') {
    const priority = this.iconArray.map((e , i: number) => ({name: e.value, value: (i + 1) + e.value}));
    this.sortby = order === '' ? !this.sortby : true;
    const criteria = !this.sortby ? 'desc' : 'asc';
    const optionSelected = this.sortOptions !== undefined && option === ''  ? this.sortOptions.nativeElement.value : 'Service Title';
    if (optionSelected === 'Service Title') {
      this.resultFilter = _.orderBy(this.resultFilter, [service => service.Name.toLowerCase()], [criteria]);
      this.enableResultFilter = this.resultFilter.filter(e => !e.disable).length;
    } else {
      if (this.filterNav.client.GISId) {
        this.resultFilter.filter(e => !e.disable).map(e => {
          e.mixRestrictions = '';
          if (e.independenceRestrictions !== undefined) {
            const applicable = [];
            const restrictions = [];
            let highRestriction = '';
            let derogation = 0;
            if (e.independenceRestrictions.ServiceLineCode !== '01' && e.independenceRestrictions.ServiceLineCode !== '03' && e.independenceRestrictions.ServiceLineCode !== null) {
            if (this.filterNav.client.permissibility[0].without && this.filterNav.client.permissibility[0].with) {
              derogation = 0;
            } else if (this.filterNav.client.permissibility[0].without) {
              derogation = 2;
            } else if (this.filterNav.client.permissibility[0].with) {
              derogation = 1;
            }
          }
            _.forOwn(this.filterNav.client.permissibility[0], (value, key) => {
            if ((e.independenceRestrictions.ServiceLineCode === '01' || e.independenceRestrictions.ServiceLineCode === '03') && e.independenceRestrictions.ServiceLineCode !== null ) {
              if ((key === 'eusubject' || key === 'euaudited') && key !== 'euAuditedNoValuation') {
                applicable.push('euaudited');
              } else {
                if (key === 'euAuditedNoValuation' && e.independenceRestrictions.EuAuditedNoValuation === '') {
                  applicable.push('eusubject');
                } else {
                  if (key !== 'without' && key !== 'with' && key !== 'down') {
                    applicable.push(key); // Store column header applicable to the token
                  }
                }
              }
            } else {
              if (e.independenceRestrictions.ServiceLineCode !== null) {
                if (key !== 'without' && key !== 'with' && key !== 'down') {
                  applicable.push(key);
                }
              }
            }
          });
            if (applicable.length > 0) {
            applicable.map(ele => { // Validate which column is more restrictive
              const options = this.overWrite.filter(i => i.item === ele);
              if (options.length > 0) {
                if (derogation === 0) {
                  const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[options[0].optional]);
                  if (result.length > 0) { // get the ranking of restriction and store it
                    restrictions.push(result[0].ranking);
                  }
                } else if (derogation === 1 || derogation === 2) {
                  if (derogation === 1 && ele !== 'eusubject') {
                    const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[options[0].optional]);
                    if (result.length > 0) { // get the ranking of restriction and store it
                      restrictions.push(result[0].ranking);
                    }
                  } else if (derogation === 2 && ele !== 'euaudited') {
                    const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[options[0].optional]);
                    if (result.length > 0) { // get the ranking of restriction and store it
                      restrictions.push(result[0].ranking);
                    }
                  }
                }

                highRestriction = this.moreRestrictive.filter(item => item.ranking === Math.max(...restrictions)).length > 0 ?
                this.moreRestrictive.filter(item => item.ranking === Math.max(...restrictions))[0].value : '';
                // const item = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[options[0].optional]);
                // if (item.length > 0) { // get the ranking of restriction and store it
                //   restrictions.push(item[0].ranking);
                // }
                const orderIcon = priority.filter( i => i.name === highRestriction);
                if (orderIcon.length > 0) {
                  e.mixRestrictions = orderIcon[0].value;
                }
              }
            });
          }
          }
        });
        this.resultFilter = _.orderBy(this.resultFilter, ['mixRestrictions'], [criteria]); // Order by independence restriction label
        this.enableResultFilter = this.resultFilter.filter(item => !item.disable).length;
      }
    }
  }
  getSelectedServiceValues(e) {
    this.cleanExcept('sector');
    this.sameBucket = this.sameBucket.filter((item: any) => item === 'SE');
    const selectedOptions = this.serviceLineOptions // get options selected by the user
    .map( element => ({
      ...element, selected : (element.name === 'All' ? false : (element.name === e.target.id ? e.target.checked : element.selected))
    }))
    .filter( item => item.selected === true);
    if (e.target.id === 'All' || selectedOptions.length === 0) { // if the user selected all or unchecked all options
      this.checkedAllOption(e);
    } else {
      this.uncheckedAllOption(e);
    }
    this.enableBucketsLeftHand = [];
    this.serviceLineOptions.filter(i => i.selected && i.value !== 'All').map(ele => {
      this.enableBucketsLeftHand = _.union(this.enableBucketsLeftHand, ele.dependency);
    });

    this.userService.saveSlFilter(this.serviceLineOptions.filter(i => i.selected ));
    this.onlyOneServiceLine = this.serviceLineOptions.filter(i => i.selected && i.prefix !== 'All').length === 1 ? false : true;
    this.checkFilterItems('getSelectedServiceValues');
  }
  checkedAllOption(e) {
    this.serviceLineOptions = this.serviceLineOptions
    .map (elem => ({...elem, selected: elem.name !== 'All' ? false : true }));
    this.callFilterByParent(this.serviceLineOptions);
  }
  uncheckedAllOption(e) {
    this.onlyOneServiceLine = true;
    this.serviceLineOptions = this.serviceLineOptions
    .map (elem => ({
        ...elem,
        selected: (elem.name === 'All' ? false : (elem.name === e.target.id ? e.target.checked : elem.selected))
      })
    );
    this.callFilterByParent(this.serviceLineOptions);
  }
  checkFilterItems(where: string) {
    if (this.data.length > 0) {
      if ( this.matchFilter !== undefined && this.matchFilter.word !== '' && this.previousResult.length === 0 && this.stringSearch !== this.matchFilter.word ||
         this.matchFilter !== undefined && this.matchFilter.word !== '' && this.stringSearch !== this.matchFilter.word) {
      this.loadingResult = true;
      this.stringSearch = this.matchFilter.word;
      let copyData = this.data.map((e: any) => {
        if (e.pacemodel === 'Mercury' && e.mercury.length === 0) {
          e.disable = true;
        } else if ((e.pacemodel === 'GFIS Global' || e.pacemodel === 'PACE' || e.pacemodel === 'GFIS Local') && e.gfis.length === 0) {
          e.disable = true;
        }  else {
          e.disable = false;
        }
        return e;
      });

      if (this.matchFilter.serviceLineName.length === 0) {
        this.serviceLineOptions = this.serviceLineOptions.map(e => ({...e, selected: e.name === 'All' ? true : false}));
        this.cleanExcept('sector');
        this.onlyOneServiceLine = true;
        this.userService.saveSlFilter(this.serviceLineOptions.filter(i => i.selected ));
      }
      this.servicesService.FuzzySearchServices(this.matchFilter)
      .subscribe((data: any) => {
        if (copyData.length > 0) {
          if (this.filterNav.client.GISId) {
            if (this.filterNav.client.permissibility.length > 0 && this.allIndependenceSelected.length > 0) {
              copyData.filter(e => !e.disable).map(e => {
                const applicable = [];
                const restrictions = [];
                let highRestriction = '';
                let status = 0; // update when any restriction match with the permissibility filter
                let derogation = 0;
                if (e.independenceRestrictions.ServiceLineCode !== '01' && e.independenceRestrictions.ServiceLineCode !== '03' && e.independenceRestrictions.ServiceLineCode !== null) {
                  if (this.filterNav.client.permissibility[0].without && this.filterNav.client.permissibility[0].with) {
                    derogation = 0;
                  } else if (this.filterNav.client.permissibility[0].without) {
                    derogation = 2;
                  } else if (this.filterNav.client.permissibility[0].with) {
                    derogation = 1;
                  }
                }
                _.forOwn(this.filterNav.client.permissibility[0], (value, key) => {
                  if ((e.independenceRestrictions.ServiceLineCode === '01' || e.independenceRestrictions.ServiceLineCode === '03') && e.independenceRestrictions.ServiceLineCode !== null ) {
                    if ((key === 'eusubject' || key === 'euaudited') && key !== 'euAuditedNoValuation') {
                      applicable.push('euaudited');
                    } else {
                      if (key === 'euAuditedNoValuation' && e.independenceRestrictions.EuAuditedNoValuation === '') {
                        applicable.push('eusubject');
                      } else {
                        if (key !== 'without' && key !== 'with' && key !== 'down') {
                          applicable.push(key); // Store column header applicable to the token
                        }
                      }
                    }
                  } else {
                    if (e.independenceRestrictions.ServiceLineCode !== null) {
                      if (key !== 'without' && key !== 'with' && key !== 'down') {
                        applicable.push(key);
                      }
                    }
                  }
                });
                if (applicable.length > 0) {
                  applicable.map(ele => { // Validate which column is more restrictive
                    const option = this.overWrite.filter(i => i.item === ele);
                    if (option.length > 0) {
                      if (derogation === 0) {
                        const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                        if (result.length > 0) { // get the ranking of restriction and store it
                          restrictions.push(result[0].ranking);
                        }
                      } else if (derogation === 1 || derogation === 2) {
                        if (derogation === 1 && ele !== 'eusubject') {
                          const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                          if (result.length > 0) { // get the ranking of restriction and store it
                            restrictions.push(result[0].ranking);
                          }
                        } else if (derogation === 2 && ele !== 'euaudited') {
                          const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                          if (result.length > 0) { // get the ranking of restriction and store it
                            restrictions.push(result[0].ranking);
                          }
                        }
                      }
                      highRestriction = this.moreRestrictive.filter(item => item.ranking === Math.max(...restrictions)).length > 0 ?
                      this.moreRestrictive.filter(item => item.ranking === Math.max(...restrictions))[0].value : '';
                    }
                  });
                }
                if (this.allIndependenceSelected.includes(highRestriction)) {
                  status += 1;
                  if (e.disable) {
                    e.disable = false;
                  }
                } else {
                  if (status === 0) {
                    e.disable = true;
                  }
                }
              });
            }
          }
          this.previousResult = data;
          copyData = copyData.map(e => ({...e, disable : e.disable ? true : !data.includes(e.IdService)}));
          this.resultFilter = copyData;
          this.data = this.data.map( item => ({
            ...item,
            disable: this.resultFilter.filter( e => e.Id === item.Id).length > 0 ? this.resultFilter.filter( e => e.Id === item.Id)[0].disable : true
          }));
          this.enableResultFilter = this.resultFilter.filter(item => !item.disable).length;
          this.result = this.enableResultFilter;
          this.resultFilterSL =  this.resultFilter;
          this.loadingResult = false;
        }},
      errorService => console.log('error endpoint', errorService.message));
    } else {
      if (this.stringSearch !== '') { // validate if the search coming with a string
        this.loadingResult = true;
        let copyData = this.data.map((e: any) => {
          if (e.pacemodel === 'Mercury' && e.mercury.length === 0) {
            e.disable = true;
          } else if ((e.pacemodel === 'GFIS Global' || e.pacemodel === 'PACE' || e.pacemodel === 'GFIS Local') && e.gfis.length === 0) {
            e.disable = true;
          }  else {
            e.disable = false;
          }
          return e;
        });
        // filter data with services from the search
        copyData = copyData.map(e => ({...e, disable : e.disable ? true : !this.previousResult.includes(e.IdService)}));
        if (this.filterNav.serviceLine.length > 0) {
          if (this.filterNav.serviceLine[0].value === 'All') {
            this.resultFilter = copyData.map(e => ({...e, disable : e.disable ? true : false}));
          } else {
            const sl = this.filterNav.serviceLine.map(e => e.value);
            this.resultFilter = copyData.map(e => ({...e, disable : e.disable ? true : !sl.includes(e.ServiceLineCode[0])}));
          }
          if (this.filterNav.client.GISId) {
            if (this.filterNav.client.permissibility.length > 0 && this.allIndependenceSelected.length > 0) {
              this.resultFilter.filter(e => !e.disable).map(e => {
                const applicable = [];
                const restrictions = [];
                let highRestriction = '';
                let status = 0; // update when any restriction match with the permissibility filter
                let derogation = 0;
                if (e.independenceRestrictions.ServiceLineCode !== '01' && e.independenceRestrictions.ServiceLineCode !== '03' && e.independenceRestrictions.ServiceLineCode !== null) {
                  if (this.filterNav.client.permissibility[0].without && this.filterNav.client.permissibility[0].with) {
                    derogation = 0;
                  } else if (this.filterNav.client.permissibility[0].without) {
                    derogation = 2;
                  } else if (this.filterNav.client.permissibility[0].with) {
                    derogation = 1;
                  }
                }
                _.forOwn(this.filterNav.client.permissibility[0], (value, key) => {
                  if ((e.independenceRestrictions.ServiceLineCode === '01' || e.independenceRestrictions.ServiceLineCode === '03') && e.independenceRestrictions.ServiceLineCode !== null ) {
                    if ((key === 'eusubject' || key === 'euaudited') && key !== 'euAuditedNoValuation') {
                      applicable.push('euaudited');
                    } else {
                      if (key === 'euAuditedNoValuation' && e.independenceRestrictions.EuAuditedNoValuation === '') {
                        applicable.push('eusubject');
                      } else {
                        if (key !== 'without' && key !== 'with' && key !== 'down') {
                          applicable.push(key); // Store column header applicable to the token
                        }
                      }
                    }
                  } else {
                    if (e.independenceRestrictions.ServiceLineCode !== null) {
                      if (key !== 'without' && key !== 'with' && key !== 'down') {
                        applicable.push(key);
                      }
                    }
                  }
                });
                if (applicable.length > 0) {
                  applicable.map(ele => { // Validate which column is more restrictive
                    const option = this.overWrite.filter(i => i.item === ele);
                    if (option.length > 0) {
                      if (derogation === 0) {
                        const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                        if (result.length > 0) { // get the ranking of restriction and store it
                          restrictions.push(result[0].ranking);
                        }
                      } else if (derogation === 1 || derogation === 2) {
                        if (derogation === 1 && ele !== 'eusubject') {
                          const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                          if (result.length > 0) { // get the ranking of restriction and store it
                            restrictions.push(result[0].ranking);
                          }
                        } else if (derogation === 2 && ele !== 'euaudited') {
                          const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                          if (result.length > 0) { // get the ranking of restriction and store it
                            restrictions.push(result[0].ranking);
                          }
                        }
                      }
                      highRestriction = this.moreRestrictive.filter(item => item.ranking === Math.max(...restrictions)).length > 0 ?
                      this.moreRestrictive.filter(item => item.ranking === Math.max(...restrictions))[0].value : '';
                    }
                  });
                }
                if (this.allIndependenceSelected.includes(highRestriction)) {
                  status += 1;
                  if (e.disable) {
                    e.disable = false;
                  }
                } else {
                  if (status === 0) {
                    e.disable = true;
                  }
                }
              });

              this.data = this.data.map( item => ({
                ...item,
                disable: this.resultFilter.filter( e => e.Id === item.Id).length > 0 ? this.resultFilter.filter( e => e.Id === item.Id)[0].disable : true
              }));
            } else {
              this.data = this.data.map( item => ({
                ...item,
                disable: this.resultFilter.filter( e => e.Id === item.Id).length > 0 ? this.resultFilter.filter( e => e.Id === item.Id)[0].disable : true
              }));
              if (this.previosLeftHand) {
                this.updateCardFilter(this.FilterTree);
              }
            }
          } else {
            this.data = this.data.map( item => ({
              ...item,
              disable: this.resultFilter.filter( e => e.Id === item.Id).length > 0 ? this.resultFilter.filter( e => e.Id === item.Id)[0].disable : true
            }));
            if (this.previosLeftHand) {
              this.updateCardFilter(this.FilterTree);
            }
          }
          this.enableResultFilter = this.resultFilter.filter(item => !item.disable).length;
          this.result = this.resultFilter.filter( e => e.disable === false).length; // result number grey bar
          this.resultFilterSL =  this.resultFilter;
          this.loadingResult = false;
        } else {
          if (this.filterNav.client.GISId) {
            if (this.filterNav.client.permissibility.length > 0 && this.allIndependenceSelected.length > 0) {
              copyData.filter(e => !e.disable).map(e => {
                const applicable = [];
                const restrictions = [];
                let highRestriction = '';
                let status = 0; // update when any restriction match with the permissibility filter
                let derogation = 0;
                if (e.independenceRestrictions.ServiceLineCode !== '01' && e.independenceRestrictions.ServiceLineCode !== '03') {
                  if (this.filterNav.client.permissibility[0].without && this.filterNav.client.permissibility[0].with) {
                    derogation = 0;
                  } else if (this.filterNav.client.permissibility[0].without) {
                    derogation = 2;
                  } else if (this.filterNav.client.permissibility[0].with) {
                    derogation = 1;
                  }
                }
                _.forOwn(this.filterNav.client.permissibility[0], (value, key) => {
                  if (e.independenceRestrictions.ServiceLineCode === '01' || e.independenceRestrictions.ServiceLineCode === '03') {
                    if ((key === 'eusubject' || key === 'euaudited') && key !== 'euAuditedNoValuation') {
                      applicable.push('euaudited');
                    } else {
                      if (key === 'euAuditedNoValuation' && e.independenceRestrictions.EuAuditedNoValuation === '') {
                        applicable.push('eusubject');
                      } else {
                        if (key !== 'without' && key !== 'with' && key !== 'down') {
                          applicable.push(key); // Store column header applicable to the token
                        }
                      }
                    }
                  } else {
                    if (e.independenceRestrictions.ServiceLineCode !== null) {
                      if (key !== 'without' && key !== 'with' && key !== 'down') {
                        applicable.push(key);
                      }
                    }
                  }
                });
                if (applicable.length > 0) {
                  applicable.map(ele => { // Validate which column is more restrictive
                    const option = this.overWrite.filter(i => i.item === ele);
                    if (option.length > 0) {
                      if (derogation === 0) {
                        const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                        if (result.length > 0) { // get the ranking of restriction and store it
                          restrictions.push(result[0].ranking);
                        }
                      } else if (derogation === 1 || derogation === 2) {
                        if (derogation === 1 && ele !== 'eusubject') {
                          const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                          if (result.length > 0) { // get the ranking of restriction and store it
                            restrictions.push(result[0].ranking);
                          }
                        } else if (derogation === 2 && ele !== 'euaudited') {
                          const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                          if (result.length > 0) { // get the ranking of restriction and store it
                            restrictions.push(result[0].ranking);
                          }
                        }
                      }
                      highRestriction = this.moreRestrictive.filter(ele => ele.ranking === Math.max(...restrictions)).length > 0 ?
                      this.moreRestrictive.filter(ele => ele.ranking === Math.max(...restrictions))[0].value : '';
                    }
                  });
                }
                if (this.allIndependenceSelected.includes(highRestriction)) {
                  status += 1;
                  if (e.disable) {
                    e.disable = false;
                  }
                } else {
                  if (status === 0) {
                    e.disable = true;
                  }
                }
              });
            }
          }
          this.resultFilter = copyData;
          this.data = this.data.map( item => ({
            ...item,
            disable: this.resultFilter.filter( e => e.Id === item.Id).length > 0 ? this.resultFilter.filter( e => e.Id === item.Id)[0].disable : true
          }));
          this.enableResultFilter = this.resultFilter.filter(item => !item.disable).length;
          this.result = this.resultFilter.filter( e => e.disable === false).length;
          if (this.previosLeftHand) {
            this.updateCardFilter(this.FilterTree);
          }
          this.resultFilterSL =  this.resultFilter;
          this.loadingResult = false;
        }
      } else {
        const copyData = this.data.map((e: any) => {
          if (e.pacemodel === 'Mercury' && e.mercury.length === 0) {
            e.disable = true;
          } else if ((e.pacemodel === 'GFIS Global' || e.pacemodel === 'PACE' || e.pacemodel === 'GFIS Local') && e.gfis.length === 0) {
            e.disable = true;
          }  else {
            e.disable = false;
          }
          return e;
        });
        if (this.filterNav.serviceLine.length > 0) {
          if (this.filterNav.serviceLine[0].value === 'All') {
            this.resultFilter = copyData.map(e => ({...e, disable : e.disable ? true : false}));
          } else {
            const sl = this.filterNav.serviceLine.map(e => e.value);
            this.resultFilter = copyData.map(e => ({...e, disable : e.disable ? true : !sl.includes(e.ServiceLineCode[0])}));
          }
          if (this.filterNav.client.GISId) {
            if (this.filterNav.client.permissibility.length > 0 && this.allIndependenceSelected.length > 0) {
              this.resultFilter.filter(e => !e.disable).map(e => {
                const applicable = [];
                const restrictions = [];
                let highRestriction = '';
                let status = 0; // update when any restriction match with the permissibility filter
                let derogation = 0;
                if (e.independenceRestrictions.ServiceLineCode !== '01' && e.independenceRestrictions.ServiceLineCode !== '03' && e.independenceRestrictions.ServiceLineCode !== null) {
                  if (this.filterNav.client.permissibility[0].without && this.filterNav.client.permissibility[0].with) {
                    derogation = 0;
                  } else if (this.filterNav.client.permissibility[0].without) {
                    derogation = 2;
                  } else if (this.filterNav.client.permissibility[0].with) {
                    derogation = 1;
                  }
                }
                _.forOwn(this.filterNav.client.permissibility[0], (value, key) => {
                  if ((e.independenceRestrictions.ServiceLineCode === '01' || e.independenceRestrictions.ServiceLineCode === '03') && e.independenceRestrictions.ServiceLineCode !== null ) {
                    if ((key === 'eusubject' || key === 'euaudited') && key !== 'euAuditedNoValuation') {
                      applicable.push('euaudited');
                    } else {
                      if (key === 'euAuditedNoValuation' && e.independenceRestrictions.EuAuditedNoValuation === '') {
                        applicable.push('eusubject');
                      } else {
                        if (key !== 'without' && key !== 'with' && key !== 'down') {
                          applicable.push(key); // Store column header applicable to the token
                        }
                      }
                    }
                  } else {
                    if (e.independenceRestrictions.ServiceLineCode !== null) {
                      if (key !== 'without' && key !== 'with' && key !== 'down') {
                        applicable.push(key);
                      }
                    }
                  }
                });
                if (applicable.length > 0) {
                  applicable.map(ele => { // Validate which column is more restrictive
                    const option = this.overWrite.filter(i => i.item === ele);
                    if (option.length > 0) {
                      if (derogation === 0) {
                        const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                        if (result.length > 0) { // get the ranking of restriction and store it
                          restrictions.push(result[0].ranking);
                        }
                      } else if (derogation === 1 || derogation === 2) {
                        if (derogation === 1 && ele !== 'eusubject') {
                          const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                          if (result.length > 0) { // get the ranking of restriction and store it
                            restrictions.push(result[0].ranking);
                          }
                        } else if (derogation === 2 && ele !== 'euaudited') {
                          const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                          if (result.length > 0) { // get the ranking of restriction and store it
                            restrictions.push(result[0].ranking);
                          }
                        }
                      }
                      highRestriction = this.moreRestrictive.filter(item => item.ranking === Math.max(...restrictions)).length > 0 ?
                      this.moreRestrictive.filter(item => item.ranking === Math.max(...restrictions))[0].value : '';
                    }
                  });
                }
                if (this.allIndependenceSelected.includes(highRestriction)) {
                  status += 1;
                  if (e.disable) {
                    e.disable = false;
                  }
                } else {
                  if (status === 0) {
                    e.disable = true;
                  }
                }
              });
            }
          }
          this.data = this.data.map( item => ({
            ...item,
            disable: this.resultFilter.filter( e => e.Id === item.Id).length > 0 ? this.resultFilter.filter( e => e.Id === item.Id)[0].disable : true
          }));
          this.enableResultFilter = this.resultFilter.filter(item => !item.disable).length;
          this.result = this.resultFilter.filter( e => e.disable === false).length; // result number grey bar
          this.resultFilterSL =  this.resultFilter;
          // this.servicesService.setServices(this.resultFilter);
          if (this.previosLeftHand) {
            this.updateCardFilter(this.FilterTree);
          }
          this.loadingResult = false;
        } else { // all ok
          if (this.filterNav.client.GISId) {
            if (this.filterNav.client.permissibility.length > 0 && this.allIndependenceSelected.length > 0) {
              copyData.filter(e => !e.disable).map(e => {
                const applicable = [];
                const restrictions = [];
                let highRestriction = '';
                let status = 0; // update when any restriction match with the permissibility filter
                let derogation = 0;
                if (e.independenceRestrictions.ServiceLineCode !== '01' && e.independenceRestrictions.ServiceLineCode !== '03' && e.independenceRestrictions.ServiceLineCode !== null) {
                  if (this.filterNav.client.permissibility[0].without && this.filterNav.client.permissibility[0].with) {
                    derogation = 0;
                  } else if (this.filterNav.client.permissibility[0].without) {
                    derogation = 2;
                  } else if (this.filterNav.client.permissibility[0].with) {
                    derogation = 1;
                  }
                }
                _.forOwn(this.filterNav.client.permissibility[0], (value, key) => {
                  if ((e.independenceRestrictions.ServiceLineCode === '01' || e.independenceRestrictions.ServiceLineCode === '03') && e.independenceRestrictions.ServiceLineCode !== null ) {
                    if ((key === 'eusubject' || key === 'euaudited') && key !== 'euAuditedNoValuation') {
                      applicable.push('euaudited');
                    } else {
                      if (key === 'euAuditedNoValuation' && e.independenceRestrictions.EuAuditedNoValuation === '') {
                        applicable.push('eusubject');
                      } else {
                        if (key !== 'without' && key !== 'with' && key !== 'down') {
                          applicable.push(key); // Store column header applicable to the token
                        }
                      }
                    }
                  } else {
                    if (e.independenceRestrictions.ServiceLineCode !== null) {
                      if (key !== 'without' && key !== 'with' && key !== 'down') {
                        applicable.push(key);
                      }
                    }
                  }
                });
                if (applicable.length > 0) {
                  applicable.map(ele => { // Validate which column is more restrictive
                    const option = this.overWrite.filter(i => i.item === ele);
                    if (option.length > 0) {
                      if (derogation === 0) {
                        const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                        if (result.length > 0) { // get the ranking of restriction and store it
                          restrictions.push(result[0].ranking);
                        }
                      } else if (derogation === 1 || derogation === 2) {
                        if (derogation === 1 && ele !== 'eusubject') {
                          const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                          if (result.length > 0) { // get the ranking of restriction and store it
                            restrictions.push(result[0].ranking);
                          }
                        } else if (derogation === 2 && ele !== 'euaudited') {
                          const result = this.moreRestrictive.filter(i => i.value === e.independenceRestrictions[option[0].optional]);
                          if (result.length > 0) { // get the ranking of restriction and store it
                            restrictions.push(result[0].ranking);
                          }
                        }
                      }
                      highRestriction = this.moreRestrictive.filter(item => item.ranking === Math.max(...restrictions)).length > 0 ?
                      this.moreRestrictive.filter(item => item.ranking === Math.max(...restrictions))[0].value : '';
                    }
                  });
                }
                if (this.allIndependenceSelected.includes(highRestriction)) {
                  status += 1;
                  if (e.disable) {
                    e.disable = false;
                  }
                } else {
                  if (status === 0) {
                    e.disable = true;
                  }
                }
              });
            }
          }
          this.resultFilter = copyData;
          this.enableResultFilter = this.resultFilter.filter(item => !item.disable).length;
          this.result = this.resultFilter.filter( e => e.disable === false).length;
          this.data = this.data.map( item => ({
            ...item,
            disable: this.resultFilter.filter( e => e.Id === item.Id).length > 0 ? this.resultFilter.filter( e => e.Id === item.Id)[0].disable : true
          }));
          if (this.previosLeftHand) {
            this.updateCardFilter(this.FilterTree);
          }
          this.resultFilterSL =  this.resultFilter;
          this.loadingResult = false;
        }
      }
    }
      this.orderByServices('asc');
    }
  }
  updateCardFilter(tree) {
    const filters = ['SS', 'CO', 'FOP', 'SE', 'CL', 'SO'];
    const options = _.intersection(this.sameBucket, filters);
    this.sameFilter = options.length === 0 || options.length === 1 ? true : false;
    let total = 6;
    let applicableSSL = [];
    let applicableCO = [];
    let applicableSO = [];
    let applicableFOP = [];
    let applicableSE = [];
    let applicableCL = [];
    const services =  this.data.filter(e => !e.disable);
    this.FilterTree.map((father: FilterNodeParent) => {
    const totalChildren = father.children.length;
    const child = father.children.filter(s => !s.selected).length;
    father.children.filter(s => s.selected).map(son => {
      switch (father.id) {
          case 'SSL':
            const CodeSSL = son.id.split('SSL')[1];
            if (applicableSSL.length > 0) {
              let filterServices = [];
              filterServices = services;
              filterServices.filter(ele => ele.IdSubServiceCode.length > 0).map(element => {
                if (element.IdSubServiceCode.filter(e => e === CodeSSL).length > 0) {
                  applicableSSL = _.union(applicableSSL, [element.IdService]);
                }
              });
            } else {
              services.filter(ele => ele.IdSubServiceCode.length > 0).map(element => {
                if (element.IdSubServiceCode.filter(e => e === CodeSSL).length > 0) {
                  applicableSSL = _.union(applicableSSL, [element.IdService]);
                }
              });
            }
            break;
          case 'competency':
            const CodeCompetency = son.id.split('CO')[1];
            if (applicableCO.length > 0) {
              let filterServices = [];
              filterServices = services;
              filterServices.filter(ele => ele.IdCompetencyDomain.length > 0).map(element => {
                if (element.IdCompetencyDomain.filter(e => e === CodeCompetency).length > 0) {
                  applicableCO = _.union(applicableCO, [element.IdService]);
                }
              });
            } else {
              services.filter(ele => ele.IdCompetencyDomain.length > 0).map(element => {
                if (element.IdCompetencyDomain.filter(e => e === CodeCompetency).length > 0) {
                  applicableCO = _.union(applicableCO, [element.IdService]);
                }
              });
            }
            break;
          case 'SSL2':
            const CodeSolution = son.id.split('SO')[1];
            if (applicableSO.length > 0) {
              let filterServices = [];
              filterServices = services;
              filterServices.filter(ele => ele.IdSolution.length > 0).map(element => {
                if (element.IdSolution.filter(e => e === parseInt(CodeSolution, 10)).length > 0) {
                  applicableSO = _.union(applicableSO, [element.IdService]);
                }
              });
            } else {
              services.filter(ele => ele.IdSolution.length > 0).map(element => {
                if (element.IdSolution.filter(e => e === parseInt(CodeSolution, 10)).length > 0) {
                  applicableSO = _.union(applicableSO, [element.IdService]);
                }
              });
            }
            break;
          case 'fop':
            const CodeFop = son.id.split('FOP')[1];
            if (applicableFOP.length > 0) {
              let filterServices = [];
              filterServices = services;
              filterServices.filter(ele => ele.IdFop.length > 0).map(element => {
                if (element.IdFop.filter(e => e === parseInt(CodeFop, 10)).length > 0) {
                  applicableFOP = _.union(applicableFOP, [element.IdService]);
                }
              });
            } else {
              services.filter(ele => ele.IdFop.length > 0).map(element => {
                if (element.IdFop.filter(e => e === parseInt(CodeFop, 10)).length > 0) {
                  applicableFOP = _.union(applicableFOP, [element.IdService]);
                }
              });
            }
            break;
          case 'sector':
            const CodeSector = son.id.split('SE')[1];
            if (applicableSE.length > 0 ) {
              let filterServices = [];
              filterServices = services;
              filterServices.filter(ele => ele.IdSector.length > 0).map(element => {
                if (element.IdSector.filter(e => e === parseInt(CodeSector, 10)).length > 0) {
                  applicableSE = _.union(applicableSE, [element.IdService]);
                }
              });
            } else {
              services.filter(ele => ele.IdSector.length > 0).map(element => {
                if (element.IdSector.filter(e => e === parseInt(CodeSector, 10)).length > 0) {
                  applicableSE = _.union(applicableSE, [element.IdService]);
                }
              });
            }
            break;
          case 'clientNeed':
            const CodeClient = son.id.split('CL')[1];
            if (applicableCL.length > 0) {
              let filterServices = [];
              filterServices = services;
              filterServices.filter(ele => ele.IdClientNeed.length > 0).map(element => {
                  if (element.IdClientNeed.filter(e => e === parseInt(CodeClient, 10)).length > 0) {
                    applicableCL = _.union(applicableCL, [element.IdService]);
                  }
              });
            } else {
              services.filter(ele => ele.IdClientNeed.length > 0).map(element => {
                if (element.IdClientNeed.filter(e => e === parseInt(CodeClient, 10)).length > 0) {
                  applicableCL = _.union(applicableCL, [element.IdService]);
                }
              });
            }
            break;
            default:
              break;
      }
    });
    if (totalChildren === child) { total -= 1; }
    });
    const items = {
      applicableSSL,
      applicableCO,
      applicableSO,
      applicableSE,
      applicableFOP,
      applicableCL
    };
    let result = [];
    _.forOwn(items, (value, key) => {
      if (value.length > 0 || options.includes(key.slice(10).slice(0, 2))) {
        if (result.length === 0) {
          result = value;
        } else if (result.length > 0) {
          result = _.intersection(result, value);
        }
      }
    });
    if (result.length > 0) {
      const filterData = _.intersection(result, this.data.map(e => e.IdService));
      const resultMatch = this.data.filter(item => filterData.includes(item.IdService));
      this.resultFilter = resultMatch;
      this.enableResultFilter = this.resultFilter.filter(item => !item.disable).length;
      this.result = this.enableResultFilter;
      this.previosLeftHand = true;
   } else {
    if (total === 0) {
      this.previosLeftHand = false;
      this.checkFilterItems('no match');
    } else {
      this.previosLeftHand = true;
      const filterData = _.intersection(result, this.data.map(e => e.IdService));
      const resultMatch = this.data.filter(item => filterData.includes(item.IdService));
      this.resultFilter = resultMatch;
      this.enableResultFilter = this.resultFilter.filter(item => !item.disable).length;
      this.result = this.enableResultFilter;
    }
   }
    this.orderByServices('asc');
  }
// sort by parent
getSubserviceLineByParent(parent) {
  let result = [];
  const SlSelected = parent.filter(item => item.selected);
  if (this.allssl.length > 0) {
    if (SlSelected.length > 0 && SlSelected[0].value !== 'All') {
      SlSelected.map( sl => {
          const SSL = this.allssl.filter(e => e.parent === sl.value);
          result = _.union(result, SSL);
      });
    } else {
      result = this.allssl;
    }
  }
  this.all += 1;
  this.allReady();
  return this.FilterTree[0].children = result;
}
getCompetencyDomainByParent(parent) {
let result = [];
const CompetencySelected = parent.filter(item => item.selected);
if (this.allCompetency.length > 0) {
  if (CompetencySelected.length > 0 && CompetencySelected[0].value !== 'All') {
    CompetencySelected.map( sl => {
        const competency = this.allCompetency.filter(e => e.parent === sl.value);
        result = _.union(result, competency);
    });
  } else {
    result = this.allCompetency;
  }
}
this.all += 1;
this.allReady();
this.FilterTree[1].children = result;
return;
}
getCompetencyDomainBySSL(...parent) {
if (parent[0].length === 0) {
  const selectedOptions = this.serviceLineOptions.filter( item => item.selected);
  this.getCompetencyDomainByParent(selectedOptions);
} else {
  this.allCompetency = this.allCompetency.map(item => ({...item, selected: false}));
  let result = [];
  parent[0].map( ssl => {
    const filter = this.allCompetency.filter( e => e.subparent === ssl);
    this.FilterTree[1].children = this.allCompetency;
    result = _.union(result, filter);
  });
  this.sameBucket = this.sameBucket.filter(item => item !== 'CO');
  this.FilterTree[1].children = _.orderBy(result, ['label'], ['asc'] );
}
}
getFilterOption(option) {
const parseString = String(option.id);
if (option.state && this.sameBucket.length === 0) {
  this.sameBucket.push(parseString.slice(0, 2));
} else if (option.state && this.sameBucket.length > 0) {
  this.sameBucket.push(parseString.slice(0, 2));
} else if (!option.state && this.sameBucket.length > 0) {
 const total = this.sameBucket.filter(e => e === parseString.slice(0, 2)).length;
 if (total > 0) {
     const removeOrAdd = total === 1 ? false : true;
     if (removeOrAdd) {
       const options = this.sameBucket.filter(e => e === parseString.slice(0, 2));
       this.sameBucket = this.sameBucket.filter(e => e !== parseString.slice(0, 2));
       options.splice(-1, 1);
       this.sameBucket = [].concat(this.sameBucket, options);
     } else {
       this.sameBucket = this.sameBucket.filter(e => e !== parseString.slice(0, 2));
     }
  }
}
const validacion = parseString.search('SSL');
if (validacion === 0) {
  const code = parseString.split('SSL')[1];
  if (this.selectedssl.length > 0) {
    const found = this.selectedssl.find(element => element === code);
    if (found === undefined) {
      this.selectedssl.push(code);
    } else {
      if ( this.selectedssl.indexOf(code) > -1 ) {
        this.selectedssl.splice(this.selectedssl.indexOf(code), 1);
      }
    }
  } else {
    this.selectedssl.push(code);
  }
  this.getCompetencyDomainBySSL(this.selectedssl);
}
this.updateFilterTree(option);
}
updateFilterTree(item) {
if (item.state) { this.previosLeftHand = true; }
const tree = this.FilterTree.map(node => {
  const result = node.children.filter(e => e.id === item.id);
  if (result.length > 0) {
    node.children = node.children.map( ele => {
      ele.selected = ele.id === item.id ? item.state : ele.selected;
      return ele;
    });
    return node;
  }
  return node;
});
this.FilterTree = tree;
this.checkFilterItems('updateFilterTree');
}
clearAll() {
this.sameBucket = [];
this.previosLeftHand = false;
const clearTree = this.FilterTree.map(element => {
  element.children.map(child => {
    child.selected = false;
    return child;
  });
  return element;
});
this.FilterTree = clearTree;
const selectedOptions = this.serviceLineOptions.filter( item => item.selected === true);
if ( selectedOptions[0].value === 'All') {
  this.callFilterByParent(this.serviceLineOptions);
} else {
  this.callFilterByParent(selectedOptions);
}
this.selectedssl = [];
this.checkFilterItems('click clearAll');
}

clearAllLeftFilter() {
const clearTree = this.FilterTree.map(element => {
  element.children.map(child => {
    child.selected = false;
    return child;
  });
  return element;
});
this.FilterTree = clearTree;
}
cleanExcept(option) {
this.selectedssl = [];
this.FilterTree = this.FilterTree.map(element => {
  if (element.id !== option) {
    element.children.map(child => {
      child.selected = false;
      return child;
    });
  }
  return element;
});
const selectedOptions = this.serviceLineOptions.filter( item => item.selected === true);
if (selectedOptions[0].value === 'All') {
  this.callFilterByParent(this.serviceLineOptions);
} else {
  this.callFilterByParent(selectedOptions);
}
}
allReady() {
if (this.all === 6) {
  const selectedOptions = this.serviceLineOptions.filter( item => item.selected);
  if (selectedOptions.length === 1 && selectedOptions[0].name === 'All') {
    this.serviceLineOptions.map( element => ({...element, selected: element.name === 'All' ? true : false}));
    this.callFilterByParent(this.serviceLineOptions);
  } else {
    this.onlyOneServiceLine = selectedOptions.length === 1 ? false : true;
    this.callFilterByParent(selectedOptions);
  }
  this.loading = false;
}
}
  // request
  getIndependenceRestrictionOption() {
    return this.permissibilityservice.getIndependenceIcons()
      .subscribe(data => {
        if (data.length > 0) {
          this.iconArray = data.map(e => ({
            icon: e.Icon,
            value: e.Prefix,
            class: 'material-icons mat-icon_cust',
            color: e.Color,
            label: e.Name
          }));
        }
      });
  }
  getServices(type, tokens = []) {
    this.servicesService.fetchServices(this.country).subscribe(
    () => {
      if (type !== 'extraterritorial') {
        this.servicesService.fetchAllServicesByIndependenceRestrictions();
      } else {
        this.servicesService.fetchAllServicesByIndependenceRestrictionsToken(this.country, tokens).subscribe(e => {});
      }
    },
    errorService => console.log('error endpoint', errorService.message));
  }

  getAllSubserviceLine() {
    this.subserviceLineService.fetchSubServiceLine().subscribe(
      (data: any) => {
        this.all += 1;
        this.allReady();
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  getAllCompetency() {
    this.competencyDomainService.fetchCompetency().subscribe(
      (data: any) => {this.all += 1;
                      this.allReady(); },
      errorService => console.log('error endpoint', errorService.message));
  }
  getAllSolutions() {
    this.solutionsService.fetchSolutions().subscribe(
      (data: any) => {this.FilterTree[2].children = this.solutionsService.solution;
                      this.all += 1;
                      this.allReady(); },
      errorService => console.log('error endpoint', errorService.message));
  }
  getAllFieldofPlay() {
    this.fieldofplayService.fetchFieldofplay().subscribe(
      (data: any) => {this.FilterTree[3].children = this.fieldofplayService.fieldofplay;
                      this.all += 1;
                      this.allReady(); },
      errorService => console.log('error endpoint', errorService.message));
  }
  getAllSector() {
    this.sectorService.fetchSector().subscribe(
      (data: any) => {this.FilterTree[4].children = this.sectorService.sector; this.all += 1;
                      this.allReady(); },
      errorService => console.log('error endpoint', errorService.message));
  }
  getAllClientNeeds() {
    this.clientNeedService.fetchClientNeeds().subscribe(
      (data: any) => {
        this.FilterTree[5].children = this.clientNeedService.clientNeed;
        this.all += 1;
        this.allReady();
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  getCountryList() {
    this.countryService.fetchCountries().subscribe(
      () => {},
      errorService => console.log('error endpoint', errorService.message));
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscriptionSSL.unsubscribe();
    this.subscriptionSolution.unsubscribe();
    this.subscriptionCompetency.unsubscribe();
    this.subscriptionSector.unsubscribe();
    this.subscriptionClient.unsubscribe();
    this.subscriptionMatch.unsubscribe();
    this.subscriptionCountry.unsubscribe();
    this.subscriptionFilter.unsubscribe();
    this.subscriptionCountryList.unsubscribe();
    this.subscriptionFieldofPlay.unsubscribe();
    this.subscriptionPermissibility.unsubscribe();
    this.clearAllLeftFilter();
  }

  setTotalServiceLineOption() {
    const copyData = this.data.map((e: any) => {
      if ((e.pacemodel === 'Mercury' || e.pacemodel === '') && e.mercury.length === 0) {
        e.disable = true;
      } else if ((e.pacemodel === 'GFIS Global' || e.pacemodel === 'PACE' || e.pacemodel === 'GFIS Local') && e.gfis.length === 0) {
        e.disable = true;
      }  else {
        e.disable = false;
      }
      return e;
    });
    const allitems = copyData.filter(service => !service.disable).length;
    this.serviceLineOptions.filter(item => item.value !== 'All').map(e => {
      e.total = 0;
      copyData.filter(service => !service.disable).filter(item =>  {
      if (item.ServiceLineCode.filter(a => a === e.value).length > 0) {
         e.total += item.ServiceLineCode.filter(a => a === e.value).length;
       }
     });
    });
    this.serviceLineOptions[0].total = allitems;
  }
  checkAllSLSelectedInHome() {
      const options = [];
      this.enableBucketsLeftHand = [];
      this.serviceLineOptions.map(e => {
        const matchResult = this.filterNav.serviceLine.filter(i => i.value === e.value);
        e.selected = matchResult.length > 0 ? true : false;
        if (matchResult.length > 0) {
          this.enableBucketsLeftHand = _.union(this.enableBucketsLeftHand, e.dependency);
        }
        options.push(e);
      });
      this.serviceLineOptions = options;
      this.validateUploadedInformation();
  }
}
