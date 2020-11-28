import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges, OnDestroy } from '@angular/core';
import * as html2pdf from 'html2pdf.js';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService } from '../../../../providers/provider.index';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit, OnChanges, OnDestroy {
  // Input, Output and references
  @Input() serviceData: any;
  @Input() breadcrumb: any;
  @Input() dateUpdated: any;
  @Input() country: any;
  @ViewChild('pdfService', {static: false}) pdfService: ElementRef;

  // Variables of the component
  date = new Date();
  year = this.date.getFullYear();
  monthIndex = this.date.getMonth();
  day = this.date.getDate();
  create = ('0' + this.day).slice(-2) + '/' + ('0' + (this.monthIndex + 1)).slice(-2) + '/' + this.year;
  subscription: Subscription;
  filter: any;
  client = '';
  environmentURL = environment.assets;

  constructor(private userService: UserService) {
    this.filter = this.userService.filter;
   }

  ngOnInit() {
    this.formatAMPM(this.date);
    this.updateFilter();
  }
  ngOnChanges(): void {
    // console.log('la data', this.serviceData);
  }
  updateFilter() {
    this.subscription = this.userService.getfilterApp().subscribe(filter => {
      this.filter = filter;
      if (this.filter.client !== '') {

      }
    });
  }
  downloadAsPDF = () => {
    const options = {
      margin: [8, 5],
      filename: 'service.pdf',
      image: {type: 'jpeg', quality: 0.98},
      html2canvas: {dpi: 192, letterRendering: true},
      jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: {mode: ['avoid-all', 'css', 'legacy'] }
    };
    const content: Element = document.getElementById('pdfService');
    html2pdf()
    .from(content)
    .set(options)
    .toPdf()
    .get('pdf').then( pdf => {
      window.open(pdf.output('bloburl'), '_blank');
    });
  }
  formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    this.create = this.create + ' ' + strTime;
  }
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
       this.subscription.unsubscribe();
  }
}
