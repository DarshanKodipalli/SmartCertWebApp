import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { RestCallsComponent } from '../services/httpServices';
import { ApplicationComponents } from '../services/applicationComponents';
import { Router } from '@angular/router';

@Component({
  selector: 'notify',
  templateUrl: '../notification/notification.html'
})

export class NotificationComponent {
  constructor() {
  }
}