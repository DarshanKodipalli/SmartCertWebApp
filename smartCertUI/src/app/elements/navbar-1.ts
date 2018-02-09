import { Component } from '@angular/core';
import { HttpService } from '../services/HttpService';
import { AppComponent } from '../app.component';

declare var $: any;

@Component({
  selector: 'navbar-1',
  templateUrl: '../elements/navbar-1.html'
})

export class Navbar1Component {

  constructor(private http:HttpService,private app:AppComponent) {
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

  logout(){
    var token = JSON.parse(localStorage.getItem("login")).token;
    localStorage.clear();
    this.app.login=false;
    this.http.logoutService({token:token}).subscribe(
      (reponse)=>{
        localStorage.clear();
        this.app.login=false;
      },
      (err)=>{
        console.log(err);
      }
    );
  }

}

