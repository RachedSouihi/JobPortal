import { ChangeDetectorRef, Component } from '@angular/core';
import { UserDataService } from '../user-data.service';
import { SocketIOService } from '../socket-io.service';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [],
  templateUrl: './applicants.component.html',
  styleUrl: './applicants.component.css'
})
export class ApplicantsComponent {


  userData: any


  updateUserDate(applicants: any[]): void {

    this.userData.applicants = applicants
    this.UserDataService.updateUserData(this.userData)
    this.cdr.detectChanges();

  }

  constructor(private UserDataService: UserDataService, private SocketService: SocketIOService, private cdr: ChangeDetectorRef) {
    UserDataService.$userData.subscribe(userData => {
      this.userData = userData
    })


    if (!("applicants" in this.userData)) {
      fetch(`http://127.0.0.1:3001/getAllApplicants?hiringManagerId=${this.userData.userId}`)
        .then(response => response.json())
        .then(response => this.updateUserDate(response.data))
        .catch(err => console.log(err.message))
    }

  }



  candidacyDeleted: any = this.SocketService.on('candidacyDeletedHiringManager').subscribe(data => {
    if (this.userData.applicants) {

      this.userData = { ...this.userData, applicants: this.userData.applicants.filter((a: any) => a.userId != data.userId && a.offerId != data.offerId) }
      this.cdr.detectChanges();

      this.UserDataService.updateUserData(this.userData)
    }

  })



  newCandidacy: any = this.SocketService.on('someoneApply').subscribe(applicant => {
    if (!this.userData.applicants.find((c: any) => c.userId == applicant.userId && c.offerId == applicant.offerId)) {
      this.userData.applicants.push(applicant)
      this.UserDataService.updateUserData(this.userData)

    }
    this.cdr.detectChanges();


  })


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

}
