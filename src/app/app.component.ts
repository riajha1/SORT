import { Component, OnInit, OnDestroy, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService, ConfigItemsService } from '../../src/app/providers/provider.index';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterContentChecked {
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  title = 'sort';
  idleTime: any;

  subscriptionUserLoginStatus: Subscription;
  showImpersonationBar: boolean = true;

  constructor(private userService: UserService,
              private config: ConfigItemsService,
              private idle: Idle,
              private keepalive: Keepalive,
              private router: Router,
              private modalService: NgbModal,
              private changeDetector: ChangeDetectorRef) {
  }

  ngOnInit(): void {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // close all open modals
        this.modalService.dismissAll();
      }
    });

    this.getTokenRelation();
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData.IdleTime !== undefined) {
      this.idleUser(userData.IdleTime);
    } else {
      this.userService.getUserIdleTime().subscribe(result => {
        this.idleTime = result;
        this.idleUser(this.idleTime);
      });
    }

    if (this.idleState === 'Not started.') {
      this.reset();
    }
    this.subscriptionUserLoginStatus = this.userService.userLoginStatusChanged.subscribe(status => {
      this.showImpersonationBar = status;
    });
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptionUserLoginStatus.unsubscribe();
  }

  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;

    // console.log('state', this.idleState);
  }

  idleUser(idleTime: number) {
    // sets an idle timeout of 5 seconds, for testing purposes.
    this.idle.setIdle(idleTime);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(1);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.';
      this.reset();
    });

    // console.log('state', this.idleState);
    this.idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      // console.log('state', this.idleState);
      this.timedOut = true;
      this.reset();
      this.router.navigate(['/autologin']);
    });
    this.idle.onIdleStart.subscribe(() => {
      this.idleState = 'You\'ve gone idle!';
      // console.log('state', this.idleState);
    });
    this.idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will time out in ' + countdown + ' seconds!';
      // console.log('state', this.idleState);
    });

    // sets the ping interval to 15 seconds
    this.keepalive.interval(15);

    this.keepalive.onPing.subscribe(() => this.lastPing = new Date());
  }

  getTokenRelation = () => this.config.getTokenRelation().subscribe(e =>{});

}
