import { Component, Input, OnInit } from '@angular/core';
import { IndependenceRestrictionReportModel, Permissibilitygetmodel } from '../../../../models/model.index';
import * as _ from 'lodash';
import { PermissibilityService, IndependenceRestrictionsReportService } from 'src/app/providers/provider.index';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-independence-restrictions-excel',
  templateUrl: './independence-restrictions-excel.component.html',
  styleUrls: ['./independence-restrictions-excel.component.scss']
})
export class IndependenceRestrictionsExcelComponent implements OnInit {
  @Input() serviceId: any;

  independenceRestriction: IndependenceRestrictionReportModel;
  independenceRestrictions: Array<IndependenceRestrictionReportModel>;
  labelModel: Permissibilitygetmodel;
  fileName: string;

  constructor(private independenceRestrictionService: IndependenceRestrictionsReportService,
              private labelService: PermissibilityService) {
    this.independenceRestriction = new IndependenceRestrictionReportModel();
    this.independenceRestrictions = new Array<IndependenceRestrictionReportModel>();
    this.labelModel = new Permissibilitygetmodel();
  }

  ngOnInit() {

    this.getIndependenceRestrictions();
  }

  getIndependenceRestrictions() {
    this.independenceRestrictionService.getIndependenceRestrictions(this.serviceId).subscribe(data => {
      this.independenceRestrictions = data;
      this.independenceRestriction = this.independenceRestrictions[0];
      this.getLabel(this.independenceRestriction.ServiceLineCode);
      this.independenceRestrictions.forEach(element => {

        if (element.SecauditedValue !== this.independenceRestriction.SecauditedValue) {
          element.Asterisk = '*';
        }
        if (element.SecsubjectValue !== this.independenceRestriction.SecsubjectValue) {
          element.Asterisk = '*';
        }
        if (element.EuauditedValue !== this.independenceRestriction.EuauditedValue) {
          element.Asterisk = '*';
        }
        if (element.EusubjectValue !== this.independenceRestriction.EusubjectValue) {
          element.Asterisk = '*';
        }
        if (element.EuAuditedNoValuationValue !== this.independenceRestriction.EuAuditedNoValuationValue) {
          element.Asterisk = '*';
        }
        if (element.EuauditedNoTaxValue !== this.independenceRestriction.EuauditedNoTaxValue) {
          element.Asterisk = '*';
        }
        if (element.OtAuditedValue !== this.independenceRestriction.OtAuditedValue) {
          element.Asterisk = '*';
        }
        if (element.OtSubjectValue !== this.independenceRestriction.OtSubjectValue) {
          element.Asterisk = '*';
        }
        if (element.Ch1value !== this.independenceRestriction.Ch1value) {
          element.Asterisk = '*';
        }
        if (element.Ch1nsavalue !== this.independenceRestriction.Ch1nsavalue) {
          element.Asterisk = '*';
        }
        if (element.Ch2value !== this.independenceRestriction.Ch2value) {
          element.Asterisk = '*';
        }
        if (element.ServiceLineCode !== this.independenceRestriction.ServiceLineCode) {
          element.Asterisk = '*';
        }
      });
    });

  }
  getLabel(serviceLineCode: number) {
    this.labelService.getColumndata(serviceLineCode).subscribe(data => {
      this.labelModel = data;
    });
  }

  exportexcel(): void {
    /* table id is passed over here */
    const element = document.getElementById('exportExcelContent');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SortCountryRestrictionExport');
    this.getFileName();
    /* save to file */
    XLSX.writeFile(wb, this.fileName);

  }

  getFileName() {
    const dateOb = new Date();

    // adjust 0 before single digit date
    const date = ('0' + dateOb.getDate()).slice(-2);

    // current month
    const month = ('0' + (dateOb.getMonth() + 1)).slice(-2);

    // current year
    const year = dateOb.getFullYear();

    // current hours
    const hours = dateOb.getHours();

    // current minutes
    const minutes = dateOb.getMinutes();

    // current seconds
    const seconds = dateOb.getSeconds();

    this.fileName = `SORT_Location_Restriction_Export_${year}${month}${date}-${hours}:${minutes}:${seconds}.xlsx`;

  }

}
