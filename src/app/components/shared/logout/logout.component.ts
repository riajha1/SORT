import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../providers/provider.index';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private userService: UserService) { }

  ngOnInit() {
    localStorage.removeItem('userData');
    localStorage.removeItem('locationSelected');
    this.userService.saveuserLoginStatus(false);
  }
}
