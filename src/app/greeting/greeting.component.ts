import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

const URL = 'locallhost:3000/signup';

@Component({
  selector: 'app-greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.scss']
})
export class GreetingComponent implements OnInit {
  userDataForm: FormGroup;
  namePattern = /^([^-\s][a-zA-Zа-яёА-ЯЁ ]{2,15})$/;
  passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})$/;
  // tslint:disable-next-line:max-line-length
  emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  isFileChoosen = false;
  isLogin = true;

  constructor(private fb: FormBuilder,
              private authentication: AuthenticationService,
              private router: Router,
              private cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    if (sessionStorage.getItem('token')) {
      this.router.navigate(['/chat']);
      console.log('redirecting to chat');
    }
    this.initForm();
  }

  initForm() {
    this.userDataForm = this.fb.group({
      name: [null, [
        Validators.required,
        Validators.pattern(this.namePattern)
      ]],
      email: [null, [
        Validators.required,
        Validators.pattern(this.emailPattern),
      ]],
      password: [null, [
        Validators.required,
        Validators.pattern(this.passwordPattern),
      ]],
      image: [null]
    });
  }

  toggleRegistration() {
    this.userDataForm.reset();
    this.isLogin = !this.isLogin;
  }

  sendFormData() {
    const { controls, value } = this.userDataForm;

    if (!this.isLogin && this.userDataForm.invalid) {
      console.log('error!')
      Object.keys(controls)
        .forEach(controlName => controls[controlName].markAsTouched());
      return;
    }
    value.email = value.email.toLowerCase();

    if (this.isLogin) {
      this.authentication.loginUser(value)
        .pipe(
          first()
        )
        .subscribe(data => {
          this.router.navigate(['/chat']);
        });
    } else {
      this.authentication.signUpUser(value)
        .pipe(
          first()
        )
        .subscribe(data => {
          if (data.success) {
            this.isLogin = true;
            this.userDataForm.reset();
          } else {
            console.log(JSON.stringify(data));
          }
        });
    }
  }

  onFileChange(event) {
    this.isFileChoosen = true;
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.userDataForm.patchValue({
          image: reader.result
        });

        this.cd.markForCheck();
      };
    }
  }

}

