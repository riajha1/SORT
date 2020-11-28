


import { Component, OnInit } from '@angular/core';
import { ExcelService } from 'src/app/providers/provider.index';
import { ExcelValuesModel } from 'src/app/models/model.index';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-excel',
  templateUrl: './excel.component.html',
  styleUrls: ['./excel.component.scss']
})
export class ExcelComponent implements OnInit {
  idService: number;
  excelValues: Array<ExcelValuesModel>;
  excelValue: ExcelValuesModel;

  excelForm: FormGroup;

  constructor(private excelService: ExcelService) {
    this.excelValues = new Array<ExcelValuesModel>();
    this.excelValue = new ExcelValuesModel();

  }

  ngOnInit() {
  }

  exportAsXLSX(): void {
    this.excelService.getInfoExcel(this.excelValues).subscribe((data: any) => {
      if (data.message === 'OK') {
        const result = JSON.parse(data.value);
        this.excelService.generateExcel(result);
      }
    });
  }
  addList() {
    const excelVal = new ExcelValuesModel();
    excelVal.idService = this.idService;
    console.log('idservice ' + excelVal.idService);
    this.excelValues.push(excelVal);
    console.log(this.excelValues);
  }


}
