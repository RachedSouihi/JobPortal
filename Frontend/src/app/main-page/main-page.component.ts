import { ChangeDetectorRef, Component } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import { RouterOutlet } from '@angular/router';
import { SocketIOService } from '../socket-io.service';
import { UserDataService } from '../user-data.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [RouterOutlet ,NavComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {

  userData: any;

  constructor(private socketService: SocketIOService, private userDataService: UserDataService, private cdr: ChangeDetectorRef){
    userDataService.$userData.subscribe(userData => {
      this.userData = userData
      socketService.emit('join', this.userData.userId)

    })


  }







  newCandidacy: any = this.socketService.on('someoneApply').subscribe(applicant => {applicant
    if ("applicants" in this.userData && !this.userData.applicants.find((c: any) => c.userId == applicant.userId && c.offerId == applicant.offerId )) {
      this.userData.applicants.push(applicant)
      this.userDataService.updateUserData(this.userData)
      this.cdr.detectChanges();
    }

    

  })

  UserApplied: any = this.socketService.on('IApplied').subscribe(candidacy => {
    if ("candidacy" in this.userData && !this.userData.candidacy.find((c: any) => c.userId == candidacy.userId && c.offerId == candidacy.offerId)) {

      this.userData.candidacy.push(candidacy)
      this.userDataService.updateUserData(this.userData)
      this.cdr.detectChanges();
    }

  })

  CandidacyEdited: any = this.socketService.on('candidacyEdited').subscribe(candidacy => {
    alert("candidacy edited")
    if('applicants' in this.userData){
      this.userData = {...this.userData, 'applicants': this.userData.applicants.filter((c: any) => c.userId != candidacy.userId)}
      this.userData.applicants.push(candidacy);
      this.userDataService.updateUserData(this.userData)
      this.cdr.detectChanges();
    }
  })





  OD: any = this.socketService.on("offerDeleted").subscribe(offerId => {

    if (this.userData.candidacy) {

      this.userData = { ...this.userData, candidacy: this.userData.candidacy.filter((c: any) => c.offerId != offerId) }
      this.userDataService.updateUserData(this.userData)
      this.cdr.detectChanges();
    }
  })

  candidacyDeletedForSeekerJob: any = this.socketService.on('candidacyDeletedSeekerJob').subscribe(offerId => {

    if (this.userData.candidacy) {
      this.userData = { ...this.userData, candidacy: this.userData.candidacy.filter((c: any) => c.offerId != offerId) }
      this.userDataService.updateUserData(this.userData)

      this.cdr.detectChanges();
    }
  })



  candidacyDeletedForHiringManager: any = this.socketService.on('candidacyDeletedHiringManager').subscribe(data => {
    if(this.userData.applicants){
      this.userData = { ...this.userData, applicants: this.userData.applicants.filter((a: any) => a.userId != data.userId && a.offerId != data.offerId) }
      this.userDataService.updateUserData(this.userData)
    
    this.cdr.detectChanges();
    }

  })



  




}
