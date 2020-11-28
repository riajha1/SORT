import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {FormGroup, FormControl} from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';

import { ServiceLineService, UserService, ServicesService } from '../../../providers/provider.index';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [ServiceLineService]
})
export class HomeComponent implements OnInit, OnDestroy {

  loading: boolean = true;
  loadingCarousel: boolean = true;
  firstTime: boolean = true;

  formServiceLine: FormGroup;

  serviceLineList: any = [];
  defaultOption: any = []; // Default selected option
  carouselServices = [];

  label: any; // label for selected options
  filter: any;

  subscription: Subscription;

  constructor(private router: Router,
              private serviceLineService: ServiceLineService,
              private userService: UserService,
              private servicesServices: ServicesService
              ) {}

  // Hooks
  ngOnInit() {
    this.userService.removeFilter();
    this.getServiceLine();
    this.formServiceLine = new FormGroup({ serviceLine : new FormControl() });
    this.formServiceLine.controls.serviceLine.valueChanges.subscribe( data => this.filterOptionsValidation(data));
    this.subscription = this.userService.getfilterApp().subscribe(filter => this.filter = filter);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // filterOptionsValidation
  // Validate selected option, don't allow select all option with other option
  // if no option is selected, by default set defaultoption
  filterOptionsValidation(data: any[]) {
      this.userService.saveSlFilter(data);
      const foundAll = data.map(item => item.name).indexOf('All') === 0;
      if (data.length >= 2 && foundAll) {
        if (this.firstTime ) {
          const selected = this.formServiceLine.controls.serviceLine.value;
          selected.splice( data.map(item => item.name).indexOf('All'), 1 );
          this.formServiceLine.controls.serviceLine.setValue(selected, {onlySelf: true});
          this.firstTime = false;
        } else {
          this.firstTime = true;
          this.formServiceLine.controls.serviceLine.setValue([this.serviceLineList[0]], {onlySelf: true});
        }
      }
      if (data.length === 0) {
        this.firstTime = true;
        this.formServiceLine.controls.serviceLine.setValue([this.serviceLineList[0]]);
      }
  }

  redirectPage = () => this.router.navigate(['/dashboard']);

  getServiceLine() {
    this.serviceLineService.getServiceLineValues().subscribe(
      (data: any) => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        this.serviceLineList = data;
        this.getFrequentServiceByUser();
        if (userData !== null && this.serviceLineList.length > 0) {
          const serviceLine = this.serviceLineList.find(i => i.value === userData.ServiceLineCode);
          if (serviceLine !== undefined) {
            this.firstTime = false;
            this.defaultOption = [serviceLine];
          } else {
            this.firstTime = true;
            this.defaultOption = [this.serviceLineList[0]];
          }
        }
        this.formServiceLine.controls.serviceLine.setValue(this.defaultOption);
        this.label = this.formServiceLine.controls.serviceLine.value.map(x => x.name).join(', ');
        this.loading = false;
        },
      errorService => console.error('error endpoint', errorService.message));
  }

  // Modify label inside of the ng-select
  selectedServiceLine = () => this.label = this.formServiceLine.controls.serviceLine.value
  .map(x => x.name = x.name === 'Strategy and Transactions' ? x.prefix : x.name)
  .join(', ')

  // get Frequently service by user
  getFrequentServiceByUser() {
    this.servicesServices.fetchAllServicesByUser().subscribe(
      (data: any) => {
        this.carouselServices = data.map(e => ({
          id: e.IdService,
          title: e.Name,
          description: e.HeadlineDescription,
          serviceLine: this.serviceLineList.filter(i => i.name === e.ServiceLine)
        }));
        this.loadingCarousel = false;
      },
      errorService => console.log('error endpoint', errorService.message));
  }
}
