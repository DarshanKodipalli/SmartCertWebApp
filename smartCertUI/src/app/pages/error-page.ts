import { Component } from '@angular/core';
import { Router }  from '@angular/router';

@Component({
  selector: 'error-page',
  templateUrl: '../pages/error-page.html'
})

export class ErrorPageComponent {

  constructor(private router:Router) {
  }
  home(){
  	this.router.navigate(['/']);
  }


}
