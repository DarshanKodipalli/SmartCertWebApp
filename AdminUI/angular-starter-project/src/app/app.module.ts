import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { BackdropsComponent } from './elements/backdrops';
import { EmptyPageComponent } from './pages/empty-page';
import { ErrorPageComponent } from './pages/error-page';
import { Jumbotron1Component } from './elements/jumbotron-1';
import { Jumbotron2Component } from './elements/jumbotron-2';
import { LeftSidebar1Component } from './elements/left-sidebar-1';
import { Navbar1Component } from './elements/navbar-1';
import { RightSidebar1Component } from './elements/right-sidebar-1';
import { TopNavigation1Component } from './elements/top-navigation-1';
import { TopNavigation2Component } from './elements/top-navigation-2';
import {ViewInstitutesComponent} from './university/view-institutes-component';
import { UniversityComponent } from './university/university-component';
import { SidebarHeadingComponent } from './elements/sidebar-heading'
import { NotificationComponent } from './notification/notification';

import { InstituteComponent } from './institute/institute-component';
import { SideNavigationMenuList } from './services/sideNavigation';
import { ApplicationComponents } from './services/applicationComponents';
import { DataTransferService } from './services/dataTransferService';
import { RestCallsComponent } from './services/httpServices';
import { LoginComponent } from './login/login';
import { CreateUniversityComponent } from './createUniversity/create-university';
import { EditUniversityComponent } from './editUniversity/edit-university';
import { EditInstituteComponent } from './editInstitute/edit-institute';
import { CreateInstituteComponent } from './createInstitute/create-institute';
import { AddApproverComponent } from './addApprover/addApprover';
import { AddIssuerComponent } from './addIssuer/addIssuer';
import { AddCreatorComponent } from './addCreator/addCreator';

import { IssuerComponent } from './users/issuer-component';
import { CheckerComponent } from './users/checker-component';
import { CreatorComponent } from './users/creator-component';
import { CreateIssuerComponent } from './createIssuer/create-issuer';
import { CreateCheckerComponent } from './createChecker/create-checker';
import { CreateCreatorComponent } from "./createCreator/createCreator";
import { NotificationService } from "./services/notificatationService";


const appRoutes:Routes = [
      { path: '', component:LoginComponent, pathMatch:'full'},
      { path: 'login/login-component', component: LoginComponent, pathMatch:'full'}, 
      { path: 'pages/empty-page', component: EmptyPageComponent , pathMatch:'full'},
      { path: 'university/university-component', component: UniversityComponent, pathMatch:'full'},
      { path: 'university/view-institutes-component', component: ViewInstitutesComponent, pathMatch:'full'},
      { path: 'institute/institute-component', component: InstituteComponent, pathMatch:'full'},
      { path: 'createUniversity/create-university', component: CreateUniversityComponent, pathMatch:'full'},
      { path: 'editUniversity/edit-university', component: EditUniversityComponent, pathMatch:'full'},
      { path: 'editInstitute/edit-institute', component: EditInstituteComponent, pathMatch:'full'},
      { path: 'createInstitute/create-institute', component: CreateInstituteComponent, pathMatch:'full'},
      { path: 'users/issuer-component', component: IssuerComponent, pathMatch:'full'},
      { path: 'users/checker-component', component: CheckerComponent, pathMatch:'full'},
      { path: 'users/creator-component', component: CreatorComponent, pathMatch:'full'},
      { path: 'createIssuer/create-issuer', component: CreateIssuerComponent, pathMatch:'full'},
      { path: 'createChecker/create-checker', component: CreateCheckerComponent, pathMatch:'full'},
      { path: 'add/approver', component: AddApproverComponent, pathMatch:'full'},
      { path: 'add/creator', component: AddCreatorComponent, pathMatch:'full'},
      { path: 'add/issuer', component: AddIssuerComponent, pathMatch:'full'},
      { path: 'createCreator/create-creator', component: CreateCreatorComponent, pathMatch:'full'},
      { path: '**', component: ErrorPageComponent , pathMatch:'full'},

];
@NgModule({
  declarations: [
    AppComponent,
    BackdropsComponent,
    EmptyPageComponent,
    ErrorPageComponent,
    Jumbotron1Component,
    Jumbotron2Component,
    LeftSidebar1Component,
    Navbar1Component,
    SidebarHeadingComponent,
    RightSidebar1Component,
    TopNavigation1Component,
    TopNavigation2Component,
    UniversityComponent,
    InstituteComponent,
    LoginComponent,
    CreateUniversityComponent,
    EditUniversityComponent,
    EditInstituteComponent,
    CreateInstituteComponent,
    ViewInstitutesComponent,
    IssuerComponent,
    NotificationComponent,
    CheckerComponent,
    CreateCheckerComponent,
    CreateIssuerComponent,
    CreatorComponent,
    CreateCreatorComponent,
    AddIssuerComponent,
    AddApproverComponent,
    AddCreatorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [SideNavigationMenuList,
              RestCallsComponent,
              ApplicationComponents,
              DataTransferService,
              NotificationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
