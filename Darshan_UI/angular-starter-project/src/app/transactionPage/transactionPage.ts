import { Component } from '@angular/core';
import { RestCallsComponent } from '../services/httpServices';

@Component({
  selector: 'transactionPage',
  templateUrl:"../transactionPage/transactionPage.html" 
})
export class TransactionPageComponent {
  constructor(private htt:RestCallsComponent) {  	
  }
  viewDocument(){
  	this.htt.downLoadDoc({token: "c9c618285a87df7a2b11e80e5f78aaec", survey:{id:21}}).subscribe(
  		(response)=>{
  			console.log(response.arrayBuffer());
        var file = new Blob([response.arrayBuffer()],{type:'application/pdf'});
        var fileUrl = URL.createObjectURL(file);
        window.open(fileUrl);
  		},
  		(error)=>console.log("error in downloading the document"));
  }
}
