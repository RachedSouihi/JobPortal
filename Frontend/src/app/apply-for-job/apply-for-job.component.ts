import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocketIOService } from '../socket-io.service';
import { ActivatedRoute } from '@angular/router';
import { UserDataService } from '../user-data.service';

@Component({
  selector: 'app-apply-for-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-for-job.component.html',
  styleUrl: './apply-for-job.component.css'
})
export class ApplyForJobComponent {


  firstname: string = '';
  lastname: string = '';
  email: string = '';
  phone: string = '';
  governorate: string = '';
  applyForm: FormGroup;
  hiring_manager_id: any;
  offer_id: any;
  user_id: any;
  job: any = '';
  company: any = ''

  skill: String = ""
  skills: any = []
  //To open a little window to make user add skill
  openSkill: boolean = true;


  isForApplying: boolean = true;

  userData: any;

  constructor(private userDataService: UserDataService, fb: FormBuilder, private socketService: SocketIOService, private activatedRoute: ActivatedRoute, private cdr: ChangeDetectorRef) {
    activatedRoute.paramMap.subscribe(params => {
      this.hiring_manager_id = params.get('hiring_mgr_id');
      this.offer_id = params.get('offer_id')
      this.job = params.get('job')
      this.company = params.get('company')

      this.user_id = params.get('user_id')


    })
    userDataService.$userData.subscribe(userData => {
      this.userData = userData;

      socketService.emit('join', userData.userId);
    })



    if (activatedRoute.routeConfig?.path?.split('/')[0] === 'edit') {
      this.isForApplying = false;
      let candidacy: any;

      for (let i = 0; i < this.userData.candidacy.length; i++) {
        if (this.userData.candidacy[i].offerId == this.offer_id) {
          candidacy = this.userData.candidacy[i];
          break

        }



      }

      this.firstname = candidacy.firstname
      this.lastname = candidacy.lastname
      this.email = candidacy.email || ''
      this.governorate = candidacy.governorate
      this.phone = candidacy.phone;
      this.skills = candidacy.skills










      // const candidacy = this.userData.candidacy.filter(c => c.userId)

    } else {
      activatedRoute.paramMap.subscribe(p => console.log(p))
    }


    this.applyForm = fb.group({
      firstname: [this.firstname, [Validators.required]],
      lastname: [this.lastname, [Validators.required]],
      email: [this.email, [Validators.email, Validators.required]],
      governorate: [this.governorate],
      phone: [this.phone],
      cv: [null, [Validators.required]]


    })

  }


  getCV(event: any): void {
    if (event.target.files.length) {
      const cv = event.target.files[0];
      this.applyForm.controls['cv'].setValue(cv)
    }
  }
  JobOfferAppliedSuccessfully(data: any): void {
    this.socketService.socket.emit('IApplied', { ...data, 'cv': this.applyForm?.get('cv')?.value }, Number(this.hiring_manager_id))


    alert('Job applied successfully')
    /* const newUserData: any = {
       "userId": this.userData.userId,
       "firstname": this.userData.firstname,
       "lastname": this.userData.lastname,
       "email": this.userData.email,
       "password": this.userData.password,
       "hiring_manager": this.userData.hiring_manager,
       "isLoggedIn": this.userData.isLoggedIn,
       "phone": this.userData.phone,
       
       candidacy: []
     }
 
     for(let i = 0; i<this.userData.candidacy.length; i++){
       newUserData.candidacy.push(this.userData.candidacy[i])
     }
 
     const lastCandidacy = {
       "offerId": offerId,
       "jobTitle": this.job,
       "companyName": this.company,
       'firstname': this.applyForm?.get('firstname')?.value,
       'lastname': this.applyForm?.get('lastname')?.value,
       'email': this.applyForm?.get('email')?.value,
       "governorate": this.applyForm?.get('governorate')?.value,
     }
     newUserData.candidacy.push(lastCandidacy)
     console.log("new data: ", newUserData)
 
     this.userDataService.updateUserData(newUserData)*/



  }

