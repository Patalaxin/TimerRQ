import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthService } from 'src/app/services/auth.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup = new FormGroup({
    key: new FormControl(''),
    password: new FormControl(''),
  });
  submitted: boolean = false;
  passwordVisible: boolean = false;

  isLoginLoading: boolean = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private storageService: StorageService,
    // private configurationService: ConfigurationService,
    private message: NzMessageService
  ) {}

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  onLogin(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.isLoginLoading = true;

    this.authService
      .login(this.form.value.key, this.form.value.password)
      .subscribe({
        next: (res) => {
          this.storageService.setLocalStorage(
            this.form.value.key,
            res.accessToken
          );
          if (res.accessToken) {
            this.router.navigate(['/timer']);
          }
        },
        error: (err) => {
          this.isLoginLoading = false;
          this.message.create('error', 'Неверный логин или пароль');
        },
      });
  }

  // getServers(): void {
  //   this.configurationService.getServers().subscribe({
  //     next: (res) => {
  //       let serverList: any[] = [];
  //       res.map((server: any) => {
  //         serverList.push({ label: server, value: server });
  //       });
  //       this.configurationService.setServerList(serverList);
  //     },
  //   });
  // }

  ngOnInit(): void {
    // this.getServers();
    this.form = this.formBuilder.group({
      key: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }
}
