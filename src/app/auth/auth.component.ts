import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})

export class AuthComponent implements OnInit {
    returnUrl: string;
    constructor( private authService: AuthService,
                 private router: Router,
                 private activatedRoute: ActivatedRoute) {}
    ngOnInit() {
        this.returnUrl = this.activatedRoute.snapshot.queryParams.returnUrl || '/';
        if (localStorage.getItem('userData') !== null) {
            // Sort already has the credentials
            const avalibleToken = this.authService.validateToken();
            if (avalibleToken === null) {
                this.Onsignup();
            }
        } else {
            this.Onsignup();
        }
    }
    Onsignup() {
    this.authService.getAuthentication().subscribe(
        resData => {
            if (this.returnUrl === '/') {
                this.router.navigate(['/home']);
            } else {
                this.router.navigateByUrl(this.returnUrl);
            }
            return resData;
        },
        error => {
            console.log('error', error);
        });
        }
}
