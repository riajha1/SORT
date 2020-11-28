import { Component, OnInit } from '@angular/core';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { Observable } from 'rxjs/internal/Observable';

import { IndependenceConsiderationsContentService } from '../../../../../providers/provider.index';
import { IndependenceContentModel } from '../../../../../models/model.index';

@Component({
  selector: 'app-considerations',
  templateUrl: './considerations.component.html',
  styleUrls: ['./considerations.component.scss']
})
export class ConsiderationsComponent implements OnInit {
  public Editor = ClassicEditor;
  public EditorReference: any;
  independence: Array<IndependenceContentModel>;
  showForm = true;
  updateData = false;
  independenceForm: FormGroup;
  editorData = '';
  loading = false;
  independenceIndex = -1;
  tempOrder = -1;
  ArrayOrder: Array<number>;
  editorConfig = ( config ) => {
    config.language = 'es';
    config.uiColor = '#F7B42C';
    config.height = 700;
    config.toolbarCanCollapse = true;
  }
  constructor(private independenceService: IndependenceConsiderationsContentService) {
    this.independence = new Array<IndependenceContentModel>();
  }
  ngOnInit() {
    this.getAllIndependence();
    this.independenceForm = new FormGroup({
       independencename: new FormControl(null, Validators.required, this.validateIndependenceName.bind(this)),
       generalprinciples: new FormControl(null, Validators.required)
     });
  }
  arrayOne = (n: number) =>  Array(n);
  getAllIndependence() {
    this.loading = true;
    this.independenceService.getIndependenceConsiderationsContent().subscribe(
      (data: any) => {
        this.independence = data;
        this.ArrayOrder = Array.from(Array(this.independence.length)).map((e, i) => i + 1 );
        this.loading = false;
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  show = () => {
    this.resetForm();
    this.showForm = !this.showForm;
  }
  submit() {
    const order = this.updateData ? this.independence[this.independenceIndex].order : this.independence.length + 1;
    const temp: any = {
      independenceName: this.independenceForm.value.independencename.trim(),
      order,
      independenceDescription: this.independenceForm.value.generalprinciples,
      isIndependenceConsideration : true
    };
    if (this.updateData) {
      temp.idIndependenceData = this.independence[this.independenceIndex].idIndependenceData;
      this.updateIndependence(temp);
    } else {
      this.saveIndependence(temp);
    }
  }
  validateIndependenceName(control: FormControl): Promise<any> | Observable<any> {
      const name = control.value.trim();
      const temp = {
        idIndependenceData: this.independenceIndex === -1 ? 0 : this.independence[this.independenceIndex].idIndependenceData,
        independenceName: name
      };
      const promise = new Promise<any>((resolve, reject) => {
        if (!control.pristine) {
        this.independenceService.getIndependenceConsiderationsValidator(temp).subscribe(
          (data: any) => {
            data.value === 'true' ?  resolve({independenceNameIsBusy: true}) : resolve(null);
            console.log('validateIndependenceName', data);
          },
          errorService => console.log('error endpoint', errorService.message)
        );
        } else {
          resolve(null);
        }
      });
      return promise;
  }
  changeEditor({ editor }: ChangeEvent) {
    this.EditorReference = editor;
    const EditorData = editor.getData();
    this.independenceForm.get('generalprinciples').setValue(EditorData);
  }
  saveIndependence(independenceData) {
    const promise = new Promise<any>((resolve, reject) => {
      this.independenceService.addIndependenceConsiderations(independenceData).subscribe(
        (data: any) => {
          if (data.message === 'OK') {
            this.getAllIndependence();
            this.showForm = true;
            this.resetForm();
          }
      },
        errorService => console.log('error endpoint', errorService.message)
      );
    });
    return promise;
  }
  getIndependence(idIndependence) {
    this.independenceIndex = idIndependence;
    const independenceData = this.findIndependence(idIndependence);
    this.independenceForm.get('independencename').setValue(independenceData.independenceName);
    this.independenceForm.get('generalprinciples').setValue(independenceData.independenceDescription);
    this.editorData = independenceData.independenceDescription;
    this.showForm = false;
    this.updateData = true;
  }
  resetForm() {
    if (this.EditorReference) {
      this.EditorReference.setData('');
    }
    this.editorData = '';
    this.independenceForm.reset();
    this.independenceIndex = -1;
  }
  findIndependence = (idIndependence) => this.independence[idIndependence];
  updateIndependence(independenceData) {
    const promise = new Promise<any>((resolve, reject) => {
      this.independenceService.updateIndependenceConsiderations(independenceData).subscribe(
        (data: any) => {
          if (data.message === 'OK') {
            this.getAllIndependence();
            if (this.updateData) {
              this.show();
              this.updateData = false;
            }
          }
      },
        errorService => console.log('error endpoint', errorService.message)
      );
    });
    return promise;
  }
  validateDelivery(independenceData) {
    this.loading = true;
    const promise = new Promise<any>((resolve, reject) => {
      this.independenceService.useIndependenceConsiderations(independenceData).subscribe(
        (data: any) => {
          if (data.message === 'OK') {
            if (data.value === 'true') {
              // A service(s) use this independence
              this.inactiveIndependence(independenceData);
            } else {
              // remove physically
              this.deleteIndependence(independenceData);
            }
          }
          resolve(null);
      },
        errorService => console.log('error endpoint', errorService.message)
      );
    });
    return promise;
  }
  inactiveIndependence(independenceData) {
    const temp = {...independenceData, isIndependenceConsideration: false};
    this.loading = true;
    const promise = new Promise<any>((resolve, reject) => {
      this.independenceService.updateIndependenceConsiderations(temp).subscribe(
        (data: any) => {
          if (data.message === 'OK') {
            this.getAllIndependence();
          }
          resolve(null);
      },
        errorService => console.log('error endpoint', errorService.message)
      );
    });
    return promise;
  }
  deleteIndependence(independenceData) {
    const promise = new Promise<any>((resolve, reject) => {
      this.independenceService.deleteIndependenceConsiderations(independenceData).subscribe(
        (data: any) => {
          if (data.message === 'OK') {
            this.getAllIndependence();
          }
          resolve(null);
      },
        errorService => console.log('error endpoint', errorService.message)
      );
    });
    return promise;
  }
  onChange(item) {
    const array = [item];
    let total = 0;
    const replace = this.independence.find(e => e.order === item.order && e.idIndependenceData !== item.idIndependenceData);
    if (replace) {
      replace.order = this.tempOrder;
      array.push(replace);
    }
    array.map( e => {
      this.independenceService.updateIndependenceConsiderations(e).subscribe(
          (data: any) => {
            total += 1;
            if (total === array.length) {
              this.tempOrder = -1;
              this.getAllIndependence();
            }
          },
          errorService => console.log('error endpoint', errorService.message)
        );
    });
  }
  updatePosition = (order) => this.tempOrder = order;
}
