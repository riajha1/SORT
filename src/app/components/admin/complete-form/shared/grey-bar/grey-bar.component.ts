import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ServiceStatusModel } from 'src/app/models/model/serviceStatus.model';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EditServiceService, ServiceStatusService } from 'src/app/providers/provider.index';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';


@Component({
  selector: 'app-grey-bar',
  templateUrl: './grey-bar.component.html',
  styleUrls: ['./grey-bar.component.scss']
})
export class GreyBarComponent implements OnInit {
  loadingFavorites: boolean = false;
  // Input and Output
  @Input() greyBarData: any;
  @Input() showEditIcon: any;
  @Output() valueChange = new EventEmitter();
  // structure of service data
  serviceStatusList: Array<ServiceStatusModel>;
  selectedStatus: ServiceStatusModel;

  modalRef: NgbModalRef;
  constructor(private serviceStatusService: ServiceStatusService,
              private modalService: NgbModal,
              private editService: EditServiceService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    this.serviceStatusList = new Array<ServiceStatusModel>();
    this.selectedStatus = new ServiceStatusModel();
    // Force to reload the same url
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.router.navigated = false);

    // this.activatedRoute.params.subscribe(params => this.serviceId = params.id);

  }
  ngOnInit() {
    this.getDropdpown();
  }

  duplicateService(idService: any) {
    if (this.selectedStatus.BusinessName !== undefined) {
      this.valueChange.emit(true);
      this.editService.editService(idService, this.selectedStatus.BusinessName).subscribe((data) => {
        this.router.navigate(['/sam', data.IdServiceParent]);
        this.valueChange.emit(false);
      });
    }
  }

  getDropdpown() {
    this.serviceStatusService.getDropdownActive().subscribe((data) => {
      this.serviceStatusList = data;
    });
  }
  openModal = (content: any) => this.modalRef = this.modalService.open(content, { backdrop: 'static', size: 'lg' });
}
