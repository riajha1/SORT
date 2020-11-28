import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { Subscription } from 'rxjs/internal/Subscription';
import { AutocompleteService } from 'src/app/models/model.index';
import { ServicesService, UserService } from 'src/app/providers/provider.index';
import { filter } from 'rxjs/internal/operators/filter';
import { tap } from 'rxjs/internal/operators/tap';
const userData = JSON.parse(localStorage.getItem('userData'));
@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements OnInit, OnDestroy {
  loadingSearch: boolean = false;
  locationRequest = '';
  allServices: AutocompleteService[];
  autocompleteResult: AutocompleteService[] = [];
  urlPage = '';
  dropdownsuggest: boolean = false;
  searchForm: FormGroup;
  // selectedCountryCode = 'GLB';
  selectedCountryCode = '';
  storeFilter: any = {};

  subscriptionAutocomplete: Subscription;
  subscriptionCountry: Subscription;

  constructor(private router: Router,  private servicesService: ServicesService, private userService: UserService) {
    this.getRoute();
    // this.userService.saveCountry(this.selectedCountryCode);  // save country code selected by default
   }

  ngOnInit() {
    this.allServices = this.servicesService.getAllServices();
    this.initializateForms();

    this.selectedCountryCode = this.userService.selectedcountry; // get the country stored

    if (userData !== null && this.selectedCountryCode === '') {
      // if the user session is available and the user reload the page, we need to take the location from the local  storage
      this.selectedCountryCode = userData.CountryCode;
      this.userService.saveCountry(userData.CountryCode);
    }

    if (this.allServices.length === 0) {
      this.servicesService.fetchAllServices().subscribe(e => {});
    }

    this.searchForm.controls.search.valueChanges.pipe(
      debounceTime(300), // Delay 300 miliseconds
      distinctUntilChanged(),
      tap(() => {
        this.dropdownsuggest = false;
        this.loadingSearch = true;
        this.autocompleteResult = [];
      }),
      switchMap(stringText => {
        if (typeof(stringText) === 'string') { // validate value of searchPeople is a string
          if (stringText !== '') {
            this.dropdownsuggest = true;
            const temp = {
                    word : stringText,
                    fuzziness: 0.9999,
                    serviceLineName: [],
                    countryCode: this.selectedCountryCode
                  };
            this.storeFilter = temp;
            return this.servicesService.fuzzySearch(temp);
          } else {
            this.dropdownsuggest = false;
            const temp = {
              word : '',
              fuzziness: 0.9999,
              serviceLineName: [],
              countryCode: this.selectedCountryCode
            };
            this.servicesService.setMatchFilter(temp);
            this.storeFilter = temp;
            return [];
          }
        } else {
          this.loadingSearch = false;
          this.dropdownsuggest = false;
          return [];
        }
      }))
    .subscribe(data => {
      this.loadingSearch = false;
      if (data.ordinary.length > 0 || data.codeElement.length > 0) {
        if (data.codeElement.length > 0) {
          data.codeElement.map((items: any[]) => {
            this.getItemsSearch(items, 'code');
          });
          if (data.ordinary.length > 0) {
            data.ordinary.map((items: any[]) => {
              this.getItemsSearch(items, 'ordinary');
            });
          }
        } else {
          if (data.ordinary.length > 0) {
            data.ordinary.map((items: any[]) => {
              this.getItemsSearch(items, 'ordinary');
            });
          } else {
            this.dropdownsuggest = false;
          }
        }
      }
    }, (error) => {
      this.loadingSearch = false;
      this.autocompleteResult = [];
      console.log('error', error);
    });

    this.subscriptionAutocomplete = this.servicesService.servicesAutocompleteChanged
    .subscribe((allServices: AutocompleteService[]) => this.allServices = allServices);

    this.subscriptionCountry = this.userService.selectedcountryChanged.subscribe(country => {
      this.selectedCountryCode = country;
      this.searchForm.reset();
    });
  }
  ngOnDestroy() {
    this.subscriptionAutocomplete.unsubscribe();
    this.subscriptionCountry.unsubscribe();
  }
  initializateForms() {
    this.searchForm = new FormGroup({
      search : new FormControl()
    });
  }
  getItemsSearch(items, type: string) { // grouped the results first by code and then service title
    items.map((item: { Id: number; Text: string; prefix: string; }) => {
      const matchService = this.allServices.find( service => service.idService === item.Id);
      if (matchService !== undefined) {
        if (type === 'code') {
          const option = {prefix: matchService.prefix, idService: item.Id, code: item.Text + ' | ', name: matchService.name};
          this.autocompleteResult.push(option);
        } else {
          const option = {prefix: matchService.prefix, idService: item.Id, code: '', name: matchService.name};
          this.autocompleteResult.push(option);
        }
      }
    });
  }
  redirect = (id: number) => {
    this.servicesService.setMatchFilter(this.storeFilter);
    this.router.navigate(['/service', id]);
  }
  getRoute() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.urlPage = event.url;
        if (this.urlPage !== this.locationRequest) {
          this.dropdownsuggest = false;
          this.searchForm.reset();
          this.autocompleteResult = [];
        }
    });
  }
  // Autocomplete functions
  search = () => {
    if (this.searchForm.controls.search.value !== null) {
      const temp = {
        word : this.searchForm.controls.search.value === null ? '' : this.searchForm.controls.search.value.trim(),
        fuzziness: 0.9999,
        serviceLineName: [],
        countryCode: this.selectedCountryCode
      };
      this.servicesService.setMatchFilter(temp);
      if (this.urlPage !== '/dashboard') {
        this.router.navigate(['/dashboard']);
      } else {
        this.searchForm.reset();
      }
    }
  }
  hideDropdown = () => setTimeout(() => this.dropdownsuggest = false, 500);

}
