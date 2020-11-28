import { Component, OnInit, Input, ElementRef, ViewChildren, QueryList, OnChanges } from '@angular/core';
import {OriginServiceService} from 'src/app/providers/provider.index';
import { OriginServiceModel } from 'src/app/models/model.index';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChildren('ref', { read: ElementRef }) paragraphs: QueryList<
    ElementRef<HTMLParagraphElement>
  >;
  @Input() header: any;
  @Input() listOfWords: any = [];
  @Input() idService: number;
  @Input() helpText: any;
  @Input() breadcrumb: any;
  @Input() serviceId: any;
  @Input() country;
  @Input() dateUpdated: any;
  originOfService: OriginServiceModel;
  originServiceString = '';


  constructor(private originService: OriginServiceService) { }

  getOriginOfService(serviceId: any) {
    this.originService.getService(this.serviceId).subscribe(data => {
      this.originOfService = data;
      this.originServiceString = this.originOfService.IsGlobal === true ? 'G' : 'L';
    });
  }

  ngOnInit() {
    this.getOriginOfService(this.serviceId);
  }
}
