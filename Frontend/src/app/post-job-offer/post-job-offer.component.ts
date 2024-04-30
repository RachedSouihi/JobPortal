import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { UserDataService } from '../user-data.service';
import { SocketIOService } from '../socket-io.service';
import { ActivatedRoute, Route } from '@angular/router';


@Component({
  selector: 'app-post-job-offer',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './post-job-offer.component.html',
  styleUrl: './post-job-offer.component.css'
})
export class PostJobOfferComponent {

  offerId!: number
  userData: any;
  myForm: FormGroup;




  






  skills: any[] = [];
  skill: String = "";
  addSkills: boolean = false;



  
  

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef,private UserDataService: UserDataService, private activatedRoute: ActivatedRoute, private SocketService: SocketIOService){

    UserDataService.$userData.subscribe(userData => {
      this.userData = userData;
      console.log("UD FROM PJO: ", userData)
    })
    this.myForm = this.fb.group({
      "jobTitle": ["", [Validators.required]],
      "jobType": ["", [Validators.required]],
      "companyName": ["", [Validators.required]],
      "companyLocation": ["", [Validators.required]],
      "workingSchedule": ["", [Validators.required]],
      "employmentType": ["", [Validators.required]],
      "experience": ["", [Validators.required]],
      "salary": [""],
      "appDeadline": [null],
      "jobDesc": ["", [Validators.required]]

    })
    if(!this.isForPosting()){
      activatedRoute.paramMap.subscribe(params => {
        this.offerId = Number(params.get('offerId'))
      })
     
      fetch(`http://127.0.0.1:3001/getJobOffer?offerId=${this.offerId}`)
        .then(response => response.json())
        .then(response =>  this.setForm(response.jobOffer))
        .catch(err => console.log(err.message))



        

      
    }
 

  }

  JobPostedSuccessfully(offerId: number): void{
    this.SocketService.emit("newJobOffer", {...this.myForm.value, offerId: offerId, hiring_mgr_id: this.userData.userId});

  }

  setForm(jobOffer: any): void{
    console.log(jobOffer)
    this.myForm.patchValue({ 'jobTitle': jobOffer.jobTitle });
    this.myForm.patchValue({ 'jobType': jobOffer.jobType });
    this.myForm.patchValue({ 'companyName': jobOffer.companyName });
    this.myForm.patchValue({ 'companyLocation': jobOffer.companyLocation });
    this.myForm.patchValue({ 'workingSchedule': jobOffer.workingSchedule });
    this.myForm.patchValue({ 'employmentType': jobOffer.employmentType });
    this.myForm.patchValue({ 'experience': jobOffer.experience });
    this.myForm.patchValue({ 'salary': jobOffer.salary });
    this.myForm.patchValue({ 'appDeadline': jobOffer.appDeadline.slice(0, 10) });
    this.myForm.patchValue({ 'jobDesc': jobOffer.jobDesc });


    this.cdr.detectChanges()




  }



  postJobOffer(): void{
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

 
      fetch("http://127.0.0.1:3001/postOffer", {
        method: 'POST',

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({...this.myForm.value, hiring_mgr_id: this.userData.userId , timestamp: timestamp, skills: this.skills})
      }).then(response => response.json())
      .then(response => response.success ? this.JobPostedSuccessfully(response.offerId) : console.log(response.message))
    

  }
  jobOfferEditSuccessfully(): void{
    alert("jobOffer edited successfully")

  }

  editJobOffer(): void{
    fetch('http://127.0.0.1:3001/editJobOffer', {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({...this.myForm.value, offerId: this.offerId})
      
    })

    .then(response => response.json())
    .then(response => response.success && this.jobOfferEditSuccessfully())
  }


  setAddSkills(): void{
    this.addSkills = !this.addSkills;
  }

  handleInputSkill(event: any): void{
    this.skill = event.target.value;
  }

  addSkillToSelect(): void{
    if(this.skills.includes(this.skill)){
      alert("You've already made this")
    }else{
    this.skills.push(this.skill)
    this.skill = "";
    }


  }

  hideSkillWindow(): void{
    this.addSkills = false
  }


  isForPosting(): boolean{
    return this.activatedRoute.routeConfig?.path?.split('/')[0] !== 'edit-job-offer';

  }





}
