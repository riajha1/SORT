import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
interface ValidateClient {
  successfull?: boolean;
  message?: string;
}
@Component({
  selector: 'app-modal',
  template: `<div class="modal-header">
        <h4 class="modal-title">Alert</h4>
        <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        {{ result ? result.message : '' }}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">OK</button>
      </div>`,
  styleUrls: []
})
export class ModalNavbarComponent  {
  @Input() public result: ValidateClient;
  constructor(public activeModal: NgbActiveModal) {}
}




