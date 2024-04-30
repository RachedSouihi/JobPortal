import { ChangeDetectorRef, Component } from '@angular/core';
import { UserDataService } from '../user-data.service';
import { SocketIOService } from '../socket-io.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Console } from 'node:console';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [],
  templateUrl: './applicants.component.html',
  styleUrl: './applicants.component.css'
})
export class ApplicantsComponent {


  userData: any;

  applicationsToDisplayed: any;

  offerIdSelected: any;
  jobTitle: any;

  filter: any;



  updateUserData(field: any, data: any[]): void {

    this.userData[field] = data
    this.UserDataService.updateUserData(this.userData);
    if(field == "applicants") this.applicationsToDisplayed = this.userData.applicants;
    

    this.cdr.detectChanges();

  }

  constructor(private UserDataService: UserDataService, private SocketService: SocketIOService, private cdr: ChangeDetectorRef, private router: Router, activatedRoute: ActivatedRoute) {
    UserDataService.$userData.subscribe(userData => {
      this.userData = userData;
      this.applicationsToDisplayed = userData.applicants
      
    })
    alert('constructor')
    activatedRoute.paramMap.subscribe(params => {
      if(params.get('offerId')){
        this.offerIdSelected = params.get('offerId');
        this.jobTitle = params.get('jobTitle');
        this.filterApplications();

      }
    })
    
      fetch(`http://127.0.0.1:3001/getAllPostedJobOffers?hiringManagerId=${this.userData.userId}`)
        .then(response => response.json())
        .then(response => this.updateUserData("postedJobOffers", response.jobOffers))
        .catch(err => console.log(err.message))

    

      fetch(`http://127.0.0.1:3001/getAllApplicants?hiringManagerId=${this.userData.userId}`)
        .then(response => response.json())
        .then(response => this.updateUserData("applicants", response.data))
        .catch(err => console.log(err.message))
    


    

  }









  viewCV(): void{
  // Assuming cvData is your ArrayBuffer or Buffer containing CV data
const cvBlob = new Blob([this.userData.applicants[0].cv], { type: 'application/pdf' }); // Adjust the MIME type accordingly

// Create a URL for the Blob
const cvUrl = URL.createObjectURL(cvBlob);

// Create an anchor element for download
const downloadLink = document.createElement('a');
downloadLink.href = cvUrl;
downloadLink.download = 'cv_filename.pdf'; // Set the desired file name and extension

// Append the anchor to the document or a specific container
document.body.appendChild(downloadLink);

// Trigger the download
downloadLink.click();

// Clean up by revoking the URL after download
URL.revokeObjectURL(cvUrl);




  }

  viewApplicantInfo(applicantId: number): void{
    this.router.navigate([`/job-portal/applicant/${applicantId}`])
  }


  handleChange(event: any): void{
    this.offerIdSelected = event.target.value;
    this.jobTitle = this.userData.postedJobOffers.find((job_offer: any) => job_offer.offerId == this.offerIdSelected).jobTitle
    this.filterApplications()


  }
  filterApplications(): void{
    this.applicationsToDisplayed = this.userData.applicants.filter((application: any) => application.offerId == this.offerIdSelected)
  }

}
