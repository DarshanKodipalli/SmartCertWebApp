import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { DropzoneModule } from 'angular2-dropzone-wrapper';

import { AppComponent } from './app.component';
import { BackdropsComponent } from './elements/backdrops';
import { Jumbotron1Component } from './elements/jumbotron-1';
import { Jumbotron2Component } from './elements/jumbotron-2';
import { LeftSidebar1Component } from './elements/left-sidebar-1';
import { Navbar1Component } from './elements/navbar-1';
import { RightSidebar1Component } from './elements/right-sidebar-1';
import { TopNavigation1Component } from './elements/top-navigation-1';
import { TopNavigation2Component } from './elements/top-navigation-2';
import { SidebarHeadingComponent } from './elements/sidebar-heading';

import { DashboardPageComponent } from './dashboardPage/dashboardPage';
import { HelpPageComponent } from './helpPage/helpPage';
import { CertificatePageComponent } from './certificatePage/certificatePage';
import { InstitutePageComponent } from './institutesPage/institutesPage';
import { TransactionPageComponent } from './transactionPage/transactionPage';
import { LoginComponent } from './login/login';
import { GetUploadedFilesComponent } from './institutesPage/getUploadedFiles/getUploaded';
import { CertificatePageApproverComponent } from './certificatePageApprover/certificatePageApprover';
import { DashboardPageApproverComponent } from './dashboardPageApprover/dashboardPageApprover';
import { CertificatePageApprovedComponent } from './approvedCertificates/approvedCertificates';
import { CertificatesToBeApproved } from './certificatePageApprover/approverApprovesCertificates/approverApprovesCertificates';
import { RejectedCertificates } from './certificatePage/viewRejected/viewRejected';
import { ApplicationComponents } from './services/applicationComponents';
import { RestCallsComponent } from './services/httpServices';
import { NavigationItems } from './services/sideNavigation';
import { AddStudentsUniversityComponent } from './addStudents/addStudentsUniversity';
import { AddStudentManually } from './addStudents/addManually/addManually';
import { AddStudentComponent } from './dashboardStudent/dashboardStudent';
@NgModule({
  declarations: [
    AppComponent,
    BackdropsComponent,
    Jumbotron1Component,
    Jumbotron2Component,
    LeftSidebar1Component,
    Navbar1Component,
    RightSidebar1Component,
    TopNavigation1Component,
    TopNavigation2Component,
    HelpPageComponent,
    CertificatePageComponent,
    DashboardPageComponent,
    InstitutePageComponent,
    TransactionPageComponent,
    LoginComponent,
    SidebarHeadingComponent,
    DashboardPageApproverComponent,
    CertificatePageApproverComponent,
    GetUploadedFilesComponent,
    RejectedCertificates,
    CertificatePageApprovedComponent,
    CertificatesToBeApproved,
    AddStudentsUniversityComponent,
    AddStudentComponent,
    AddStudentManually
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot([
      { path: '', component:DashboardPageComponent},
      { path: 'login',component:LoginComponent},
      { path: 'institute/institutesPage', component: InstitutePageComponent},
      { path: 'certificate/certificatePage', component: CertificatePageComponent},
      { path: 'dashboard/dashboardPage', component: DashboardPageComponent },
      { path: 'transaction/transactionPage', component: TransactionPageComponent},
      { path: 'help/helpPage', component: HelpPageComponent},    
      { path: 'institutePage/getUploaded',component:GetUploadedFilesComponent},
      { path: 'dashboardApprover/dashboardPageApprover',component:DashboardPageApproverComponent},
      { path: 'certificateToBeSigned/certificatePage',component:CertificatePageApproverComponent},
      { path: 'approver/approvesCertificates',component:CertificatesToBeApproved},
      { path: 'approved/batches',component:CertificatePageApprovedComponent},
      { path: 'view/rejected', component:RejectedCertificates},
      { path: 'addStudents/addStudentsUniversity',component:AddStudentsUniversityComponent},
      { path: 'dashboardAdder/dashboardPageAdder',component:AddStudentComponent},
      { path: 'addStudent/manually',component:AddStudentManually},
      { path: '**', component: DashboardPageComponent }
    ]),
    DropzoneModule.forRoot({
          // Change this to your upload POST address:
          server: 'http://localhost:3000/university',
          maxFilesize: 50,
          paramName: "file"
    })
  ],
  providers: [ApplicationComponents,
              NavigationItems,
              RestCallsComponent],
  bootstrap: [AppComponent]
})

export class AppModule { }