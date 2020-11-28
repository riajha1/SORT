import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import * as _ from 'lodash';
import { UserService } from '../../../../providers/provider.index';
import { ServiceService } from '../../../../providers/provider.index';

@Component({
  selector: 'app-country-considerations',
  templateUrl: './country-considerations.component.html',
  styleUrls: ['./country-considerations.component.scss']
})
export class CountryConsiderationsComponent implements OnInit, OnChanges {
  @Input() allCountries: any;
  @Input() idService: number;
  @Input() countryCodeSelected: string;
  @Input() filter: any;

  subscriptionCountry: Subscription;
  loading: boolean;
  isGlobal = true;
  considerations: any = { region: '', readmoreRegion: false, location: '', readmoreLocation: false};
  readmore = false;
  country = '';
  region = '';
  countryCode = '';
  tokenOverride = [];
  overrideConsideration: boolean = false;

  constructor(private userService: UserService,
              private serviceService: ServiceService) {
    this.loading = false;
   }
  ngOnInit(): void {
    if (this.countryCodeSelected !== 'GLB') {
      this.getNameAndRegion(this.countryCodeSelected);
    } else {
      this.countryCode = this.countryCodeSelected;
    }
    this.subscriptionCountryFn();
  }
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'filter':
            if (this.filter.client.GISId) {
              if (this.filter.client.permissibility.length > 0) {
                const override = [];
                _.forOwn(this.filter.client.permissibility[0], (value, key) => {
                  if (value === 'override') {
                    override.push(key);
                  }
                });
                this.tokenOverride = override;
              }
              if (this.tokenOverride.length > 0) {
                this.overrideConsideration = false;
                this.tokenOverride.map(e => {
                  if (e.startsWith('UK')) {
                    this.overrideConsideration = true;
                  }
                });
                if ( this.overrideConsideration) {
                  this.getNameAndRegion('GBR');
                }
              }
            } else {
              this.overrideConsideration = false;
              if (this.countryCodeSelected !== 'GLB') {
                this.getNameAndRegion(this.countryCodeSelected);
              } else {
                this.isGlobal = true;
              }
            }
            break;
        }
      }
    }
  }
  subscriptionCountryFn() {
    this.subscriptionCountry = this.userService.selectedcountryChanged.subscribe(
      countryCode => {
        if (countryCode !== 'GLB' ) {
          if (this.filter.client.GISId) {
            if (this.filter.client.permissibility.length > 0) {
              const override = [];
              _.forOwn(this.filter.client.permissibility[0], (value, key) => {
                if (value === 'override') {
                  override.push(key);
                }
              });
              this.tokenOverride = override;
            }
            if (this.tokenOverride.length > 0) {
              this.overrideConsideration = false;
              this.tokenOverride.map(e => {
                if (e.startsWith('UK')) {
                  this.overrideConsideration = true;
                }
              });
              if ( this.overrideConsideration) {
                this.getNameAndRegion('GBR');
              }
            }
          } else {
            this.overrideConsideration = false;
            this.getNameAndRegion(countryCode);
          }
        } else {
          this.isGlobal = true;
        }
    });
  }
  getNameAndRegion(countryCode) {
    this.country = this.allCountries.all.filter(e => e.countryCode === countryCode)[0].countryName;
    this.region =  this.allCountries.all.filter(e => e.countryCode === countryCode)[0].region;
    this.countryCode = countryCode;
    this.getCountryConsideration(this.idService, this.countryCode);
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
            this.considerations = { region: '', readmoreRegion: false, location: '', readmoreLocation: false};
          }
        } else {
          this.isGlobal = true;
        }
        this.loading = false;
      },
      errorService => console.log('error endpoint', errorService.message));
  }
}
