import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-standard-delivery',
  templateUrl: './standard-delivery.component.html',
  styleUrls: ['./standard-delivery.component.scss']
})
export class StandardDeliveryComponent implements OnInit {
  staticArray = [1, 2, 3];
  constructor() { }

  ngOnInit() {
  }

}
