import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {}
  
  redirectSystemSetup = () => this.router.navigate(['/system-setup']);
  redirectStandardContent = () => this.router.navigate(['/standard-content']);
  redirectUserAccess = () => this.router.navigate(['/user-access']);

}
