import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { OtherService } from '../../../../../../providers/provider.index';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-other',
  templateUrl: './other.component.html',
  styleUrls: ['./other.component.scss']
})
export class OtherComponent implements OnInit, OnChanges {
  // input and output
  @Input() active: boolean;
  @Input() IdService: number = 0;
  @Input() otherDetailSaved: any;
  @Input() progressStatus: any;
  @Input() readonly: any;

  @Output() updateProgress: EventEmitter<any>;
  @Output() getOtherById: EventEmitter<any>;

   // component variables
  otherdetail: FormGroup;
  nootherconsideration: boolean = true;
  nonglobe: boolean = false;
  savedOneTime: boolean = false;
  option = [
    {
      value: 1,
      name: 'Yes'
    },
    {
      value: 0,
      name: 'No'
    }
  ];

  constructor(private fb: FormBuilder, private otherservice: OtherService) {
    this.updateProgress = new EventEmitter(); // initialize event to emit - OUTPUT
    this.getOtherById = new EventEmitter();
  }

  // Reactive form for other detail form
  ngOnInit() {
    this.initializeForm();
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'otherDetailSaved': {
            // Get service detail object from database
            this.initializeForm(this.otherDetailSaved);
            break;
          }
          case 'progressStatus': {
            if (this.progressStatus === '100' && this.otherDetailSaved.Isqmcheck === null && this.otherDetailSaved.ProcessorData === null && this.otherDetailSaved.Gtcmodule === '' ){
              this.nonglobe = true;
            }
            break;
          }
        }
      }
    }
  }
  initializeForm(data: any = {}) {
    if (data !== null && data.IdService !== undefined) {
      if (this.progressStatus === '100' && data.Isqmcheck === null && data.ProcessorData === null && data.Gtcmodule === '' ) {
        this.nonglobe = true;
        this.nootherconsideration = false;
      } else {
        this.nootherconsideration = true;
      }
      this.savedOneTime = true;
      this.loadingToGetSavedData();
      this.otherdetail = this.fb.group({
        IdService: new FormControl(this.IdService),
        Isqmcheck: new FormControl(data.Isqmcheck === null ? '' : data.Isqmcheck),
        Considerations: new FormControl(data.Considerations),
        ProcessorData: new FormControl(data.ProcessorData === null ? '' : data.ProcessorData),
        ProcessorConsiderations: new FormControl(data.ProcessorConsiderations),
        Gtcmodule: new FormControl(data.Gtcmodule),
      });
    } else {
      this.otherdetail = this.fb.group({
        IdService: new FormControl(this.IdService),
        Isqmcheck: [''],
        Considerations: [''],
        ProcessorData: [''],
        ProcessorConsiderations: [''],
        Gtcmodule: [''],
      });
    }
  }

  showHidetool(e) {
    this.nootherconsideration = !e.checked;
    this.nonglobe = e.checked;
    this.initializeForm();
  }
// to submit the form
  Submit() {
    const progress = { title: 'Other', progress: 0 }; // constant to save the progress of the component
    const temp = { ...this.otherdetail.value};
    if (temp.Isqmcheck !== '') {
      progress.progress = 100;
    }
    if (temp.ProcessorData !== '') {
      progress.progress = 100;
    }
    if (temp.Gtcmodule !== '') {
      progress.progress = 100;
    }
    if (this.nonglobe === true) {
      progress.progress = 100;
    }
    temp.IdService = this.IdService;
    this.saveForm(temp, progress);
  }

// pushing the data to datebase
  saveForm(detaildatas, progress) {
    this.savedOneTime = true;
    const thisElement = this;
    Swal.fire({
      title: '',
      html: '<i class="material-icons material-spin material-2x">sync</i>',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen(this) {
        const promise = new Promise<any>((resolve) => {
          thisElement.otherservice.insertOtherdetail(detaildatas).subscribe(
            (data: any) => {
              if (data.message === 'OK') {
                thisElement.updateProgress.emit(progress);
                const result = JSON.parse(data.value);
                Swal.close();
                Swal.fire({
                  title: '',
                  icon: 'success',
                  html: '<h5>Successfully saved</h5>',
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
  loadingToGetSavedData(close = false) {
    if (close === false) {
      Swal.close();
    } else {
      Swal.fire({
        title: '',
        html: '<i class="material-icons material-spin material-2x">sync</i>',
        allowOutsideClick: false,
        showConfirmButton: false,
        onOpen(this) {}
      });
    }
  }
  // to reset the form
  cancel() {
    Swal.fire({
      title: '',
      html: '<h6>Are you sure? You will lose any unsaved data.</h6>',
      showCancelButton: true,
      confirmButtonColor: '#FFE600',
      cancelButtonColor: '#FFFFF',
      confirmButtonText: 'Yes ',
      cancelButtonText: 'No',
      reverseButtons: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        if (!this.savedOneTime) {
          this.initializeForm();
          this.nonglobe = false;
          this.nootherconsideration = true;
        } else {
          this.nonglobe = false;
          this.getOtherById.emit();
          this.loadingToGetSavedData(true);
        }
      }
    });
  }

}
