import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {
  // Input and Output
  @Input() progress: any;
  @Input() title: any;
  @Input() subtitle: any;
  @Input() active: any;
  @Output () activeTab: EventEmitter<any>;
  constructor() {
    this.activeTab = new EventEmitter(); // initialize event to emit - OUTPUT
  }

  ngOnInit() {}
  tabActive = (e) => this.activeTab.emit(e);  // Function to active and desactive tabs
}
