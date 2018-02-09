import { Component,OnInit } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService"

@Component({
	selector: 'choose-upload-method',
	templateUrl: './certificateUploadDecision.html'
})

export class  DecideUploadMethod implements OnInit {

public receivedBatchInfo:any = {};
constructor(private route:Router,private transfer:DataTransferService){

}
ngOnInit(){
	console.log("DecideUploadMethod :Certificate Upload Decision")
	this.receivedBatchInfo = this.transfer.getBatch();
}
uploadManually = function(){
	this.route.navigate(['see/students']);
}
throughFileUpload = function(){
	console.log("manual addition Selected");
	this.route.navigate(['massUpload/certificate']);
}
}