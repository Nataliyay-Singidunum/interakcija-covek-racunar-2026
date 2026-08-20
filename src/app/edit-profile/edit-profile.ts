import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { Utils } from '../utils';

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  protected form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private utils: Utils,
  ) {
    const currentUser =  UserService.getActiveUser();

    this.form = this.formBuilder.group({
      firstName: [currentUser?.firstName || '', Validators.required],
      lastName: [currentUser?.lastName || '', Validators.required],
      email: [currentUser?.email || '', [Validators.required, Validators.email]],
      phone: [currentUser?.phone || '', Validators.required],
      address: [currentUser?.address || '', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      this.utils.showAlert('Please properly fill out all required data.');
      return;
    }

    const currentUser = UserService.getActiveUser();

    if (currentUser.password !== this.form.value.password) {
      this.utils.showAlert('Incorrect password. Cannot save changes.');
      return;
    }

    const updatedUser = {
      ...currentUser,
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      email: this.form.value.email,
      phone: this.form.value.phone,
      address: this.form.value.address,
    };

    UserService.updateUser(updatedUser);

    this.utils.showAlert('Profile updated successfully!');
    this.router.navigateByUrl('/profile');
  }
}
