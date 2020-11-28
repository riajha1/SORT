import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-conflicts-consideration',
  templateUrl: './conflicts-consideration.component.html',
  styleUrls: ['./conflicts-consideration.component.scss']
})
export class ConflictsConsiderationComponent {
  @Input() public conflicts: any;
  @Input() public conflictsDelivery: any;
  constructor() { }
}
