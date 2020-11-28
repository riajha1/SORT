import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef, Output, EventEmitter, OnChanges } from '@angular/core';
import { ConflictConsiderationService } from '../../../../../../providers/provider.index';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { StandardTextModel } from '../../../../../../models/model.index';
import { OrderModel } from 'src/app/models/model/conflict-consideration.model';

@Component({
  selector: 'conflict-consideration',
  templateUrl: './conflict-consideration.component.html',
  styleUrls: ['./conflict-consideration.component.scss']
})
export class ConflictConsiderationComponent implements OnInit, OnChanges {
  // input and output
  @Input() active: any;
  @Input() IdService: any;
  @Input() deliverySaved: any;
  @Input() readonly: any;

  @Output() updateProgress: EventEmitter<any>;
  @Output() enableDelivery: EventEmitter<any>;

  loadingResult = true;
  selectedLevel;
  deliveryMethodShow;
  deliveryMethodList;
  selectedValues;
  Counterpartyval;
  dataDropDownConflict
  conflictsnameTextarea;
  standardtextdata: StandardTextModel;
  orderModels: OrderModel;
  conflictsdescription = 'Select Conflicts Check Required';
  conflictsname = '';
  dataStore;
  conflictName;
  dataSelectedDelivery;
  checked: any = [];
  isChecked = true;
  isselecteddeliverychecked = false;

  constructor(private conflictConsiderationService: ConflictConsiderationService, private cdRef: ChangeDetectorRef) {
    this.standardtextdata = new StandardTextModel();
    this.orderModels = new OrderModel();
    this.updateProgress = new EventEmitter(); // initialize event to emit - OUTPUT
    this.enableDelivery = new EventEmitter();
  }
  ngOnInit() {
    this.savedDeliverymethods();
    this.conflictDataOption();
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'deliverySaved':
            // console.log('deliverySaved', this.deliverySaved);
            if (this.deliverySaved) {
              this.savedDeliverymethods();
            }
            break;
        }
      }
    }
  }
  getstandardtext() {
    this.conflictConsiderationService.showstandardtext().
      subscribe((data: any) => {
        this.dataStore = data;
        this.dataStore.map((val) => {
          if (val.IdConflicts === this.selectedLevel && val.ConflictsDescription) {
            this.conflictsdescription = val.ConflictsDescription;
          }
          if (val.IdConflicts === this.selectedLevel && val.ConflictsName) {
            this.conflictsname = val.ConflictsName;
          }
        });
      }
      );
    if (this.selectedLevel) {
      if (this.selectedLevel === 1) {
        this.Counterpartyval = 0;
      }
      if (this.selectedLevel === 2) {
        this.Counterpartyval = 2;
      }
      if (this.selectedLevel === 3) {
        this.Counterpartyval = 1;
      }
    }
    this.cdRef.detectChanges();
  }
  // To show delivery methods list from data base
  savedDeliverymethods() {
    this.conflictConsiderationService.getSavedDeliveryMethods(this.IdService).subscribe((data: any) => {
      this.deliveryMethodList = data;
      this.enableDelivery.emit(false);
      // console.log('deliveryMethodList',this.deliveryMethodList);
      this.deliveryMethodShow = this.deliveryMethodList.map(deliveryName =>  deliveryName.DeliveryMethodName)
    })
  }
// drop down options for the conflict data
  conflictDataOption(){
    this.conflictConsiderationService.showstandardtext().subscribe((data:any)=>{
      this.dataDropDownConflict = data;
    })
  }


  getCheckbox(event, checkbox) {
    if (event.checked) {
      //Add to checked array
      const item = this.deliveryMethodList.filter(item => item.DeliveryMethodName === checkbox.DeliveryMethodName)[0];
      this.checked.push({
        value: item.DeliveryMethodName,
        description: '',
        order: '',
      });
    } else {
      //Remove from checked array
      // need index value so used findIndex
      const index = this.checked.findIndex(item => item.value === checkbox.DeliveryMethodName);
      this.checked.splice(index, 1);
    }
    // console.log('checked',this.checked)
  }


  Submit() {
    const progress = { title: 'Conflicts Considerations', progress: 0 }; // constante to save the progress of the component
    const cbData = this.checked.map(cbItem => {
      return {
        NameDeliveryMethod: cbItem.value,
        DescriptionDeliveryMethod: cbItem.description,
        order: 1
      };
    });
    const conflictdata = {
      IdService: this.IdService,
      CheckRequired: this.Counterpartyval,
      Counterparty: this.conflictsdescription,
      Guidance: this.conflictsnameTextarea,
      Never: this.conflictsdescription,
      Always: this.conflictsdescription,
      ConflictsDeliveryMethods: cbData
    };
    // console.log('conflict', conflictdata);
    if (conflictdata.CheckRequired === undefined) {
      progress.progress = 0;
    } else {
      progress.progress = 100;
    }
    this.updateProgress.emit(progress);
    this.saveForm(conflictdata);
  }

  saveForm(detaildatas) {
    const thisElement = this;
    Swal.fire({
      title: '',
      html: '<i class="material-icons material-spin material-2x">sync</i>',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen(this) {
        const promise = new Promise<any>((resolve) => {
          thisElement.conflictConsiderationService.insertConflictdetail(detaildatas).subscribe(
            (data: any) => {
              if (data.message === 'OK') {
                const result = JSON.parse(data.value);
                console.log('res', result);
                Swal.close();
                Swal.fire({
                  title: '',
                  icon: 'success',
                  html:
                    '<h5>Successfully saved</h5>',
                  allowOutsideClick: false,
                  showConfirmButton: true,
                });
              }
            },
            errorService => console.log('error endpoint', errorService.message)
          );
        });
        return promise;
      }
    });
  }

  cancelForm(val) {
    const thisElement = this;
    Swal.fire({
      title: '',
      html: '<h5>Are you sure? You will lose any unsaved data.</h5>',
      showCancelButton: true,
      confirmButtonColor: '#FFE600',
      cancelButtonColor: '#FFFFF',
      confirmButtonText: 'Yes ',
      cancelButtonText: 'No',
      reverseButtons: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        this.conflictsdescription = 'Select Conflicts Check Required';
        this.selectedLevel = '';
        this.conflictsnameTextarea = '';
        this.selectedValues = [];
        this.checked = [];
        this.conflictsname = '';
        this.deliveryMethodList = this.deliveryMethodList.map(item => ({...item, isChecked : val}));
      }
    });
  }
}
