import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../../src/environments/environment';

@Component({
  selector: 'app-modal-contact',
  templateUrl: './modal-contact.component.html',
  styleUrls: ['./modal-contact.component.scss']
})
export class ModalContactComponent implements OnInit {
  @Input() public contacts: any;
  @Input() public contactsl: any;
  @Input() public contactQuality: any;
  localContactsl = [];
  globalContactsl;
  globalContactQuality;
  localContactQuality = [];
  defaultAvatarSrc: string = environment.assets + 'images/Avatar.png';

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.getContactsl();
    this.getContactQuality();
  }

  getContactsl() {
    this.globalContactsl = this.contactsl.filter(i => i.countryCode === 'GLB');
    this.localContactsl = this.contactsl.filter(i => i.countryCode !== 'GLB');
  }

  getContactQuality() {
    this.globalContactQuality = this.contactQuality.filter(i => i.countryCode === 'GLB');
    this.localContactQuality = this.contactQuality.filter(i => i.countryCode !== 'GLB');
  }
  setDefaultImagesrc = (event: any) => event.target.src = this.defaultAvatarSrc;
}
