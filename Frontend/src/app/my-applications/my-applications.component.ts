import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import { UserDataService } from '../user-data.service';
import { SocketIOService } from '../socket-io.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, NavComponent],
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.css'
})
export class MyApplicationsComponent {
  userData: any
  start_pagination: number = 1;
  current_pag_nbr: number = 1;





  /* [
    {
      "jobTitle": "Software Engineer",
      "companyName": "Tech Innovators",
      "timestamp": "2024-03-23T16:30:00Z"
    },
    {
      "jobTitle": "Data Analyst",
      "companyName": "Data Insights Co.",
      "timestamp": "2024-03-23T16:35:00Z"
    },
    {
      "jobTitle": "Product Manager",
      "companyName": "InnovateCorp",
      "timestamp": "2024-03-23T16:40:00Z"
    },
    {
      "jobTitle": "UX Designer",
      "companyName": "Creative Solutions",
      "timestamp": "2024-03-23T16:45:00Z"
    },
    {
      "jobTitle": "Marketing Specialist",
      "companyName": "Digital Marketing Agency",
      "timestamp": "2024-03-23T16:50:00Z"
    },
    {
      "jobTitle": "Financial Analyst",
      "companyName": "Investment Bank",
      "timestamp": "2024-03-23T16:55:00Z"
    },
    {
      "jobTitle": "Network Administrator",
      "companyName": "Tech Networks",
      "timestamp": "2024-03-23T17:00:00Z"
    },
    {
      "jobTitle": "Graphic Designer",
      "companyName": "Creative Studio",
      "timestamp": "2024-03-23T17:05:00Z"
    },
    {
      "jobTitle": "HR Manager",
      "companyName": "Human Resources Inc.",
      "timestamp": "2024-03-23T17:10:00Z"
    },
    {
      "jobTitle": "Sales Representative",
      "companyName": "Sales Solutions",
      "timestamp": "2024-03-23T17:15:00Z"
    },
    {
      "jobTitle": "Quality Assurance Engineer",
      "companyName": "Software Testing Labs",
      "timestamp": "2024-03-23T17:20:00Z"
    },
    {
      "jobTitle": "Content Writer",
      "companyName": "Content Creators",
      "timestamp": "2024-03-23T17:25:00Z"
    },
    {
      "jobTitle": "Project Manager",
      "companyName": "Project Management Inc.",
      "timestamp": "2024-03-23T17:30:00Z"
    },
    {
      "jobTitle": "Business Analyst",
      "companyName": "Business Consulting Group",
      "timestamp": "2024-03-23T17:35:00Z"
    },
    {
      "jobTitle": "UI Developer",
      "companyName": "Web Solutions",
      "timestamp": "2024-03-23T17:40:00Z"
    },
    {
      "jobTitle": "Operations Manager",
      "companyName": "Logistics Services",
      "timestamp": "2024-03-23T17:45:00Z"
    },
    {
      "jobTitle": "Database Administrator",
      "companyName": "Database Solutions",
      "timestamp": "2024-03-23T17:50:00Z"
    },
    {
      "jobTitle": "Social Media Manager",
      "companyName": "Social Media Agency",
      "timestamp": "2024-03-23T17:55:00Z"
    },
    {
      "jobTitle": "Technical Support Specialist",
      "companyName": "Tech Support Inc.",
      "timestamp": "2024-03-23T18:00:00Z"
    },
    {
      "jobTitle": "Content Strategist",
      "companyName": "Digital Content Strategy",
      "timestamp": "2024-03-23T18:05:00Z"
    }
  ]*/


  updateUserData(candidacy: any[]): void {
    this.userData.candidacy = candidacy

    this.UserDataService.updateUserData(this.userData)
    console.log("cons data: ", this.userData)

    this.cdr.detectChanges()


  }


  constructor(private UserDataService: UserDataService, private SocketService: SocketIOService, private router: Router, private location: Location, private cdr: ChangeDetectorRef) {

    this.UserDataService.$userData.subscribe(userData => {
      this.userData = userData
      SocketService.emit('join', this.userData.userId)

    })


    fetch(`http://127.0.0.1:3001/getSubmittedOffer?userId=${this.userData.userId}`)
      .then(response => response.json())
      .then(response => this.updateUserData(response.data))
      .catch(err => console.log(err.message))

    






  }



  editCandidacy(submitted_candidacy: any): void {
    const url = this.router.navigate([`job-portal/edit/${submitted_candidacy.userId}/${submitted_candidacy.offerId}/${submitted_candidacy.jobTitle}`]).toString()


  }

  candidacyDeletedSuccessfully(offerId: number, hiring_mgr_id: number): void {
    alert('Candidacy deleted successfully')
    const candidacyPK = {
      "userId": this.userData.userId,
      "offerId": offerId,
      "hiring_mgr_id": hiring_mgr_id,
    }
    this.SocketService.emit('candidacyDeleted', candidacyPK)

  }

  deleteCandidacy(offerId: number, hiring_mgr_id: number): void {
    fetch('http://127.0.0.1:3001/deleteCandidacy', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        "userId": this.userData.userId,
        "offerId": offerId,
      })
    }).then(response => response.json())
      .then(response => response.success ? this.candidacyDeletedSuccessfully(offerId, hiring_mgr_id) : alert('Error when deleting candidacy, please try again!'))






  }

  candidacyDeleted: any = this.SocketService.on('candidacyDeletedSeekerJob').subscribe(offerId => {


    this.userData = { ...this.userData, candidacy: this.userData.candidacy.filter((c: any) => c.offerId != offerId) }
    this.UserDataService.updateUserData(this.userData)

    this.cdr.detectChanges();
  })

  UserApplied: any = this.SocketService.on('IApplied').subscribe(candidacy => {
    if (!this.userData.candidacy.find((c: any) => c.userId == candidacy.userId && c.offerId == candidacy.offerId)) {
      this.userData.candidacy.push(candidacy)
      this.UserDataService.updateUserData(this.userData)
      this.cdr.detectChanges();
    }

  })


  OD: any = this.SocketService.on("offerDeleted").subscribe(offerId => {


    this.userData = { ...this.userData, candidacy: this.userData.candidacy.filter((c: any) => c.offerId != offerId) }
    this.UserDataService.updateUserData(this.userData)
    this.cdr.detectChanges();

  })



  goBackJobOfferPage(): void {
    this.router.navigate(['/job-offer'])
  }







}
