import { Component, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/providers/provider.index';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  urlMail = '';
  urlContacts = '';
  constructor(private serviceService: ServiceService) { }

  ngOnInit() {
    this.getStandardText();
  }
  getStandardText() { // help text to each section
    this.serviceService.getStandardText().subscribe(
      (data: any) => {
        if (data) {
          data.map(e => {
            switch (e.Name) {
              case 'SORT Support':
                this.urlMail = `mailto:${e.Value}?subject=Send Feedback`;
                break;
              case 'Contacts':
                this.urlContacts = e.Value;
                break;
              default:
                break;
            }
          });
        }
      },
      errorService => {
        console.log('error endpoint', errorService.message);
      }
    );
  }
}
