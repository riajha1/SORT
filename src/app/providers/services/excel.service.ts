import { ExcelValuesModel } from 'src/app/models/model.index';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/internal/operators/map';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(private http: HttpClient) { }

  getQueryPost(query: string, data) {
    const url = environment.apiUrl + query;
    const headers = new HttpHeaders({
      Autorization: 'Bearer jsdhkasdj'
    });
    return this.http.post(url, data);
  }

  getInfoExcel(idServices: Array<ExcelValuesModel>) {
    return this.getQueryPost('ExportExcel', idServices).pipe(map(res => res));
  }

  generateExcel(data: any) {
    var dec = window.atob(data);
    var myArr = new Uint8Array(dec.length)
    for (var i = 0; i < Object.keys(dec).length; i++) {
      myArr[i] = dec.charCodeAt(i);
    }
    var blob = new Blob([myArr], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    if (window.navigator && window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob);
    }
    else {
      var objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl);
    }
    // }
    // var binaryData = [];
    // binaryData.push(data);
    // const url = window.URL.createObjectURL(new Blob(binaryData, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    // const a = document.createElement('a');
    // a.setAttribute('style', 'display:none;');
    // document.body.appendChild(a);

    // // create file, attach to hidden element and open hidden element
    // a.href = url;
    // a.download = 'test';
    // a.click();
    // const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    // const objectUrl = URL.createObjectURL(blob);
    // window.open(objectUrl);
  }



  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
