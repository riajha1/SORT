import { Component, Input, SimpleChanges, OnChanges, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService, ServiceService } from '../../../../providers/provider.index';

@Component({
  selector: 'app-service-guidance',
  templateUrl: './service-guidance.component.html',
  styleUrls: ['./service-guidance.component.scss']
})
export class ServiceGuidanceComponent implements OnInit {
  @Input() guidance: any;
  @Input() idService: number;
  @Input() country: string;
  @Input() listOfCountry: any;

  subscriptionCountry: Subscription;
  enableReadmore = false;
  guidanceRegionLocation: any = { region: '', location: ''};

  constructor(private userService: UserService,
              private serviceService: ServiceService) { }
  ngOnInit() {
    this.updateCountry();
    if (this.country !== 'GLB') {
      this.getCountryGuidance(this.country, this.idService);
    }
    this.calculateHeight();
  }

  updateCountry() {
    this.subscriptionCountry = this.userService.selectedcountryChanged.subscribe(
      countryCode => {
        this.country = countryCode;
        if (countryCode !== 'GLB') {
          this.getCountryGuidance(this.country, this.idService);
        } else {
          this.guidanceRegionLocation = { region: '', location: ''};
        }
    });
  }

  getCountryGuidance(countryCode, idservice) {
    this.guidanceRegionLocation = { regionCode: '', region: '', locationCode: '', location: ''};
    this.serviceService.getServiceLineByCountryCode(countryCode, idservice).subscribe(
      (data: any) => {
        if (data.length > 0) {
          if (data.length === 1) {
            // only region
            if (data[0].CountryCode === this.country) {
              this.guidanceRegionLocation.region = data[0].QualityRegionGuidance;
              this.guidanceRegionLocation.regionCode = data[0].RegionCode;
              this.guidanceRegionLocation.location = data[0].QualityCountryGuidance;
              this.guidanceRegionLocation.locationCode = this.listOfCountry.all.filter(e => e.countryCode === data[0].CountryCode)[0].countryName;
            } else {
              this.guidanceRegionLocation.region = data[0].QualityRegionGuidance;
              this.guidanceRegionLocation.regionCode = data[0].RegionCode;
            }
          } else if (data.length > 1) {
            this.guidanceRegionLocation.region = data[0].QualityRegionGuidance;
            this.guidanceRegionLocation.regionCode = data[0].RegionCode;
            this.guidanceRegionLocation.location = data[1].QualityCountryGuidance;
            this.guidanceRegionLocation.locationCode = this.listOfCountry.all.filter(e => e.countryCode === data[1].CountryCode)[0].countryName;
          }
        }
      },
      errorService => {
        console.log('error endpoint', errorService.message);
        this.guidanceRegionLocation = { regionCode: '', region: '', locationCode: '', location: ''};
      });
  }
  calculateHeight() {
    let guidance = '';
    if (this.guidance && this.guidance.qualityConsiderations !== '') {
      guidance += this.guidance.qualityConsiderations;
    }
    const onlytext1 = guidance.replace( /(<([^>]+)>)/ig, '');
    this.enableReadmore = onlytext1.length > 276 ? true : false;
  }
}
