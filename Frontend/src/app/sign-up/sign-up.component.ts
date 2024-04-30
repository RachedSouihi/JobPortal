import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from '@angular/router';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {



  hiringManagerRadio: boolean = false;
  seekerForJobRadio: boolean = false;

  signUpForm: FormGroup;

  ngOnInit(): void {
    const localUserData = localStorage.getItem('userData');
    if (localUserData) {
      console.log("LOCAL STORAGE DATA: ", JSON.parse(localUserData))
    } else {
      console.log('No data in local storage!')
    }
  }


  constructor(private fb: FormBuilder, private router: Router) {
    this.signUpForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confPassword: ['', [Validators.required]],

      hiring_manager: [null, Validators.required]


    }, { validator: this.passwordMatchValidator })

  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confPassword')?.value;

    // Check if passwords match
    return password === confirmPassword ? null : { "mismatch": true };
  }

  create(): void {
    Object.values(this.signUpForm.controls).forEach(control => {
      control.markAsTouched();

    });

    if (this.signUpForm.valid) {
      const { confPassword, ...userData } = this.signUpForm.value;


      fetch('http://127.0.0.1:3001/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({ userData })
      }).then(response => response.json())
        .then(response => {
          if (response.success) {
            localStorage.setItem('userData', JSON.stringify({ ...userData, userId: response.userId, "isLoggedIn": true }))
            setTimeout(() => {

              this.router.navigate(["job-portal/joboffer"])
            }, 3000)

          } else {
            console.log('Failed inserting data')
          }
        })
        .catch(err => console.log(err.message))
    }
  }


  setRadioCheck(person: string): void {
    if (person === "hiring-manager") {
      this.signUpForm.patchValue({
        hiring_manager: true
      })
      this.hiringManagerRadio = true;
      this.seekerForJobRadio = false;
      document.querySelector('.div-hiring-manager')?.classList.toggle('scale-div')


      setTimeout(() => {
        document.querySelector('.div-hiring-manager')?.classList.toggle('scale-div')


      }, 100)
    } else {
      this.signUpForm.patchValue({
        hiring_manager: false
      })
      this.seekerForJobRadio = true;

      this.hiringManagerRadio = false;

      document.querySelector('.div-seeker-job')?.classList.toggle('scale-div')


      setTimeout(() => {
        document.querySelector('.div-seeker-job')?.classList.toggle('scale-div')


      }, 100)

    }

  }


  signUp(): void {
    alert("Sign up")
  }



}
