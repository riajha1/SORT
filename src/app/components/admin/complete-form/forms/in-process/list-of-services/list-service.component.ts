import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServicesService } from '../../../../../../providers/provider.index';

@Component({
  selector: 'app-list-services',
  templateUrl: './list-service.component.html',
  styleUrls: ['./list-service.component.scss']
})
export class ListServicesComponent implements OnInit {

  // Variables of the component
  listOfServices = [];
  loading: boolean = true;

  constructor(private router: Router, private servicesService: ServicesService) { }

  ngOnInit() {
    this.getAllServices();
  }

  redirectSAM = () => this.router.navigate(['/sam']);
  redirectPage = (idService) => this.router.navigate(['/sam', idService]);
  
  getAllServices() {
    this.servicesService.fetchCompleteListOfService().subscribe(
      (data: any) => {
        this.listOfServices = data;
        this.loading = false;
      },
      errorService => console.log('error endpoint getAllServices', errorService.message));
  }
}
