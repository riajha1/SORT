import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';

import { UserService, SubserviceLineService, PermissibilityService } from 'src/app/providers/provider.index';
import { Subscription } from 'rxjs/internal/Subscription';
import { SubserviceLineFilter } from 'src/app/models/model.index';
import { FinanceModalComponent } from './finance-modal/finance-modal.component';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, OnChanges {
  @Input() dataGrid: any[] = [];
  @Input() enableGrid: boolean;
  @Input() filterNav: any;
  @Input() page: any;
  @Input() pageSize: any;
  @Input() serviceLine: any[] = [];
  @Input() iconArray = [];
  @Input() countryCodeSelected: any;

  @Output () updateShowing: EventEmitter<any>;

  countrySelected = '';
  allssl: SubserviceLineFilter[] = [];
  // If is global, derogation doesn't care is 0, but if is a location that isn't GLB 1 = with derogation, 2 = without derogation
  derogation: number = 0;


  subscriptionCountry: Subscription;
  subscriptionSSL: Subscription;

  constructor(private userService: UserService,
              private subserviceLineService: SubserviceLineService,
              private modalService: NgbModal) {
    this.updateShowing = new EventEmitter();
  }
  ngOnInit() {
    this.countrySelected = this.userService.selectedcountry;
    this.allssl = this.subserviceLineService.subserviceline;
    this.calculateShowing();

    if (this.allssl.length > 0) { // get SSl label
      this.dataGrid.map(e => {
        e.ssl = e.IdSubServiceCode.map(i => this.allssl.filter(ele => ele.id.substr(3) === i).map(item => item.splitlabel)[0]);
        e.mercuryTxt = e.mercury && e.mercury.length > 0 ? this.returnString(e.mercury, 'mercury') : '';
        e.gfisTxt = e.gfis && e.gfis.length > 0 ? this.returnString(e.gfis, 'gfis') : '';
      });
    }

    this.subscriptionCountry = this.userService.selectedcountryChanged.subscribe(country => {
      this.countrySelected = country;
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'dataGrid':
            this.dataGrid = this.dataGrid
            .map(e => ({
               ...e,
               prefixsl: this.serviceLine.length > 0 ? e.ServiceLineCode.map(item => this.serviceLine.filter(elem => elem.value === item)[0].prefix) : e.ServiceLineCode,
               ssl: this.allssl.length > 0 ? e.IdSubServiceCode.map(i => this.allssl.filter(ele => ele.id.substr(3) === i).map(item => item.splitlabel)[0]) : [],
               mercuryTxt: e.mercury && e.mercury.length > 0 ? this.returnString(e.mercury, 'mercury') : '',
               gfisTxt: e.gfis && e.gfis.length > 0 ? this.returnString(e.gfis, 'gfis') : ''
              }))
            .filter(e => !e.disable );
            this.calculateShowing();
            break;
          case 'page':
           this.calculateShowing();
           break;
        }
      }
    }
  }


  calculateShowing() {
    if (this.dataGrid.length > 0) {
      const lastPage = Math.ceil(this.dataGrid.length / this.pageSize);
      const showing = this.page === lastPage ? this.dataGrid.length : (this.pageSize * this.page);
      this.updateShowing.emit(showing);
    } else {
      this.updateShowing.emit(0);
    }
  }
  returnString(data, type) {
    let txt = '';
    if (type === 'mercury') {
      data.slice(0, 3).map(e => txt += e.MercuryCode + ', ');
    } else {
      data.slice(0, 3).map(e => txt += e.Gfiscode + ', ');
    }
    return txt.slice(0, -2);
  }
  openModal(data){
    console.log('data', data);
    const modalRef = this.modalService.open(FinanceModalComponent, { backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.data = data;
  }
  // openModal(section: string, data) { business changed its mind, comment while validating in the future.
  //   const modalRef = this.modalService.open(ModalServiceComponent, { backdrop: 'static', size: 'lg'});
  //   if (section === 'ssl' ) {
  //     modalRef.componentInstance.title = 'Sub Service Line';
  //     let text = ``;
  //     data.map(e => text += `<p class="mb-0">${e}</p>`);
  //     modalRef.componentInstance.prolog = text;
  //   }
  // }
}
