import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ServiceService } from '../../../../../../providers/provider.index';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  @Input() node: any = [];
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
    const temp = [{
      IdService: this.IdService,
      CreationDate: '',
      ModificationDate: '',
      Status: 'PublishedRegional',
      CountryCode: this.countryList.filter(e => e.countryName === node.name)[0].countryCode,
      RegionCode: this.countryList.filter(e => e.countryName === node.name)[0].region
    }];
    this.loadingButton = true;
    this.serviceService.publishService(temp).subscribe(e => {
      this.loadingButton = false;
      node.enable = false;
      this.updateNode.emit(node);
    });
  }
}
