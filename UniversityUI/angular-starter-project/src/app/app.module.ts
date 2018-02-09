import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { DropzoneModule } from 'angular2-dropzone-wrapper';
import {TranslateModule} from 'ng2-translate';

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
import { SeeStudentsComponent } from './institutesPage/seeStudents/seeStudents';
import { UploadCertificateIndividuallyComponent } from './institutesPage/uploadCertificatesIndividually/uploadCertificatesIndividually';
import { CertificatePageApproverComponent } from './certificatePageApprover/certificatePageApprover';
import { DashboardPageApproverComponent } from './dashboardPageApprover/dashboardPageApprover';
import { CertificatePageApprovedComponent } from './approvedCertificates/approvedCertificates';
import { CertificatesToBeApproved } from './certificatePageApprover/approverApprovesCertificates/approverApprovesCertificates';
import { RejectedCertificates } from './certificatePage/viewRejected/viewRejected';
import { ApplicationComponents } from './services/applicationComponents';
import { RestCallsComponent } from './services/httpServices';
import { NavigationItems } from './services/sideNavigation';
import { viewRequestsTransactionPage } from './transactionPage/viewRequests/viewRequests';
import { ResendRejectedCertificates } from './certificatePage/resendCertificates/resendCertificates';
import { AddStudentsUniversityComponent } from './addStudents/addStudentsUniversity';
import { AddStudentManually } from './addStudents/addManually/addManually';
import { AddStudentComponent } from './dashboardStudent/dashboardStudent';
import { FileUploadComponent } from './institutesPage/uploadCertificatesIndividually/fileUploadComponent';
import { LogoUploadComponent } from './institutesPage/createCertificate/fileUploadComponent';
import { FileUploadComponentResend } from './certificatePage/resendCertificates/fileUploadComponent';
import { ViewStudentsComponent } from './addStudents/viewStudents/viewStudents';
import { StudentAdditionThroughFile } from './addStudents/addThroughFile/addThroughFile';
import { ViewBatchesStudentsComponent } from './addStudents/viewBatchesStudents/viewBatchesStudents';
import { ViewCertificateBatches } from './transactionPage/viewBatches/viewBatches';
import { CreateCertificateComponent } from './institutesPage/createCertificate/createCertificate';
import { ChooseCertificateMethod } from './institutesPage/chooseMethod/chooseMethod';
import { ViewTransactionStudentsComponent } from './transactionPage/viewStudents/viewStudents';
import { NotificationService } from "./services/NotificationService";
import { DataService } from "./services/DataService";
import { CourseComponent } from "./addCourse/addCourse";
import { DataTransferService } from "./services/DataTransferService";
import { DecideUploadMethod } from './institutesPage/certificateUploadDecision/certificateUploadDecision';
import { FileUploadCertificate } from "./institutesPage/fileUploadCertificates/fileuploadCertificates";
import { MassFileUploadComponent } from "./institutesPage/fileUploadCertificates/massUploadFileComponent";
import { BulkUploadComponentStudent } from "./addStudents/addThroughFile/bulkUploadStudent";
import { MassCertificateCreation } from "./institutesPage/createMassCertificate/createMassCertificates";

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
    MassCertificateCreation,
    CertificatePageApprovedComponent,
    CertificatesToBeApproved,
    AddStudentsUniversityComponent,
    CreateCertificateComponent,
    ViewCertificateBatches,
    AddStudentComponent,
    AddStudentManually,
    UploadCertificateIndividuallyComponent,
    ViewStudentsComponent,
    BulkUploadComponentStudent,
    StudentAdditionThroughFile,
    SeeStudentsComponent,
    FileUploadComponent,
    viewRequestsTransactionPage,
    ResendRejectedCertificates,
    ViewTransactionStudentsComponent,
    FileUploadComponentResend,
    LogoUploadComponent,
    ChooseCertificateMethod,
    ViewBatchesStudentsComponent,
    CourseComponent,
    DecideUploadMethod,
    FileUploadCertificate,
    MassFileUploadComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot([
      { path: '', component:DashboardPageComponent, pathMatch:'full'},
      { path: 'login',component:LoginComponent, pathMatch:'full'},
      { path: 'institute/institutesPage', component: InstitutePageComponent, pathMatch:'full'},
      { path: 'certificate/certificatePage', component: CertificatePageComponent, pathMatch:'full'},
      { path: 'dashboard/dashboardPage', component: DashboardPageComponent , pathMatch:'full'},
      { path: 'transaction/transactionPage', component: TransactionPageComponent, pathMatch:'full'},
      { path: 'help/helpPage', component: HelpPageComponent, pathMatch:'full'},    
      { path: 'institutePage/getUploaded',component:GetUploadedFilesComponent, pathMatch:'full'},
      { path: 'dashboardApprover/dashboardPageApprover',component:DashboardPageApproverComponent, pathMatch:'full'},
      { path: 'certificateToBeSigned/certificatePage',component:CertificatePageApproverComponent, pathMatch:'full'},
      { path: 'approver/approvesCertificates',component:CertificatesToBeApproved, pathMatch:'full'},
      { path: 'approved/batches',component:CertificatePageApprovedComponent, pathMatch:'full'},
      { path: 'view/rejected', component:RejectedCertificates, pathMatch:'full'},
      { path: 'addStudents/addStudentsUniversity',component:AddStudentsUniversityComponent, pathMatch:'full'},
      { path: 'dashboardAdder/dashboardPageAdder',component:AddStudentComponent, pathMatch:'full'},
      { path: 'addStudent/manually',component:AddStudentManually, pathMatch:'full'},
      { path: 'addStudent/throughFile', component:StudentAdditionThroughFile, pathMatch:'full'},
      { path: 'view/StudentBatches',component:ViewBatchesStudentsComponent, pathMatch:'full'},
      { path: 'choose/uploadMethod', component:ChooseCertificateMethod, pathMatch:'full'},
      { path: 'view/BatchStudents',component:ViewStudentsComponent, pathMatch:'full'},
      { path: 'certificate/uploadDecision',component:DecideUploadMethod, pathMatch:'full'},      
      { path: 'see/students',component:SeeStudentsComponent, pathMatch:'full'},
      { path: 'resend/rejectedCertificates',component:ResendRejectedCertificates, pathMatch:'full'},
      { path: 'viewRequests/transaction',component:viewRequestsTransactionPage, pathMatch:'full'},
      { path: 'upload/certificatesIndividually',component:UploadCertificateIndividuallyComponent, pathMatch:'full'},
      { path: 'View/TransactionStudents',component:ViewTransactionStudentsComponent, pathMatch:'full'},
      { path: 'create/Certificate',component:CreateCertificateComponent, pathMatch:'full'},
      { path: "courses/add",component:CourseComponent, pathMatch:'full'},
      { path: 'viewTransaction/batches',component:ViewCertificateBatches, pathMatch:'full'},
      { path: "massUpload/certificate",component:FileUploadCertificate, pathMatch:'full'},
      { path: "create/MassCertificates",component:MassCertificateCreation,pathMatch:'full'},
      { path: '**', component: DashboardPageComponent , pathMatch:'full'}
    ]),
  ],
  providers: [ApplicationComponents,
              NavigationItems,
              RestCallsComponent,
              NotificationService,
              DataService,
              DataTransferService],
  bootstrap: [AppComponent]
})

export class AppModule { }