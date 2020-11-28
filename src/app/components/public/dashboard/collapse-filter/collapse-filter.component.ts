import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-collapse-filter',
  templateUrl: './collapse-filter.component.html',
  styleUrls: ['./collapse-filter.component.scss']
})
export class CollapseFilterComponent implements OnInit {
  @Input() options: any[] = [];
  @Input() enableItems: any[] = [];
  @Input() onlyOneServiceLine = false;
  @Output () checkOptions: EventEmitter<any>;
  @Output () clear: EventEmitter<any>;
  

  constructor() {
    this.checkOptions = new EventEmitter();
    this.clear = new EventEmitter();
  }

  ngOnInit() { }
  checkOption(e) {
    const temp = {
      id: e.target.id,
      state: e.target.checked,
      label: e.target.labels[0].innerText.trim()
    };
    this.checkOptions.emit(temp);
  }
  clearAll() {
    this.clear.emit();
  }
}