import { Component,OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router'

@Component({
  selector: 'addStudent',
  templateUrl: '../dashboardStudent/dashboardStudent.html'
})

export class AddStudentComponent implements OnInit{
  public batchesStudents:any=[];
  public batchesCount:number=0;
  public numberOfStudents:number=0;
  public showBatchTable:boolean = false;

  constructor(private http:RestCallsComponent) {
		this.http.getAllBatchesForStudents({}).subscribe(
			(response)=>{
				console.log("Batches Count");
				this.batchesStudents = response.json();
				this.batchesCount = response.json().length;
				for(var i=0;i<response.json().length;i++){
					this.numberOfStudents += response.json()[i].studentCount;
				}
			},
			(error)=>console.log("Error in finding the Batches"));
  }
	ngOnInit(){
	}

}