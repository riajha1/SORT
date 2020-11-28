import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Component, OnInit } from '@angular/core';
import { DeliveryMethodContentService } from '../../../../../providers/provider.index';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DeliveryMethodContentModel } from '../../../../../models/model.index';
import { Observable } from 'rxjs';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular';
@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss']
})
export class DeliveryComponent implements OnInit {
  public Editor = ClassicEditor;
  public EditorReference: any;
  delivery: Array<DeliveryMethodContentModel>;
  tempOrder = -1;
  showForm = true;
  updateData = false;
  deliveryForm: FormGroup;
  editorData = '';
  loading = false;
  deliveryIndex = -1;
  ArrayOrder: Array<number>;
  editorConfig = ( config ) => {
    config.language = 'es';
    config.uiColor = '#F7B42C';
    config.height = 700;
    config.toolbarCanCollapse = true;
  }
  constructor(private deliveryService: DeliveryMethodContentService) {
    this.delivery = new Array<DeliveryMethodContentModel>();
  }
  ngOnInit() {
    this.getAllDelivery();
    this.deliveryForm = new FormGroup({
       deliveryname: new FormControl(null, Validators.required, this.validateDeliveryName.bind(this)),
       description: new FormControl(null, Validators.required)
     });
  }
  arrayOne = (n: number) =>  Array(n);
  getAllDelivery() {
    this.loading = true;
    this.deliveryService.getDeliveryMethodsContent().subscribe(
      (data: any) => {
        this.delivery = data;
        this.ArrayOrder = Array.from(Array(this.delivery.length)).map((e, i) => i + 1 );
        this.loading = false;
      },
      errorService => console.log('error endpoint', errorService.message));
  }
  show = () => {
    this.resetForm();
    this.showForm = !this.showForm;
  }
  submit() {
    const order = this.updateData ? this.delivery[this.deliveryIndex].order : this.delivery.length + 1;
    const temp: any = {
      deliveryMethodName: this.deliveryForm.value.deliveryname.trim(),
      order,
      deliveryMethodDescription: this.deliveryForm.value.description,
      isDeliveryMethod: true,
    };
    if (this.updateData) {
      temp.idDeliveryMethodData = this.delivery[this.deliveryIndex].idDeliveryMethodData;
      this.updateDelivery(temp);
    } else {
      this.saveDelivery(temp);
    }
  }
  validateDeliveryName(control: FormControl): Promise<any> | Observable<any> {
      const name = control.value.trim();
      const temp = {
        IdDeliveryMethodData: this.deliveryIndex === -1 ? 0 : this.delivery[this.deliveryIndex].idDeliveryMethodData,
        DeliveryMethodName: name
      };
      const promise = new Promise<any>((resolve, reject) => {
        if (!control.pristine) {
        this.deliveryService.getDeliveryNameValidator(temp).subscribe(
          (data: any) => {
            data.value === 'true' ?  resolve({deliveryNameIsBusy: true}) : resolve(null);
            console.log('validateDeliveryName', data);
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
    this.deliveryForm.get('description').setValue(EditorData);
  }
  saveDelivery(deliveryData) {
    const promise = new Promise<any>((resolve, reject) => {
      this.deliveryService.addDeliveryMethod(deliveryData).subscribe(
        (data: any) => {
          if (data.message === 'OK') {
            this.getAllDelivery();
            this.showForm = true;
            this.resetForm();
          }
      },
        errorService => console.log('error endpoint', errorService.message)
      );
    });
    return promise;
  }
  getDelivery(idDelivery) {
    this.deliveryIndex = idDelivery;
    const deliveryData = this.findDelivery(idDelivery);
    this.deliveryForm.get('deliveryname').setValue(deliveryData.deliveryMethodName);
    this.deliveryForm.get('description').setValue(deliveryData.deliveryMethodDescription);
    this.editorData = deliveryData.deliveryMethodDescription;
    this.showForm = false;
    this.updateData = true;
  }
  resetForm() {
    if (this.EditorReference) {
      this.EditorReference.setData('');
    }
    this.editorData = '';
    this.deliveryForm.reset();
    this.deliveryIndex = -1;
  }
  findDelivery = (idDelivery) => this.delivery[idDelivery];
  updateDelivery(deliveryData) {
    const promise = new Promise<any>((resolve, reject) => {
      this.deliveryService.updateDeliveryMethod(deliveryData).subscribe(
        (data: any) => {
          if (data.message === 'OK') {
            this.getAllDelivery();
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
  validateDelivery(deliveryData) {
    this.loading = true;
    const promise = new Promise<any>((resolve, reject) => {
      this.deliveryService.useDelivery(deliveryData).subscribe(
        (data: any) => {
          if (data.message === 'OK') {
            if (data.value === 'true') {
              // A service(s) use this delivery
               this.inactiveDelivery(deliveryData);
            } else {
              // remove physically
              this.deleteDelivery(deliveryData);
            }
          }
          resolve(null);
      },
        errorService => console.log('error endpoint', errorService.message)
      );
    });
    return promise;
  }
  inactiveDelivery(deliveryData) {
    const temp = {...deliveryData, isDeliveryMethod: false};
    const promise = new Promise<any>((resolve, reject) => {
      this.deliveryService.updateDeliveryMethod(temp).subscribe(
        (data: any) => {
          if (data.message === 'OK') {
            this.getAllDelivery();
          }
          resolve(null);
      },
        errorService => console.log('error endpoint', errorService.message)
      );
    });
    return promise;
  }
  deleteDelivery(deliveryData) {
    const promise = new Promise<any>((resolve, reject) => {
      this.deliveryService.deleteDelivery(deliveryData).subscribe(
        (data: any) => {
          if (data.message === 'OK') {
            this.getAllDelivery();
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
    const replace = this.delivery.find(e => e.order === item.order && e.idDeliveryMethodData !== item.idDeliveryMethodData);
    if (replace) {
      replace.order = this.tempOrder;
      array.push(replace);
    }
    array.map( e => {
      this.deliveryService.updateDeliveryMethod(e).subscribe(
          (data: any) => {
            total += 1;
            if (total === array.length) {
              this.tempOrder = -1;
              this.getAllDelivery();
            }
          },
          errorService => console.log('error endpoint', errorService.message)
        );
    });
  }
  updatePosition = (order) => this.tempOrder = order;
}
