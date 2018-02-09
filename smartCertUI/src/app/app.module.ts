import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { BackdropsComponent } from './elements/backdrops';
import { EmptyPageComponent } from './pages/empty-page';
import { ErrorPageComponent } from './pages/error-page';
import { LoginPageComponent } from './pages/studentLogin/login';
import { Jumbotron1Component } from "./elements/jumbotron-1";
import { Jumbotron2Component } from './elements/jumbotron-2';
import { LeftSidebar1Component } from './elements/left-sidebar-1';
import { Navbar1Component } from './elements/navbar-1';
import { RightSidebar1Component } from './elements/right-sidebar-1';
import { TopNavigation1Component } from './elements/top-navigation-1';
import { TopNavigation2Component } from './elements/top-navigation-2';
import { HttpService } from './services/HttpService';
import { StudentDashboardComponent } from './pages/studentDashboard/studentDashboard';
import { CertificateComponent } from './pages/certificates/certificates';
import { HelpComponent } from './pages/help/help';
import { ProfileComponent } from './pages/profile/profile';
import { NewRequestComponent } from "./pages/newRequest/newRequest";
import { AllRequestsComponent } from "./pages/allRequests/allRequests";
import { ViewComponent } from "./pages/viewRequest/view";
import { Navbar2Component } from "./elements/navbar-2";

@NgModule({
  declarations: [
    AppComponent,
    BackdropsComponent,
    EmptyPageComponent,
    ErrorPageComponent,
    Jumbotron2Component,
    LeftSidebar1Component,
    Navbar1Component,
    Jumbotron1Component,
    RightSidebar1Component,
    TopNavigation1Component,
    TopNavigation2Component,
    LoginPageComponent,
    StudentDashboardComponent,
    CertificateComponent,
    HelpComponent,
    ProfileComponent,
    NewRequestComponent,
    AllRequestsComponent,
    ViewComponent,
    Navbar2Component 
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule, 
    RouterModule.forRoot([
      { path: '', component: StudentDashboardComponent, pathMatch:'full' },
      { path: 'certificates/get', component: CertificateComponent, pathMatch:'full' },
      { path: 'user/profile', component: ProfileComponent, pathMatch:'full'},
      { path: 'help/get', component:HelpComponent, pathMatch:'full'},
      { path: 'new/request', component:NewRequestComponent, pathMatch:'full'},
      { path: 'all/requests', component:AllRequestsComponent, pathMatch:'full'},
      { path: 'view/certificates/:token',component:ViewComponent},
      { path: '**', component: ErrorPageComponent, pathMatch:'full' }
    ])
  ],
  providers: [HttpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
