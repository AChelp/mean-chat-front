import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  emailPattern,
  namePattern,
  passwordPattern
} from '../../constants/validationPatterns';

@Component({
  selector: 'app-greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.scss']
})
export class GreetingComponent implements OnInit {
  userDataForm: FormGroup;
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
    }
    this.initForm();
  }

  initForm() {
    this.userDataForm = this.fb.group({
      name: [null, [
        Validators.required,
        Validators.pattern(namePattern)
      ]],
      email: [null, [
        Validators.required,
        Validators.pattern(emailPattern),
      ]],
      password: [null, [
        Validators.required,
        Validators.pattern(passwordPattern),
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

