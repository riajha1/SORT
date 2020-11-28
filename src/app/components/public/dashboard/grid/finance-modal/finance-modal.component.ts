import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-finance-modal',
  templateUrl: './finance-modal.component.html',
  styleUrls: []
})
export class FinanceModalComponent implements OnInit {
  constructor(public activeModal: NgbActiveModal) {}
  @Input() data: any;
  ngOnInit() {
  }
}
