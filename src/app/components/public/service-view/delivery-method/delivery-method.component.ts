import { Component, Input, SimpleChanges, OnChanges, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-delivery-method',
  templateUrl: './delivery-method.component.html',
  styleUrls: ['./delivery-method.component.scss']
})
export class DeliveryMethodComponent implements OnInit, OnChanges {
  @ViewChild('defaultOption', {static: false}) defaultOption: ElementRef;
  @Input() public delivery: any;
  @Input() public items: any = 0;
  @Input() public urlLink: any = '';
  @Input() public filter: any;
  @Output () permissibilityOptions: EventEmitter<any>;
  heightDelivery = 0;
  deliveryChannel2 = ['Hardware or Software resale', 'EY Technology licensed to a client', 'Client access to EY Technology that is hosted in EY designated and managed environments'];
  existDelivery: boolean = false;
  constructor() {
    this.permissibilityOptions = new EventEmitter();
  }
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'delivery': {
            if (this.delivery && this.delivery.length > 0) {
              this.existDelivery = this.delivery.filter(e => this.deliveryChannel2.includes(e.DeliveryMethodName)).length > 0;
            }
            break;
          }
          case 'items': {
            this.getHeightDinamycByItems(this.items);
            break;
          }
          case 'filter': {
            if (this.filter.client && this.filter.client.GISId || this.filter.client && !this.filter.client.GISId && this.filter.client.ClientName === 'Channel 2') {
              if (this.filter.client.permissibility.length === 0) {
                this.getHeightDinamycByItems(this.delivery.filter(e => this.deliveryChannel2.includes(e.DeliveryMethodName)).length);
                if (this.defaultOption !== undefined) {
                  const el: HTMLElement = this.defaultOption.nativeElement;
                  el.click();
                }
              } else if (this.filter.client.permissibility.length === 1 && this.filter.client.permissibility[0].ch2){
                this.getHeightDinamycByItems(this.delivery.filter(e => this.deliveryChannel2.includes(e.DeliveryMethodName)).length);
                if (this.defaultOption !== undefined) {
                  const el: HTMLElement = this.defaultOption.nativeElement;
                  el.click();
                }
              }
            } else {
              this.getHeightDinamycByItems(this.items);
            }
            break;
          }
        }
      }
    }
  }
  getHeightDinamycByItems(deliveryItems: number) {
    const linePerRow = 24 * 2; // line height * number of lines
    this.heightDelivery = deliveryItems * linePerRow;
  }
  getDeliveryOption(element) {
    this.permissibilityOptions.emit(element);
  }
  OnclickItem = () => {};
}


