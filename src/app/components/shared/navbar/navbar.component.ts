import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { environment } from '../../../../environments/environment';
import { CountriesService, UserService, ServicesService } from '../../../providers/provider.index';
import { tap } from 'rxjs/internal/operators/tap';
import { Router, ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2/dist/sweetalert2.js';

const userData = JSON.parse(localStorage.getItem('userData'));

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  providers: [CountriesService]
})
export class NavbarComponent implements OnInit, OnDestroy {
  loadingCountry: boolean = true;
  closeflag: boolean = false;
  environmentURL = environment.assets;

  countries: FormControl;
  filterNav: any;
  countryList: any = [];
  selectedCountryCode = '';
  previousSelectedCountryCode = '';
  showNavBarControlls: boolean = true;
  navBarTopHeight: number = 41;
  public global:boolean = false;
  public policy:boolean = false;

  // subscriptions
  subscriptionFilternav: Subscription;
  subscriptionCountryList: Subscription;
  subscriptionCountry: Subscription;
  subscriptionUserLoginStatus: Subscription;

  constructor(private countryService: CountriesService,
              private userService: UserService,
              private servicesService: ServicesService,
              private router: Router) {
  }

  // Hooks
  ngOnInit() {
    this.filterNav = this.userService.filter;
    this.selectedCountryCode = this.userService.selectedcountry; // get the country stored

    if (userData !== null && this.selectedCountryCode === '') {
      // if the user session is available and the user reload the page, we need to take the location from the local  storage
      this.selectedCountryCode = userData.CountryCode;
      this.userService.saveCountry(userData.CountryCode);
      this.previousSelectedCountryCode = this.userService.selectedcountry;
    }

    this.countryList = this.countryService.countryList.all !== undefined ? this.countryService.countryList.all : [];
    this.initializateForms();

    if (this.countryList.length === 0) {
      this.getCountries();
    }

    this.subscriptionCountryList = this.countryService.countryListChanged
      .subscribe((countries: any) => {
        if (countries.all !== undefined) {
          this.countryList = countries.all;
        }
      });

    this.subscriptionFilternav = this.userService.getfilterApp()
      .subscribe(filterData => this.filterNav = filterData);

    this.subscriptionCountry = this.userService.selectedcountryChanged.subscribe(country => {
      this.selectedCountryCode = country;
    });

    this.subscriptionUserLoginStatus = this.userService.userLoginStatusChanged.subscribe(status => {
      this.showNavBarControlls = status;
      this.closeflag = false;
      if (status === true) {
        this.navBarTopHeight = 41;
      } else {
        this.navBarTopHeight = 0;
      }
    });
  }
  ngOnDestroy() {
    this.subscriptionFilternav.unsubscribe();
    this.subscriptionCountryList.unsubscribe();
    this.subscriptionCountry.unsubscribe();
    this.subscriptionUserLoginStatus.unsubscribe();
  }

  initializateForms() {
    this.countries = new FormControl('');
  }

  getCountries() {
    this.countryService.fetchCountries()
      .pipe(tap(() => this.loadingCountry = false))
      .subscribe(
        (data: any) => { },
        errorService => console.log('error endpoint', errorService.message));
  }

  removeAllfilter = () => {
    this.userService.removeFilter();
    this.servicesService.removeMatchFilter();
    this.userService.savePreviousClient({});
  }

  onChangeCountry = (country: string) => {
    localStorage.setItem('locationSelected', JSON.stringify(country));
    const countryStorage = JSON.parse(localStorage.getItem('locationSelected'));
    if (countryStorage !== null) {
      this.userService.saveCountry(countryStorage);
    } else {
      this.userService.saveCountry(country);
    }

    this.servicesService.removeMatchFilter();
    localStorage.setItem('locationSelected', JSON.stringify(country));
    if (this.router.url.indexOf('service') >= 0) {
      //ToDo. Dilip. Bring this back.
      //this.isServiceOfferedInCountry(country);
    }
    else {
      this.previousSelectedCountryCode = this.userService.selectedcountry;
      localStorage.setItem('locationSelected', JSON.stringify(this.previousSelectedCountryCode));
    }
  }

  customSearchFn(term: string, item: any) {
    term = term.toLocaleLowerCase();
    return item.countryName.toLocaleLowerCase().startsWith(term);
  }

  isServiceOfferedInCountry(countryCode: string) {
    var idService = '';
    if (this.router.url.split('/').length > 2) {
      idService = this.router.url.split('/')[2];
    }

    if (idService != '') {
      const promise = new Promise<any>((resolve, reject) => {
        this.countryService.isServiceOfferedInCountry(countryCode, idService).subscribe(
          (data: any) => {
            if (data == false) {
              const thisElement = this;
              Swal.fire({
                title: '',
                icon: 'info',
                html:
                  '<h5>The service is not offered in this location. Click return to revert or browse to view other services for this location.</h5>',
                allowOutsideClick: false,
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Return',
                cancelButtonText: 'Browse',
              }).then((result) => {
                if (result.dismiss === 'cancel') {
                  this.navigateToDashboard(false);
                }
                else {
                  if (this.previousSelectedCountryCode !== '') {
                    this.selectedCountryCode = this.previousSelectedCountryCode;
                    this.userService.saveCountry(this.previousSelectedCountryCode);
                  }
                }
              });
            }
            else {
              this.previousSelectedCountryCode = this.selectedCountryCode;
            }
          },
          errorService => console.log('error endpoint', errorService.message)
        );
      });
    }
  }

  navigateToDashboard(bKeepSelectedLocation) {
    if (bKeepSelectedLocation) {
      this.router.navigate(['/dashboard']);
    }
    else {
      this.router.navigate(['/dashboard']);
    }
  }
t(){
  this.closeflag = !this.closeflag;
  this.policy == false;
  this.global == false
}

}
