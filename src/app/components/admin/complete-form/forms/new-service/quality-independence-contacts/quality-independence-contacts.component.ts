import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ContactService } from '../../../../../../providers/provider.index';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { LocationFilterNode } from '../../../../../../models/model.index';

@Component({
  selector: 'app-quality-independence-contacts',
  templateUrl: './quality-independence-contacts.component.html',
  styleUrls: ['./quality-independence-contacts.component.scss']
})
export class QualityIndependenceContactsComponent implements OnInit, OnChanges {
  // references
  @ViewChild('contactTitle', { static: false }) contactTitle: ElementRef;
  @ViewChild('url', { static: false }) url: ElementRef;
  @ViewChild('urlname', { static: false }) urlname: ElementRef;

  // input and output
  @Input() active: any;
  @Input() IdService: any;
  @Input() tree: LocationFilterNode[] = [];
  @Input() locationsSaved: any = [];
  @Input() enableLocal: boolean = false;
  @Input() countryList: Array<any> = [];
  @Input() qualityContactsGlobal: any; // update variables
  @Input() qualityContactsLocal: any; // update variables
  @Input() readonly: any;

  @Output() updateProgress: EventEmitter<any>;
  @Output() getQualityContact: EventEmitter<any>;

  // component variables
  qualityContact = [];
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

  constructor(private contacts: ContactService, private cdRef: ChangeDetectorRef) {
    this.updateProgress = new EventEmitter(); // initialize event to emit - OUTPUT
    this.getQualityContact = new EventEmitter();
  }

  ngOnInit() { }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'qualityContactsGlobal': { // Get qualityContactsGlobal object from database
            if (this.qualityContactsGlobal.length > 0 ) { // Validate if the object bring data
              this.initializeVariablesGlobal(this.qualityContactsGlobal);
              this.savedOneTime = true;
            }
            this.loadingToGetSavedData();
          }
                                        break;
          case 'qualityContactsLocal': { // Get qualityContactsLocal object from database
            if (this.qualityContactsLocal.length > 0 && this.countryList.length > 0  ) { // Validate if the object bring data
              this.initializeVariablesLocal(this.qualityContactsLocal);
              this.savedOneTime = true;
            }
            this.loadingToGetSavedData();
          }
                                       break;
          case 'countryList':
            if (this.countryList.length > 0) {
              this.initializeVariablesLocal(this.qualityContactsLocal);
              this.loadingToGetSavedData();
            }
            break;
        }
      }
    }
  }
  initializeVariablesGlobal(global) { // when the list of countries is load, go to full each variable to display tables inside the tree and global part.
    if (global.length > 0) { // Global piece
      this.qualityContact = global.filter(e => e.Url === '');
      this.orgContact = global.filter(e => e.Url !== '');
      this.savedOneTime = true;
    }
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
  }
  addContact() { // Function to add a new contact and create a new row in the contacts global table
    if (this.employee.FullName && this.contactTitle.nativeElement.value !== '') {
      const exists = this.qualityContact.filter(e => e.Name === this.employee.FullName);
      if (this.employee.FullName) {
        if (exists.length === 0) {
          const temp = {
            IdService: this.IdService,
            IdContacts: null,
            IdQualityContacts: null,
            Name: this.employee.FullName,
            Title: this.contactTitle.nativeElement.value,
            Mail: this.employee.Email === null ? '' : this.employee.Email,
            Url: '',
            Location: '',
            Order: this.qualityContact.length + 1,
            IdserviceCountry: null,
            countryCode: 'GLB',
            region: '',
            isLocal: false
          };
          this.qualityContact.push(temp);
          this.employee = [];
          this.clearEmployee = true;
          this.contactTitle.nativeElement.value = '';
          this.ArrayOrder = Array.from(Array(this.qualityContact.length)).map((e, i) => i + 1);
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
          IdQualityContacts: null,
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
      if (result.value) { // Find the element that the system need to remove and re organize all previous qualityContact.
        this.qualityContact = this.qualityContact.filter(e => e.Name !== contact).map((e, i) => ({ ...e, Order: i + 1 }));
        this.ArrayOrder = Array.from(Array(this.qualityContact.length)).map((e, i) => i + 1);  // Rebuild array of positions (ArrayOrder)
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

  submit() { // Function to create a template to save data in database
    this.savedOneTime = true;
    const thisElement = this;
    if (this.qualityContact.length > 0 || this.orgContact.length > 0) {
      const progress = { title: 'Quality / Indep. Contacts', progress: 100 };
      let completeContacts = [].concat(this.qualityContact, this.orgContact);
      completeContacts = completeContacts.map(item => ({...item, IdService: this.IdService }));
       // If exist local contacts (contact and url) add those record in completeContacts array
      if (this.nodeContacts.length > 0 ) {
        this.nodeContacts.map(e => {
          if (e.contact.length > 0) {
            if (e.level === 2) { // region node
              if (this.locationsSaved.map(l => l.Region).includes(e.name)) {
                const region = e.contact.map(contact => ({
                  IdService: contact.IdService,
                  IdContacts: null,
                  IdQualityContacts: null,
                  Name: contact.Name,
                  Title: contact.Title,
                  Mail: contact.Mail,
                  Url: contact.Url,
                  Location: contact.Location,
                  Order: contact.Order,
                  IdserviceCountry: null,
                  countryCode: '',
                  isLocal: false,
                  region: e.name
                }));
                completeContacts = [].concat(completeContacts, region);
              }
            } else if (e.level === 3) { // Location node
              const countryCode = this.countryList.filter(c => c.countryName === e.name)[0].countryCode;
              if (this.locationsSaved.map(l => l.CountryCode).includes(countryCode)) {
                const location = e.contact.map(contact => ({
                  IdService: contact.IdService,
                  IdContacts: null,
                  IdQualityContacts: null,
                  Name: contact.Name,
                  Title: contact.Title,
                  Mail: contact.Mail,
                  Url: contact.Url,
                  Location: contact.Location,
                  Order: contact.Order,
                  IdserviceCountry: null,
                  countryCode: this.countryList.filter(c => c.countryName === e.name)[0].countryCode,
                  isLocal: true,
                  region: this.countryList.filter(c => c.countryName === e.name)[0].region
                }));
                completeContacts = [].concat(completeContacts, location);
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
            thisElement.contacts.addQualityIndependenceContact(completeContacts).subscribe(
              (data: any) => {
                if (data.message === 'OK') {
                  thisElement.updateProgress.emit(progress);
                  Swal.close();
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
          this.qualityContact = [];
          this.orgContact = [];
          this.nodeContacts = []; // Clear node Tree
          this.clearTree = true; // Clear Tree
        } else {
          this.getQualityContact.emit();
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
    const replace = this.qualityContact.find(element => element.Order === contact.Order && element.Name !== contact.Name);
    if (replace) {replace.Order = this.tempOrderContact;}
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
