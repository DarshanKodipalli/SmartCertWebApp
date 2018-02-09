import { Component } from '@angular/core';
import { HttpService } from '../services/HttpService';
import { AppComponent } from '../app.component';

declare var $: any;

@Component({
  selector: 'navbar-2',
  templateUrl: '../elements/navbar-2.html'
})

export class Navbar2Component {

  constructor(private http:HttpService,private app:AppComponent) {
  }
}