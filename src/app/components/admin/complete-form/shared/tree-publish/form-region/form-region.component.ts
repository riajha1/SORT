import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ServiceService } from '../../../../../../providers/provider.index';

@Component({
  selector: 'app-form-region',
  templateUrl: './form-region.component.html',
  styleUrls: ['./form-region.component.scss']
})
export class FormRegionComponent implements OnInit {
  @Input() node: any = [];
  @Input() completeTree: any = [];
  @Input() progress: string = '';
  @Input() enable: boolean = false;
  @Input() countryList: Array<any> = [];
  @Input() IdService: any = 0;

  @Output() updateNode: EventEmitter<any>;

  loadingButton: boolean = false;

  constructor(private serviceService: ServiceService) {
    this.updateNode = new EventEmitter();
   }

  ngOnInit() {}
  publishService(node) {
    const descendants = this.completeTree.getDescendants(node).filter(e => e.enable); // obtain descendants of the region that aren't published
    let publishLocations = []; // array to store unpublished locations
    if (descendants.length > 0) {
      publishLocations = descendants.map(country => ({
        IdService: this.IdService,
        CreationDate: '',
        ModificationDate: '',
        Status: 'PublishedRegional',
        CountryCode: this.countryList.filter(e => e.countryName === country.name)[0].countryCode,
        RegionCode: node.name
      }));
      publishLocations.push({ // Add region record
        IdService: this.IdService,
        CreationDate: '',
        ModificationDate: '',
        Status: 'PublishedRegional',
        CountryCode: '',
        RegionCode: node.name
      });
    }
    console.log('publishLocations', publishLocations);
    this.loadingButton = true;
    const thisElement = this;
    Swal.fire({
      title: '',
      html: '<i class="material-icons material-spin material-2x">sync</i>',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen(this) {
      const promise = new Promise<any>((resolve, reject) => {
        thisElement.serviceService.publishService(publishLocations).subscribe(
          (data: any) => {
            if (data.message === 'OK') {
              const result = JSON.parse(data.value);
              thisElement.loadingButton = false;
              descendants.map(e => {
                thisElement.updateNode.emit({...e, enable: false, status: 'PublishedRegional' });
                return  e.enable = false;
              }); // mark each location as published
              node.enable = false;
              thisElement.updateNode.emit(node);
              Swal.close();
            }
        },
          errorService => console.log('error endpoint', errorService.message)
        );
      });
      return promise;
      }
    });
  }
}
