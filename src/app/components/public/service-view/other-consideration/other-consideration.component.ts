import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-other-consideration',
  templateUrl: './other-consideration.component.html',
  styleUrls: ['./other-consideration.component.scss']
})
export class OtherConsiderationComponent {
  @Input() public otherConsideration: any;
  constructor() { }
}
