import { Component, Input, ViewChildren, ElementRef, QueryList, SimpleChanges, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-independence-consideration',
  templateUrl: './independence-consideration.component.html',
  styleUrls: ['./independence-consideration.component.scss']
})
export class IndependenceConsiderationComponent implements OnInit, OnChanges {
  @Input() independence: any;
  @Input() restrictions: any;
  @Input() filter: any;
  @ViewChildren('ref', { read: ElementRef }) paragraphs: QueryList<ElementRef<HTMLParagraphElement>>;

  independenceChannel2 = ['Business relationships, mutuality of Interest and self-interest threats'];
  independenceChannel2ASTCC = ['Audit Client Counterparties'];
  options = [];
  existIndependence: boolean = false;
  constructor() { }
  ngOnInit(){
  }
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'independence':
          case 'restrictions': {
            if (this.restrictions && this.independence) {
              if (this.restrictions.ch2Value === 'ASTCC') {
                this.options = [].concat(this.independenceChannel2, this.independenceChannel2ASTCC);
              } else {
                this.options = this.independenceChannel2;
              }
              this.existIndependence = this.independence.filter(e => this.options.includes(e.IndependenceName)).length > 0;
            }
            break;
          }
          case 'filter': {
            if (this.restrictions && this.independence) {
              if (this.restrictions.ch2Value === 'ASTCC') {
                this.options = [].concat(this.independenceChannel2, this.independenceChannel2ASTCC);
              } else {
                this.options = this.independenceChannel2;
              }
              this.existIndependence = this.independence.filter(e => this.options.includes(e.IndependenceName)).length > 0;
            }
            break;
          }
        }
      }
    }
  }
}
