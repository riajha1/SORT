import { Component, Input, OnInit  } from '@angular/core';

@Component({
  selector: 'app-permissibility-icons',
  templateUrl: './permissibility-icons.component.html',
  styleUrls: ['./permissibility-icons.component.scss']
})
export class PermissibilityComponent implements OnInit {
  @Input() overWrite: any;
  @Input() restrictions: any;
  @Input() iconArray: any;
  defaultColor = '#2E2E38';
  constructor() { }

  ngOnInit() {
  }

}
