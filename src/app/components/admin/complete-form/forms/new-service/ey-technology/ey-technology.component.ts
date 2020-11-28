import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { EyTechnologyService } from '../../../../../../providers/provider.index';

@Component({
  selector: 'app-ey-technology',
  templateUrl: './ey-technology.component.html',
  styleUrls: ['./ey-technology.component.scss']
})
export class EyTechnologyComponent implements OnInit, OnChanges {
  // references
  @ViewChild('TechnologyName', { static: false }) TechnologyName: ElementRef;
  @ViewChild('DeepLink', { static: false }) DeepLink: ElementRef;
  @ViewChild('TechnologyDescription', { static: false }) TechnologyDescription: ElementRef;

  // input and output
  @Input() active: any;
  @Input() IdService: any;
  @Input() EYGuidanceTechnology: any;
  @Input() TechnologiesTools: any;
  @Input() progressStatus: any;
  @Input() readonly: any;

  @Output() updateProgress: EventEmitter<any>;
  @Output() getEyTechnologyById: EventEmitter<any>;
  @Output() loadingToGetSavedData: EventEmitter<any>;

  // component variables
  savedOneTime: boolean = false;
  tooldetail = [];
  deeplink;
  guidancetextarea: string = '';
  eytech: boolean = true;
  isChecked = false; // No tool/asset(s) associated with this service
  eytechdata;

  public Editor = ClassicEditor;
  public EditorReference: any;

  constructor(private eytechnologyservice: EyTechnologyService) {
    this.updateProgress = new EventEmitter(); // initialize event to emit - OUTPUT
    this.getEyTechnologyById = new EventEmitter();
    this.loadingToGetSavedData = new EventEmitter();
  }

  ngOnInit() { }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'EYGuidanceTechnology': {
            if (this.EYGuidanceTechnology !== '') {
              this.guidancetextarea = this.EYGuidanceTechnology;
              this.savedOneTime = true;
            }
            break;
          }
          case 'TechnologiesTools': {
            if (this.TechnologiesTools.length > 0) {
              this.tooldetail = this.TechnologiesTools;
              this.eytech = true;
              this.savedOneTime = true;
            }
            break;
          }
          case 'progressStatus': {
            if (this.progressStatus === '100' && this.TechnologiesTools.length === 0) {
              this.isChecked = true;
              this.savedOneTime = true;
              this.showHidetool({checked: true});
            }
            break;
          }
        }
      }
    }
  }

  addNewTool() {
    if (this.TechnologyName.nativeElement.value !== '') {
      this.deeplink = this.DeepLink.nativeElement.value === '' ? this.DeepLink.nativeElement.value :
        this.DeepLink.nativeElement.value.startsWith('http://') ? this.DeepLink.nativeElement.value :
        (this.DeepLink.nativeElement.value.startsWith('https://') ? this.DeepLink.nativeElement.value : 'http://' + this.DeepLink.nativeElement.value);
      const exists = this.tooldetail.filter(e => e.TechnologyName === this.TechnologyName.nativeElement.value);
      if (exists.length === 0) {
        const temp = {
          IdService: this.IdService,
          TechnologyName: this.TechnologyName.nativeElement.value,
          DeepLink: this.deeplink,
          TechnologyDescription: this.TechnologyDescription.nativeElement.value,
        };
        this.tooldetail.push(temp);
        this.TechnologyName.nativeElement.value = '';
        this.DeepLink.nativeElement.value = '';
        this.TechnologyDescription.nativeElement.value = '';
      } else {
        this.TechnologyName.nativeElement.value = '';
        this.DeepLink.nativeElement.value = '';
        this.TechnologyDescription.nativeElement.value = '';
      }
    } else {
      Swal.fire({
        title: '',
        html: '<h6>Please enter a tool name</h6>',
        confirmButtonColor: '#FFE600',
        confirmButtonText: 'OK',
        reverseButtons: true,
        allowOutsideClick: false
      });
    }
  }
  showHidetool(e) {
    this.eytech = !e.checked;
    if (this.eytech === false) {
      this.tooldetail = [];
    }
  }
  cancel() {
    Swal.fire({
      title: '',
      html: '<h6>Are you sure? You will lose any unsaved data.</h6>',
      showCancelButton: true,
      confirmButtonColor: '#FFE600',
      cancelButtonColor: '#FFFFF',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No ',
      reverseButtons: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        if (this.savedOneTime) {
          this.getEyTechnologyById.emit();
          this.loadingToGetSavedData.emit(true);
        }
        this.tooldetail = [];
        this.isChecked = false;
        this.eytech = true;
        this.guidancetextarea = '';
      }
    });
  }

  deteleToolData(toolnme) {
    Swal.fire({
      title: '',
      html: '<h6>Are you sure you want to delete?</h6>',
      showCancelButton: true,
      confirmButtonColor: '#FFE600',
      cancelButtonColor: '#FFFFF',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No ',
      reverseButtons: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        this.tooldetail = this.tooldetail.filter(e => e.TechnologyName !== toolnme);
      }
    });
  }
  submit() {
    if (this.isChecked === true) {
      this.tooldetail = [{
        IdService: this.IdService,
        TechnologyName: '',
        TechnologyDescription: '',
        DeepLink: '',
      }];
    }

    if (this.tooldetail.length === 0) {
      this.tooldetail = [{
        IdService: this.IdService,
        TechnologyName: '',
        TechnologyDescription: '',
        DeepLink: '',
      }];
    }
    const overallguidance = {
      IdService: this.IdService,
      GuidanceEytechnology: this.guidancetextarea === undefined ? '' : this.guidancetextarea
    };

    this.saveForm(this.tooldetail, overallguidance);
  }

  saveForm(detaildatas, overallguidance) {
    this.savedOneTime = true;
    const thisElement = this;
    // Logic to calculate the progress
    const progress = { title: 'EY Technology', progress: 0 };
    if (!this.isChecked) {
      progress.progress = this.tooldetail.filter(element => element.TechnologyName !== '').length > 0 ? 100 : 0; // find at least one technology
    } else if (this.isChecked) {
      progress.progress = 100; // No tool/asset(s) associated with this service was selected
    }
    this.updateProgress.emit(progress);
    // End  Logic to calculate the progress
    Swal.fire({
      title: '',
      html: '<i class="material-icons material-spin material-2x">sync</i>',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen(this) {
        const promise = new Promise<any>((resolve) => {
          thisElement.eytechnologyservice.insertTooldetail(detaildatas)
            .subscribe(
              (data: any) => {
                if (data.message === 'OK') {
                  thisElement.eytechnologyservice.insertTooldetailguidance(overallguidance)
                    .subscribe((datas: any) => {
                      if (datas.message === 'OK') {
                        const result = JSON.parse(data.value);
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
}

