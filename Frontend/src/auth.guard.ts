import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserDataService } from './app/user-data.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    userData: any;


    constructor(private router: Router, private UserDataService: UserDataService) {
        UserDataService.$userData.subscribe(userData => {
            this.userData = userData;
        })

    }

    canActivate(): boolean {
        if (this.userData.isLoggedIn) {
            return true; // Allow access to the route
        } else {
            this.router.navigate(['/login']); // Redirect to login page if not logged in
            return false;
        }
    }
}
