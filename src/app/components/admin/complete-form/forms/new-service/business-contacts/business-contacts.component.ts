import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ContactService } from '../../../../../../providers/provider.index';
import { LocationFilterNode } from 'src/app/models/model.index';

@Component({
  selector: 'app-business-contacts',
  templateUrl: './business-contacts.component.html',
  styleUrls: ['./business-contacts.component.scss']
})
export class BusinessContactsComponent implements OnInit, OnChanges {
  // references
  @ViewChild('contactTitle', {static: false}) contactTitle: ElementRef;
  @ViewChild('url', {static: false}) url: ElementRef;
  @ViewChild('urlname', {static: false}) urlname: ElementRef;

  // input and output
  @Input() active: any;
  @Input() IdService: any;
  @Input() tree: LocationFilterNode[] = [];
  @Input() locationsSaved: any = [];
  @Input() enableLocal: boolean = false;
  @Input() countryList: Array<any> = [];
  @Input() businessContactsGlobal: any; // update variables
  @Input() businessContactsLocal: any; // update variables
  @Input() readonly: any;

  @Output() updateProgress: EventEmitter<any>;
  @Output() getBusinessContact: EventEmitter<any>;


  // component variables
  businessContact = [];
  orgContact = [];
  tempOrderContact = -1;
  ArrayOrder: Array<number>;
  savedOneTime: boolean = false;

  // Local component variables
  nodeContacts: any = [];
  clearTree: boolean = false;
  forceTree: boolean = false;

 // people picker variables
  employee: any = [];
  clearEmployee = false;

