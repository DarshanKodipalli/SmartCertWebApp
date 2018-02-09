import { Component } from '@angular/core';
import { HttpService } from '../../services/HttpService';

@Component({
  selector: 'certificates',
  templateUrl: './certificates.html'
})

export class CertificateComponent {

	public certificates:any = [];

    constructor(private http:HttpService) {
  	this.http.getCertificates(JSON.parse(localStorage.getItem("login"))).
    subscribe(
      (response)=>{
        if(!response.json().status)
          this.certificates = response.json();
        else{
          if(response.json().status === -2){
            
          }
        }
      },
      (error)=>{
        console.log(error);
        console.log("certificate constructor");
      });
  }
    viewCertificate(a){
    console.log(a);
    this.http.viewUploadedDoc({token:JSON.parse(localStorage.getItem("login")).token,id:this.certificates[a].certificateHashkey}).subscribe(
      (response)=>{
              console.log(response);
              var resp:any = response;
              console.log(resp);
              //console.log(response.arrayBuffer());
              var file = new Blob([resp.json()],{type:'application/pdf'});
                 // var file = response.blob();
                  var fileUrl = URL.createObjectURL(file);
                window.open(fileUrl);
/*              var res:any = response;
              let blob:Blob = response.blob();
              saveAs(blob,"abc.pdf");*/
                  },
      (error)=>console.log(error));
  }

}