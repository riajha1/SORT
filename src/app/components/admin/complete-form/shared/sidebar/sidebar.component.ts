import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  // Input and Output
  @Input() sidebar: any;
  @Input() label: string = '';
  @Output () activeTabCompleteForm: EventEmitter<any>;
 scrollbarOptions = { axis: 'y', theme: 'minimal'};
  constructor() {
    this.activeTabCompleteForm = new EventEmitter(); // initialize event to emit - OUTPUT
  }

  ngOnInit() {}

  activeTab = (e) => this.activeTabCompleteForm.emit(e); // Function to active and desactive form tabs
}
