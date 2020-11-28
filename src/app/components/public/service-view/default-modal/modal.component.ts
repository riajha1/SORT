import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-service',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalServiceComponent implements OnInit {
  @Input() public prolog: string;
  @Input() public title: string;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

}
