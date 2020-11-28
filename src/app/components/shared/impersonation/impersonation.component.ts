import { Component, OnInit, OnDestroy } from '@angular/core';
import { CountriesService, UserService, ServicesService } from '../../../providers/provider.index';
import { AuthService } from 'src/app/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';

const userData = JSON.parse(localStorage.getItem('userData'));

@Component({
  selector: 'app-impersonation',
  templateUrl: './impersonation.component.html',
  styleUrls: ['./impersonation.component.scss']
})
export class ImpersonationComponent implements OnInit, OnDestroy {
  userFullName = '';
  subscriptionUserName: Subscription;

  impersonateForm = new FormGroup({
    impersonateEmail: new FormControl('', [
      Validators.required,
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")])
  });

  constructor(private userService: UserService, private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  ngOnInit() {
    this.userFullName = this.userService.userfullname; // get the user full name stored

    if (userData !== null && this.userFullName === '') {
      // if the user session is available and the user reload the page, we need to take the location from the local  storage
      this.userFullName = userData.UserFullName;
      this.userService.saveUserFullName(userData.UserFullName);
    }

    this.subscriptionUserName = this.userService.userfullnameChanged.subscribe(userFullName => {
      this.userFullName = userFullName;
    });
  }

  ngOnDestroy(): void {
    this.subscriptionUserName.unsubscribe();
  }

  onImpersonate() {
    if (this.impersonateForm.valid) {
      this.authService.impersonateUser(this.impersonateForm.controls['impersonateEmail'].value).subscribe(
        resData => {
          if (resData == 'No user found for this email id') {
            alert(resData);
          }
          else {
            this.router.navigateByUrl('/home');
          }
        },
        error => {
          console.log('error', error);
        });
    } else { alert('Please enter valid email id'); }
  }
}
