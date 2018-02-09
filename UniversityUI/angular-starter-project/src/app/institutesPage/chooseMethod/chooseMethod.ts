import { Component,OnInit } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService";

@Component({
	selector: 'app-choose-upload',
	templateUrl: './chooseMethod.html'
})

export class  ChooseCertificateMethod implements OnInit {

public receivedBatchInfo:any = {};
public receivedStudent:any = {};
constructor(
	private route:Router,
	private transfer:DataTransferService){

}
ngOnInit(){
	this.receivedStudent = this.transfer.getStudent();
	this.receivedBatchInfo = this.transfer.getBatch();
}
fileUploadAdditionSelected = function(){
		this.route.navigate(['upload/certificatesIndividually']);
}
manualAdditionSelected = function(){
	console.log("manual addition Selected");
	this.route.navigate(['create/Certificate']);
}
}