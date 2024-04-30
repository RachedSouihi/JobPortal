import { ChangeDetectorRef, Component } from '@angular/core';
import { UserDataService } from '../user-data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-applicant-info',
  standalone: true,
  imports: [],
  templateUrl: './applicant-info.component.html',
  styleUrl: './applicant-info.component.css'
})
export class ApplicantInfoComponent {


  userData: any

  applicantInfo: any;


  constructor(private UserDataService: UserDataService, ActivatedRoute: ActivatedRoute,private cdr: ChangeDetectorRef){
    UserDataService.$userData.subscribe(userData => {
      this.userData = userData;
      console.log("User data from applicant UI: ", userData)
    })

    ActivatedRoute.paramMap.subscribe((params: any) => {
      const applicantId = Number.parseInt(params.get('applicantId'))  
      console.log("ApplicantId: " + applicantId)

      this.applicantInfo = this.userData.applicants.find((application: any) => application.userId === applicantId);

      cdr.detectChanges()
      
    })



  }

}
