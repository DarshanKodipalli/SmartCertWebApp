import { Component,OnInit } from '@angular/core';
import { RestCallsComponent } from '../services/httpServices';
import { ApplicationComponents } from '../services/applicationComponents';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
declare var $: any;

@Component({
  selector: 'navbar-1',
  templateUrl: '../elements/navbar-1.html'
})

export class Navbar1Component implements OnInit {

  constructor(private http:RestCallsComponent,private navi:Router,private appCompo:AppComponent) {
  }

ngOnInit(){

  //location.reload();
}
  toggleLayout(): void {
    const body = $('body');
    const collapsed = body.attr('data-collapsed') === 'true' ? true : false;
    body.attr('data-collapsed', !collapsed);
    const layout = body.attr('data-layout');
		if(layout === 'sidebar-over-1') {
				var backdrop = $('.left-sidebar-backdrop');
				if(backdrop.hasClass('in')) {
					backdrop.removeClass('fade');
					backdrop.removeClass('in');
				} else {
					backdrop.toggleClass('fade in');
				}
		}
  }

  toggleFullscreen(): void {
    const body = $('body');
    const value = body.attr('data-fullscreen') === 'true' ? true : false;
    body.attr('data-fullscreen', !value);
  }
  adminLogout(){
    //localStorage.clear();
    console.log(JSON.parse(localStorage.getItem("loginData")));
    this.http.adminLogout(JSON.parse(localStorage.getItem("login"))).subscribe(
      (response)=>{
        console.log(response);
        this.appCompo.login = false;
        localStorage.clear();
      },
      (error)=>console.log(error));
  }
}
