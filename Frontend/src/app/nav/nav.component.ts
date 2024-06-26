import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { JobFilterService } from '../job-filter.service';
import { SocketIOService } from '../socket-io.service';
import { CommonModule } from '@angular/common';
import { UserDataService } from '../user-data.service';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import {Toast} from 'bootstrap'

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit, AfterViewInit {


  showNotif: boolean = false;
  showSetting: boolean = false;
  notifNbr: number = 0;
  notifications: any[] = ["rached souihiapply for WEB DEVELOPER that you've posted","rached souihi apply for WEB DEVELOPER that you've posted","rached souihiapply for WEB DEVELOPER that you've posted","rached souihiapply for WEB DEVELOPER that you've posted"];
  jobFilterArray: any;
  userData: any;

  navHeight!: number;





  
  //@ViewChild('toast', {static: true}) toastElem!:ElementRef;

  @ViewChild('nav') navComp!:ElementRef;
  constructor(private cdr: ChangeDetectorRef, private jobFilterService: JobFilterService, private socketService: SocketIOService, private userDataService: UserDataService, private router: Router, private LoginService: LoginService){
    //Get user data from the userDataService
    userDataService.$userData.subscribe(data => {
      this.userData = data
    })

    



  }


  
  

  ngOnInit(): void {
    this.jobFilterService.jobFilters$.subscribe(jobFilterArray => {
      this.jobFilterArray =jobFilterArray;
    })
    
  }

  ngAfterViewInit(): void{
    this.navHeight = this.navComp.nativeElement.offsetHeight;
    

  }

 


  setShowSetting(): void{
    this.showSetting = !this.showSetting
    this.showNotif = false
  }
  setShowNotif(): void{
    this.showNotif = !this.showNotif
    this.showSetting = false
  }
  setNotif(): void{
    this.notifNbr++;
    const notifSound = new Audio("/assets/notif.mp3")
    notifSound.play();
    
  }

  someoneApply: any = this.socketService.on("someoneApply").subscribe(data => {
    this.notifications.push(`${data.firstname + " " + data.lastname + "apply for " + data.jobTitle +" that you've posted"}`)
    
    this.setNotif()
    
  })

  updateJobFilterService(creteria: string, event: any): void{
    this.jobFilterService.updateJobFilters({...this.jobFilterArray, [creteria]: event.target.value})
    
  }


  viewSubmittedCandidacy(): void{
    this.router.navigate(['job-portal/submitted-candidacy'])

  }
  




  logout(): void{
    this.userDataService.updateUserData({userId: this.userData.userId, isLoggedIn: false })
    
    this.socketService.emitLogOutEvent(this.userData.userId)
    this.LoginService.logout(this.userData)
    
    
  }

  


  viewPostedJobOffers(): void{
    this.router.navigate(['job-portal/posted-job-offers'])
  }

  viewApplicationsHistory(): void{
    this.router.navigate(['job-portal/applications'])


  }

}


