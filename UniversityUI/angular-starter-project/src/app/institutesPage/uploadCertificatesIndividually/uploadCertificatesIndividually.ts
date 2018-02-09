import { Component,OnInit,ElementRef,OnDestroy } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService";
import { DataService } from "../../services/DataService";

declare var $: any;
declare var swal: any;
declare var approve: any;

@Component({
	selector: 'app-uploadCertificates',
	templateUrl: './uploadCertificatesIndividually.html'
})

export class UploadCertificateIndividuallyComponent implements OnInit,OnDestroy {
	
	public studentInfo:any = {};
	public studentBatchInfo:any = {};
	public batchYears:any = [];
	public certificate:any = {};
	public studentName:String;
	public courseName:String;
	public stream:String;
	public batch:String;
	public submitButton:boolean = true;
	public abc:ISubscription;
	public uploadFile:any={};
	constructor(
		private http:RestCallsComponent,
		private route:Router,
		private transfer:DataTransferService,
		private dataService:DataService) {		
		this.studentInfo = this.transfer.getStudent();
		this.studentBatchInfo = this.transfer.getBatch();
		this.certificate.courseName  = this.studentBatchInfo.courseName;
	}

	ngOnInit(){
		this.certificate.studentName = this.studentInfo.name;
		this.certificate.stream = this.studentBatchInfo.stream;
		this.certificate.batch = this.studentBatchInfo.year;
		this.batchYears = [
			'Marks Sheet',
			'Transcript',
			'Degree Certificate',
			'Provisional Certificate',
			'Others'
		];
	}
	fileupload(a,b){
		if(a != "" && b != ""){
			this.submitButton = false;
		}		
	}
	createAndSendToSigner(data){
		  swal({
		    title: 'Send Certificate',
		    text: 'A new Certificate: '+ data.certificateName +' will be created!',
		    type: "info",
		    showCancelButton: true,
		    confirmButtonColor: '#3085d6',
		    cancelButtonColor: '#d33',
		    confirmButtonText: 'Create and Send to Approver',
		    cancelButtonText: 'No!',
		    confirmButtonClass: 'confirm-class',
		    cancelButtonClass: 'cancel-class',
		    closeOnConfirm: true,
		    closeOnCancel: true,
		  },  function(isConfirm) {
		        if (isConfirm) {
				console.log(data);
				if(this.http.grtTemp()){
					var formData = this.http.grtTemp();
					var login = JSON.parse(localStorage.getItem("login"));
					formData.append('token',login.token);
					formData.append('url',login.url);
					formData.append('certificateInformation',JSON.stringify(data));
					formData.append('studentInformation',JSON.stringify(this.studentInfo));
					formData.append('batchInfo',JSON.stringify(this.studentBatchInfo));
					formData.append('loginInfo',localStorage.getItem("login"));
						this.abc=this.http.addCertificates(formData).subscribe(
							(response)=>{console.log(response)
								this.http.setTemp(null);
								this.route.navigate(['institute/institutesPage']);
								},
							(error)=>console.log(error));
					}
		        } else {
		            swal("Cancelled", "No Certificate Added:)", "error");
		        }
		    }.bind(this));
}
	onChange(event:any){
		console.log("onChange");
		console.log(event);
		var files = event.srcElement.files;
		console.log(files[0]);
		this.uploadFile = files[0];
		console.log("______________");
		console.log(this.uploadFile);
		console.log("________________")
		this.certificate.certificate = files[0];
	}

	inputFile(a){
		console.log(a);
	}
	ngOnDestroy(){
		if(this.abc){
			this.abc.unsubscribe();			
		}
	}
}