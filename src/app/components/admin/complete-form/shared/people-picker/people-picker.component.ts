import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, OnChanges, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserService } from '../../../../../providers/provider.index';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { tap } from 'rxjs/internal/operators/tap';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-people-picker',
  templateUrl: './people-picker.component.html',
  styleUrls: ['./people-picker.component.scss']
})
export class PeoplePickerComponent implements OnInit, OnChanges, AfterViewInit {
  // Input and Output
  @Input() readonly: any;
  @Input() ClearAfterSave = false;
  @Output() SetSelectedEmployee: EventEmitter<any>;
  @Output() RemoveEmployee: EventEmitter<any>;

  // references - autocomplete Angular material - https://material.angular.io/components/autocomplete/overview
  @ViewChild('typehead', { read: MatAutocompleteTrigger, static: false }) autoTrigger: MatAutocompleteTrigger;

  // component variables
  searchPeople = new FormControl();
  filteredPeople: any;
  isLoading: boolean = false;
  errorMsg: string;
  noFound: boolean = false;
  defaultAvatarSrc: string = environment.assets + 'images/Avatar.png';

  constructor(private userService: UserService) {
    // initialize event to emit - OUTPUT
    this.SetSelectedEmployee = new EventEmitter();
    this.RemoveEmployee = new EventEmitter();
  }
  ngOnInit() {
    this.disabled();
    // When the value of the searchPeople change the system detect it
    // and cancel the previous request and do a new one.
    this.searchPeople.valueChanges
      .pipe(
        debounceTime(500), // Delay 500 miliseconds
        distinctUntilChanged(),
        tap(() => {
          this.filteredPeople = [];
          this.isLoading = true;
          this.noFound = false;
        }),
        switchMap(stringName => {
          if (typeof (stringName) === 'string') { // validate value of searchPeople is a string
            return this.userService.fuzzyPeopleSearch(stringName);
          } else {
            this.isLoading = false;
            return [];
          }
        }))
      .subscribe(data => {
        this.isLoading = false;
        if (data.successfull === true) {
          const result = JSON.parse(data.value);
          if (result !== null) {
            if (result.length > 0) {
              this.filteredPeople = result;
            } else {
              this.filteredPeople = [];
              this.noFound = true;
            }
          } else {
            this.filteredPeople = [];
            this.noFound = true;
          }
        }
        // console.log(this.filteredPeople);
      }, (error) => {
        this.isLoading = false;
        this.filteredPeople = [];
        console.log('error', error);
      });
  }
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'ClearAfterSave': {
            if (this.ClearAfterSave) {
              this.removeEmployee();
            }
          }
        }
      }
    }
  }
  ngAfterViewInit() {
    this.autoTrigger.panelClosingActions.subscribe(x => {
      if (this.autoTrigger.activeOption) {
        this.searchPeople.setValue(this.autoTrigger.activeOption.value);
        this.selectedEmployee();
      }
    });
  }

  disabled() {
    if (this.readonly) {
      this.searchPeople.disable();
    } else {
      this.searchPeople.enable();
    }
  }
  displayFn = (employee: any): string => employee && employee.FullName ? employee.FullName : '';
  setDefaultImagesrc = (event: any) => event.target.src = this.defaultAvatarSrc; // If the img isn't avalible replace with default image
  selectedEmployee = () => this.SetSelectedEmployee.emit(this.searchPeople.value); // Send to main component employee selected by the user
  removeEmployee = () => { // function to remove string in the searchPeople form
    this.searchPeople.reset();
    this.RemoveEmployee.emit(true);
  }
}
