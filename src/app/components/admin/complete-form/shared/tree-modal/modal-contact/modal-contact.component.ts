import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2/dist/sweetalert2.js';
@Component({
  selector: 'app-modal-tree',
  templateUrl: './modal-contact.component.html',
  styleUrls: ['./modal-contact.component.scss']
})
export class ModalTreeComponent implements OnInit {
  @ViewChild('contactTitle', {static: false}) contactTitle: ElementRef;
  @ViewChild('url', {static: false}) url: ElementRef;
  @ViewChild('urlname', {static: false}) urlname: ElementRef;
  businessContact: any = [];
  orgContact: any = [];
  @Input() node: any;
  @Input() IdService: any;
  @Output() updateNode: EventEmitter<any>;
   // people picker
   clearEmployee = false;
   tempOrderContact = -1;
   // ArrayOrder: Array<number>; // order variable
   employee: any = [];
  constructor(public activeModal: NgbActiveModal) {
    this.updateNode = new EventEmitter();
   }

  ngOnInit() {
    this.businessContact = this.node.contact.filter(e => e.Url === '' && e.Name !== '');
    this.orgContact = this.node.contact.filter(e => e.Url !== '');
  }

   // people picker
   SetSelectedEmployee(employee) {
    this.clearEmployee = false;
    this.employee = employee;
  }
  RemoveEmployee(status) {
    if (status) {
      this.employee = [];
    }
  }

  addContact(node) {
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
                Order: 1, // this.businessContact.length + 1 - Order logic
                IdserviceCountry: null
              };
              this.businessContact.push(temp);
              const temp1 = {
                businessContact: [].concat(this.businessContact, this.orgContact),
                node
              };
              this.updateNode.emit(temp1);
              this.employee = [];
              this.clearEmployee = true;
              this.contactTitle.nativeElement.value = '';
        } else {
          this.employee = [];
          this.contactTitle.nativeElement.value = '';
          this.clearEmployee = true;
        }
      }
    }
  }
   // functions to remove contact on the table
   removeContact(contact, node) {
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
        // remove contact and re-order contacts
        this.businessContact = this.businessContact.filter(e => e.Name !== contact).map((e, i) => ({...e, Order : 1 // i + 1 - order logic
        }));
        const temp1 = {
          businessContact: [].concat(this.businessContact, this.orgContact),
          node
        };
        this.updateNode.emit(temp1);
      }
    });
  }

  addURL(node) {
    if (this.url.nativeElement.value !== '' && this.urlname.nativeElement.value !== '') {
      const url = this.url.nativeElement.value.startsWith('http://') ? this.url.nativeElement.value :
      (this.url.nativeElement.value.startsWith('https://') ? this.url.nativeElement.value : 'http://' + this.url.nativeElement.value);
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
          IdserviceCountry: null
        };
        this.orgContact.push(temp);
        const temp1 = {
          businessContact: [].concat(this.businessContact, this.orgContact),
          node
        };
        this.updateNode.emit(temp1);
        this.url.nativeElement.value = '';
        this.urlname.nativeElement.value = '';
      } else {
        this.url.nativeElement.value = '';
        this.urlname.nativeElement.value = '';
      }
    }
  }
  removeURL(url, node) {
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
        const temp1 = {
          businessContact: [].concat(this.businessContact, this.orgContact),
          node
        };
        this.updateNode.emit(temp1);
      }
    });
  }

}