  applyForJob(): void {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    Object.values(this.applyForm.controls).forEach(control => {
      control.markAsTouched();

    });
    if (this.applyForm.valid) {
      const formData = new FormData();

      const data = {
        "userId": this.userData.userId,
        "offerId": this.offer_id,
        "phone": this.applyForm.get('phone')?.value,
        'firstname': this.applyForm?.get('firstname')?.value,
        'lastname': this.applyForm?.get('lastname')?.value,
        'email': this.applyForm?.get('email')?.value,
        "governorate": this.applyForm?.get('governorate')?.value,
        "skills": this.skills,
        "timestamp": timestamp
      }

      formData.append('cv', this.applyForm?.get('cv')?.value);
      formData.append('data', JSON.stringify(data));

      fetch("http://127.0.0.1:3001/apply-for-job", {
        method: 'POST',

        body: formData
      })
        .then(response => response.json())
        .then(response => { response.success ? this.JobOfferAppliedSuccessfully({ ...data, jobTitle: this.job, companyName: this.company, hiring_mgr_id: Number(this.hiring_manager_id) }) : alert('Error when applying, please try again!') })
        .catch(err => console.log(err.message))
    } else {
      console.log("invalid form")
    }
  }
  isInvalid(field: string): any {
    const field_control = this.applyForm.get(field);
    return field_control?.touched && (field_control?.hasError('required') || field_control.hasError('email'))
  }
  candidacyEditedSuccessfully(candidacy: any): void {
    alert("Candidacy edited successfully");
    const newUserData: any = {
      "userId": this.userData.userId,
      "email": this.userData.email,
      "password": this.userData.password,
      "isLoggedIn": this.userData.isLoggedIn,
      "candidacy": [],
    }
    for (let i = 0; i < this.userData.candidacy.length; i++) {
      if (this.userData.candidacy[i].offerId == this.offer_id) {

        const editedCandidacy: any = {}
        editedCandidacy['offerId'] = this.userData.candidacy[i].offerId
        editedCandidacy['firstname'] = this.applyForm?.get('firstname')?.value;
        editedCandidacy['lastname'] = this.applyForm?.get('lastname')?.value;

        editedCandidacy['email'] = this.applyForm?.get('email')?.value;
        editedCandidacy.jobTitle = this.userData.candidacy[i].jobTitle
        editedCandidacy.companyName = this.userData.candidacy[i].companyName
        editedCandidacy['hiring_mgr_id'] = this.userData.candidacy[i].hiring_mgr_id
        editedCandidacy['phone'] = this.applyForm?.get('phone')?.value;
        editedCandidacy['governorate'] = this.applyForm?.get('governorate')?.value;
        editedCandidacy.tiemstamp = this.userData.candidacy[i].timestamp
        newUserData.candidacy.push(editedCandidacy)
        this.socketService.emit('candidacyEdited', { ...candidacy, "hiring_mgr_id": editedCandidacy.hiring_mgr_id });

      } else {
        newUserData.candidacy.push(this.userData.candidacy[i])
      }
    }
    this.userDataService.updateUserData(newUserData);
  }


  editCandidacy(): any {
    Object.values(this.applyForm.controls).forEach(control => {
      control.markAsTouched();

    });

    const formData = new FormData();

    const data = {
      'firstname': this.applyForm?.get('firstname')?.value,
      'lastname': this.applyForm?.get('lastname')?.value,
      'email': this.applyForm?.get('email')?.value,
      "governorate": this.applyForm?.get('governorate')?.value,
      "phone": this.applyForm.get('phone')?.value,
      "skills": this.skills,
      "offerId": Number(this.offer_id),
      'userId': this.userData.userId,


    }

    formData.append('cv', this.applyForm?.get('cv')?.value);
    formData.append('data', JSON.stringify(data));

    fetch('http://127.0.0.1:3001/editCandidacy', {
      method: 'PATCH',

      body: formData
    }).then(response => response.json())
      .then(response => {
        response.success ? this.candidacyEditedSuccessfully(data) : alert('Failed to edit, try again.')
      }).catch(err => console.log(err.message))


  }


  addSkill(): void {
    this.openSkill = true
  }
  hideSkillWindow(): void {
    this.openSkill = false

  }

  handleInputSkill(event: any): void {
    this.skill = event.target.value

  }


  addSkillToSelect(): void {
    this.skills.push(this.skill)
    this.skill = ""
  }



  UserApplied: any = this.socketService.on('IApplied').subscribe(candidacy => {
    if ("candidacy" in this.userData && !this.userData.candidacy.find((c: any) => c.userId == candidacy.userId && c.offerId == candidacy.offerId)) {
      alert('IAPPLIED')
      this.userData.candidacy.push(candidacy)
      this.userDataService.updateUserData(this.userData)
      this.cdr.detectChanges();
    }

  })


  candidacyDeleted: any = this.socketService.on('candidacyDeletedSeekerJob').subscribe(offerId => {


    this.userData = { ...this.userData, candidacy: this.userData.candidacy.filter((c: any) => c.offerId != offerId) }
    this.userDataService.updateUserData(this.userData)

    this.cdr.detectChanges();
  })




}
