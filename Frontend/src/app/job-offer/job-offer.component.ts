import { Component, OnInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import { CommonModule, Location } from '@angular/common';
import gsap from 'gsap';
import { JobFilterService } from '../job-filter.service';
import { Router } from '@angular/router';
import { SocketIOService } from '../socket-io.service';
import { UserDataService } from '../user-data.service';
//import { ScreenWidthService } from '../screen-width.service';

@Component({
  selector: 'app-job-offer',
  standalone: true,
  imports: [NavComponent, CommonModule],
  templateUrl: './job-offer.component.html',
  styleUrl: './job-offer.component.css'
})
export class JobOfferComponent implements OnInit {

  userData: any;
  jobOffer!: any[]/* [
    {
      "offerId": 11414,
      "hiring_mgr_id": 1,
      "jobTitle": "Software Engineer",
      "jobType": "Job",
      "companyName": "Tech Innovations Inc.",
      "companyLocation": "123 Main Street, Cityville",
      "workingSchedule": "Monday to Friday, 9am to 5pm",
      "employmentType": "Permanent",
      "experience": "2-5 years",
      "salary": "$80,000 - $100,000 per year",
      "jobDesc": "Tech Innovations Inc. is seeking a talented Software Engineer to join our team...",
      "skills": ["Java", "JavaScript", "SQL", "Agile development"]
    },
    {
      "hiring_mgr_id": "227",
      "jobTitle": "Marketing Manager",
      "jobType": "Remote",
      "companyName": "Global Marketing Solutions",
      "companyLocation": "Remote",
      "workingSchedule": "full time",
      "employmentType": "Contract",
      "experience": "5+ years",
      "salary": "$90,000 - $120,000 per year",
      "jobDesc": "Global Marketing Solutions is looking for an experienced Marketing Manager to oversee...",
      "skills": ["Digital marketing", "Social media management", "Analytics", "Content creation"]
    },
    {
      "hiring_mgr_id": "963",
      "jobTitle": "Data Scientist",
      "jobType": "Full-time",
      "companyName": "DataTech Corp",
      "companyLocation": "456 Elm Street, Metropolis",
      "workingSchedule": "Monday to Friday, 9am to 6pm",
      "employmentType": "Permanent",
      "experience": "3-7 years",
      "salary": "$100,000 - $130,000 per year",
      "jobDesc": "DataTech Corp is seeking an experienced Data Scientist to join our growing team...",
      "skills": ["Machine learning", "Python", "Data visualization", "Statistical analysis"]
    },
    {
      "hiring_mgr_id": "858",
      "jobTitle": "Graphic Designer",
      "jobType": "internship",
      "companyName": "Design Studios Ltd.",
      "companyLocation": "789 Oak Avenue, Townsville",
      "workingSchedule": "Flexible",
      "employmentType": "Part-time",
      "experience": "1-3 years",
      "salary": "$25 - $35 per hour",
      "jobDesc": "Design Studios Ltd. is looking for a creative Graphic Designer to create engaging...",
      "skills": ["Adobe Creative Suite", "Typography", "Illustration", "Web design"]
    },
    {
      "hiring_mgr_id": "441",
      "jobTitle": "Financial Analyst",
      "jobType": "Full-time",
      "companyName": "FinanceTech Solutions",
      "companyLocation": "101 Pine Street, Megacity",
      "workingSchedule": "Monday to Friday, 9am to 5pm",
      "employmentType": "Permanent",
      "experience": "2-4 years",
      "salary": "$70,000 - $90,000 per year",
      "jobDesc": "FinanceTech Solutions is seeking a detail-oriented Financial Analyst to join our team...",
      "skills": ["Financial modeling", "Data analysis", "Excel", "Budgeting"]
    },{
      "hiring_mgr_id": "441",
      "jobTitle": "Financial Analyst",
      "jobType": "Full-time",
      "companyName": "FinanceTech Solutions",
      "companyLocation": "101 Pine Street, Megacity",
      "workingSchedule": "Monday to Friday, 9am to 5pm",
      "employmentType": "Permanent",
      "experience": "2-4 years",
      "salary": "$70,000 - $90,000 per year",
      "jobDesc": "FinanceTech Solutions is seeking a detail-oriented Financial Analyst to join our team...",
      "skills": ["Financial modeling", "Data analysis", "Excel", "Budgeting"]
    },{
      "hiring_mgr_id": "441",
      "jobTitle": "Financial Analyst",
      "jobType": "Full-time",
      "companyName": "FinanceTech Solutions",
      "companyLocation": "101 Pine Street, Megacity",
      "workingSchedule": "Monday to Friday, 9am to 5pm",
      "employmentType": "Permanent",
      "experience": "2-4 years",
      "salary": "$70,000 - $90,000 per year",
      "jobDesc": "FinanceTech Solutions is seeking a detail-oriented Financial Analyst to join our team...",
      "skills": ["Financial modeling", "Data analysis", "Excel", "Budgeting"]
    }
  ]*/

 
  


  jobOfferToDisplayed!: any[];


  jobDetails: any = null;


  updateFilter(): void {
    this.jobOfferToDisplayed = this.jobOffer

    for(let criteria in this.jobFilters){
      if(typeof(this.jobFilters[criteria]) === "object" && this.jobFilters[criteria].length){
        this.jobOfferToDisplayed = this.jobOfferToDisplayed.filter(job => this.jobFilters[criteria].includes(job[criteria].toLowerCase()))

      }else{
        this.jobOfferToDisplayed = this.jobOfferToDisplayed.filter(job => job[criteria].toLowerCase().includes(this.jobFilters[criteria].toLowerCase()))
      }
    }
    
   



    
  }

  jobFilters: any = {};


  JF = this.jobFilterService.jobFilters$.subscribe(jobFiltersArr => {
    this.jobFilters = {...this.jobFilters, ...jobFiltersArr};
    console.log(this.jobFilters)
    this.updateFilter()


  })


 
  @ViewChild('job_offer_section_parent') divv!: ElementRef;


  constructor(private socketService: SocketIOService, private rendered: Renderer2 , userData: UserDataService,private jobFilterService: JobFilterService, private router: Router, private location: Location) { 

  

    
    //Get user data from UserDataService 
    userData.$userData.subscribe(user_data => {
      this.userData = user_data;
      console.log(user_data)
      this.socketService.emit('join', Number(this.userData.userId))


    })
  /* const localUserData = localStorage.getItem("userData");
    if (localUserData) {
      
      this.userData = JSON.parse(localUserData);
     
    }*/
    
    this.jobFilters = {...this.jobFilters, "employmentType": [], 'jobType': []}

    
      fetch('http://127.0.0.1:3001/getAllOffer')
      .then(response => response.json())
      .then(response => {console.log(response.offers);this.jobOffer = response.offers; this.jobOfferToDisplayed = response.offers})
      .catch(err => console.log(err.message))

    
    


    
    

   
    

   
  
  }

  

  


 
  


  ngOnInit(): void {

    
    
    /*else{
      this.router.navigate(['/'])
    }*/

   // this.socketIOService.emit("joinSocketIOServer", 242619)

    //this.fetchData()


  

  

  }

  ngAfterViewInit(): void{
   const navHeight =   document.querySelector('.app-nav')?.clientHeight;
   


    this.rendered.setStyle(this.divv.nativeElement, 'height', `calc(100% - ${navHeight! + 2}px)`)

  }
  



  filter(criteria: string ,event: any): void{
    let newArr = [];
    for(let i = 0; i < this.jobFilters[criteria].length; i++){
      if(this.jobFilters[criteria][i] !== event.target.value) newArr.push(this.jobFilters[criteria][i])
    }

    
   
    
    this.jobFilters = {...this.jobFilters, [criteria]: event.target.checked ?  [...this.jobFilters[criteria],event.target.value]: newArr }
    this.jobOfferToDisplayed = this.jobOffer;
    for(let cr in this.jobFilters ){
      if(typeof(this.jobFilters[cr]) === "object" && this.jobFilters[cr].length){
        
        this.jobOfferToDisplayed = this.jobOfferToDisplayed.filter(job => this.jobFilters[cr].includes(job[cr].toLowerCase()))

      }
    }

    

  }

 

  

  


  setJobDetails(job: any): void {
    const translation = this.jobDetails ? false : true;

    this.jobDetails = job;
    translation &&
      gsap.fromTo(".show-job-details", {
        x: 500
      }, {
        //display: "block",
        x: 0,
        duration: .5,
        ease: "power1.ease",




      })




  }

  applyForJob(): void {
    const url = this.router.createUrlTree([`/apply/${this.jobDetails.hiring_mgr_id}/${this.jobDetails.offerId}/${this.jobDetails.jobTitle}`]).toString();
    window.open(this.location.prepareExternalUrl(url), '_blank');
  }

 on: any = this.socketService.on('someoneApply').subscribe(applicant => {
    console.log("New candidacy: ", applicant)
  })


  

  





}