  constructor( private contacts: ContactService, private cdRef: ChangeDetectorRef) {
    this.updateProgress = new EventEmitter(); // initialize event to emit - OUTPUT
    this.getBusinessContact = new EventEmitter();
  }

  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'businessContactsGlobal': { // Get businessContactsGlobal object from database
            if (this.businessContactsGlobal.length > 0 ) { // Validate if the object bring data
              this.initializeVariablesGlobal(this.businessContactsGlobal);
              this.savedOneTime = true;
            }
          }
                                         break;
          case 'businessContactsLocal': { // Get businessContactsLocal object from database
            if (this.businessContactsLocal.length > 0 && this.countryList.length > 0  ) { // Validate if the object bring data
              this.initializeVariablesLocal(this.businessContactsLocal);
              this.savedOneTime = true;
            }
          }
                                        break;
          case 'countryList':
            if (this.countryList.length > 0) {
              this.initializeVariablesLocal(this.businessContactsLocal);
            }
            break;
        }
      }
    }
  }
  initializeVariablesGlobal(global) { // when the list of countries is load, go to full each variable to display tables inside the tree and global part.
    if (global.length > 0) { // Global piece
      this.businessContact = global.filter(e => e.Url === '');
      this.orgContact = global.filter(e => e.Url !== '');
      this.savedOneTime = true;
    }
    this.loadingToGetSavedData();
  }
  initializeVariablesLocal(locations) { // when the list of countries is load, go to full each variable to display tables inside the tree and global part.
    if (this.countryList.length > 0) { // Local piece
      if (locations.length > 0) {
        const FinalLocations = locations.map(item => {
          if (item.level === 3) { // Tree use full name of country, Database only send countryCode, replace countryCode with countryName in name variable
            if (this.countryList.filter(c => c.countryCode === item.name).length > 0) {
              item.name = this.countryList.filter(c => c.countryCode === item.name)[0].countryName;
            }
          }
          return item;
        });
        this.nodeContacts = FinalLocations;
        this.forceTree = true;
        this.savedOneTime = true;
      }
    }
    this.loadingToGetSavedData();
  }
  addContact() { // Function to add a new contact and create a new row in the contacts global table
    if (this.employee.FullName && this.contactTitle.nativeElement.value !== '') {
      const exists = this.businessContact.filter(e => e.Name === this.employee.FullName);
      if (this.employee.FullName) {
        if (exists.length === 0) {
              const temp = {
                IdService: this.IdService,
                IdContacts: null,
                IdSolutionContacts: null,
                Name: this.employee.FullName,
                Title: this.contactTitle.nativeElement.value,
                Mail: this.employee.Email === null ? '' : this.employee.Email,
                Url: '',
                Location: '',
                Order: this.businessContact.length + 1,
                IdserviceCountry: null,
                countryCode: 'GLB',
                region: '',
                isLocal: false
              };
              this.businessContact.push(temp);
              this.employee = [];
              this.clearEmployee = true;
              this.contactTitle.nativeElement.value = '';
              this.ArrayOrder = Array.from(Array(this.businessContact.length)).map((e, i) => i + 1 );
        } else {
          this.employee = [];
          this.contactTitle.nativeElement.value = '';
          this.clearEmployee = true;
        }
      }
    }
  }
  addURL() { // Function to add a new URL and create a new row in the url global table
    if (this.url.nativeElement.value !== '' && this.urlname.nativeElement.value !== '') {
       // Verify if the url has a http or https protocol if it hasn't a protocol I add it
      const url = this.url.nativeElement.value.startsWith('http://') ? this.url.nativeElement.value :
      (this.url.nativeElement.value.startsWith('https://') ? this.url.nativeElement.value : 'http://' + this.url.nativeElement.value);
     /* Verify if that url is already in the array if that url exist just clean the form
      if it doesn't exist it is added to the orgContact's array */
      const exists = this.orgContact.filter(e => e.Url === url);
      if (exists.length === 0) {
        const temp = {
          IdService: this.IdService,
          IdContacts: null,
          IdSolutionContacts: null,
          Name: '',
          Title: '',
          Mail: '',
          Url: url,
          Location: this.urlname.nativeElement.value,
          Order: null,
          IdserviceCountry: null,
          countryCode: 'GLB',
          region: '',
          isLocal: false
        };
        this.orgContact.push(temp);
        this.url.nativeElement.value = '';
        this.urlname.nativeElement.value = '';
      } else {
        this.url.nativeElement.value = '';
        this.urlname.nativeElement.value = '';
      }
    }
  }
  removeContact(contact) { // functions to remove contact on the table
    Swal.fire({
      title: '',
      html: '<h6>Do you really want to delete? Click OK.</h6>',
      showCancelButton: true,
      confirmButtonColor: '#FFE600',
      cancelButtonColor: '#FFFFF',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel ',
      reverseButtons: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) { // Find the element that the system need to remove and re organize all previous businessContact.
        this.businessContact = this.businessContact.filter(e => e.Name !== contact).map((e, i) => ({...e, Order : i + 1}));
        this.ArrayOrder = Array.from(Array(this.businessContact.length)).map((e, i) => i + 1 );  // Rebuild array of positions (ArrayOrder)
      }
    });
  }
  removeURL(url) { // functions to remove an URL on the table
    Swal.fire({
      title: '',
      html: '<h6>Do you really want to delete? Click OK.</h6>',
      showCancelButton: true,
      confirmButtonColor: '#FFE600',
      cancelButtonColor: '#FFFFF',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel ',
      reverseButtons: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.value) {
        this.orgContact = this.orgContact.filter(e => e.Url !== url);
      }
    });
  }
  submit() {   // Function to create a template to save data in database
    this.savedOneTime = true;
    const thisElement = this;
    if (this.businessContact.length > 0 || this.orgContact.length > 0 ) {
      const progress = { title: 'Business Contacts', progress: 100 };
      // add progress function to save
      let completeContacts = [].concat(this.businessContact, this.orgContact);
      completeContacts = completeContacts.map(item => ({...item, IdService: this.IdService }));
      // If exist local contacts (contact and url) add those record in completeContacts array
      if (this.nodeContacts.length > 0 ) {
        this.nodeContacts.map(e => {
          if (e.contact.length > 0) {
            if (e.level === 2) { // region node
              if (this.locationsSaved.map(l => l.Region).includes(e.name)) {
                const region = e.contact.map(contact => ({
                  ...contact,
                  countryCode: '',
                  isLocal: false,
                  region: e.name
                }));
                completeContacts = [].concat(completeContacts, region);
              }
            } else if (e.level === 3) { // Location node
              if (this.countryList.filter(c => c.countryName === e.name).length > 0) {
                const countryCode = this.countryList.filter(c => c.countryName === e.name)[0].countryCode;
                if (this.locationsSaved.map(l => l.CountryCode).includes(countryCode)) {
                  const location = e.contact.map(contact => ({
                    ...contact,
                    countryCode: this.countryList.filter(c => c.countryName === e.name)[0].countryCode,
                    isLocal: true,
                    region: this.countryList.filter(c => c.countryName === e.name)[0].region
                  }));
                  completeContacts = [].concat(completeContacts, location);
                }
              }
            }
          }
        });
      }
      Swal.fire({
        title: '',
        html: '<i class="material-icons material-spin material-2x">sync</i>',
        allowOutsideClick: false,
        showConfirmButton: false,
        onOpen(this) {
          const promise = new Promise<any>((resolve, reject) => {
            thisElement.contacts.addBusinessContact(completeContacts).subscribe(
              (data: any) => {
                if (data.message === 'OK') {
                  Swal.close();
                  thisElement.updateProgress.emit(progress);
                  Swal.fire({
                    title: '',
                    icon: 'success',
                    html: '<h6>Successfully saved</h6>',
                    allowOutsideClick: false,
                    showConfirmButton: true,
                  });
                  resolve();
                } else if (data.message === 'Error') {
                  Swal.fire({
                    title: '',
                    icon: 'error',
                    html: '<h6>You need to create a record in Service Details.</h6>',
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
    } else {
      Swal.fire({
        title: '',
        icon: 'error',
        html: `<h6>At least one Global Quality/Independence Contact is mandatory whether it's an individual or an organization (URL).</h6>`,
        allowOutsideClick: false,
        showConfirmButton: true,
      });
    }
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
  cancelContact() { // remove all contacts if the user is agree
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
        if (!this.savedOneTime) {
          this.businessContact = [];
          this.orgContact = [];
          this.nodeContacts = []; // Clear node Tree
          this.clearTree = true; // Clear Tree
        } else {
          this.getBusinessContact.emit();
          this.loadingToGetSavedData(true);
        }
        // Clear forms
        this.employee = [];
        this.contactTitle.nativeElement.value = '';
        this.clearEmployee = true;
        this.url.nativeElement.value = '';
        this.urlname.nativeElement.value = '';
      }
    });
  }

  // custom functions
  updatePosition = (order: number) => this.tempOrderContact = order;
  onChangeOrder(contact) { // Function to update the position and re-organize contacts
    const replace = this.businessContact.find(element => element.Order === contact.Order && element.Name !== contact.Name);
    if (replace) { replace.Order = this.tempOrderContact;}
  }
  SetSelectedEmployee(employee) { // Function to get employee selected in the people picker
    this.clearEmployee = false;
    this.employee = employee;
  }
  RemoveEmployee(status) { // Function to remove employee selected in the people picker
    if (status) { this.employee = []; }
  }
  getContactsByNode(node) { // Function to get complete contacts in local tree
    const condition = this.nodeContacts.filter(e => e.level === node.level && e.name === node.name);
    if (condition.length === 0) {
       this.nodeContacts.push(node); // new node to store
    } else {
      condition[0].contact = node.contact;
    }
  }
  setClearFlag = (e) => { // Function to update flag to rebuild tree
    this.clearTree = false;
    this.cdRef.detectChanges();
  }
  setForceFlag = (e) => { // Function to update flag to force tree
    this.forceTree = false;
    this.cdRef.detectChanges();
  }
}
