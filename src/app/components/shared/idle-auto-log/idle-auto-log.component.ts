import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/providers/provider.index';

@Component({
  selector: 'app-idle-auto-log',
  templateUrl: './idle-auto-log.component.html',
  styleUrls: ['./idle-auto-log.component.scss']
})
export class IdleAutoLogComponent implements OnInit {

  constructor(private userService: UserService) { }

  ngOnInit() {
    localStorage.clear();
    this.userService.saveuserLoginStatus(false);
  }
}
