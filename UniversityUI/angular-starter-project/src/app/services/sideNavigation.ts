import { Injectable} from '@angular/core';

@Injectable()
export class NavigationItems {

	private role:any = "";

	setRole(arg){
		this.role = arg;
	}
	navigationListForIssuer : Array<Object> = [	
		{
			"title":"Menu",
			"items": [
			{
				"url":"dashboard/dashboardPage",
				"icon":"sli-chart",
				"title":"Dashboard",
				"items":[],
				"id":"dashboard"
			},
			{
				"url":"institute/institutesPage",
				"icon":"sli-home",
				"title":"Institutions",
				"items":[],
				"id":"institutes"
			},
			{
				"url":"certificate/certificatePage",
				"icon":"sli-layers",
				"title":"Certificates",
				"items":[],
				"id":"certificates"
			},
			{
				"url":"viewTransaction/batches",
				"icon":"sli-wallet",
				"title":"Transactions",
				"items":[],
				"id":"transactions"
			},
			{
				"url":"help/helpPage",
				"icon":"sli-info",
				"title":"Help Desk",
				"items":[],
				"id":"help"
			}]
		}

	];
	navigationListForChecker : Array<Object> = [	
		{
			"title":"Menu",
			"items": [
			{
				"url":"dashboardApprover/dashboardPageApprover",
				"icon":"sli-chart",
				"title":"Dashboard",
				"items":[],
				"id":"dashboard"
			},
			{
				"url":"certificateToBeSigned/certificatePage",
				"icon":"sli-layers",
				"title":"Certificates",
				"items":[],
				"id":"certificates"
			},
			{
				"url":"approved/batches",
				"icon":"sli-check",
				"title":"Verified Certificates",
				"items":[],
				"id":"approvedCertificates"

			}]
		}
	];
	navigationListForStudentAdder : Array<Object> = [	
		{
			"title":"Menu",
			"items": [
			{
				"url":"dashboardAdder/dashboardPageAdder",
				"icon":"sli-chart",
				"title":"Dashboard",
				"items":[],
				"id":"dashboard"
			},
			{
				"url":"view/StudentBatches",
				"icon":"sli-people",
				"title":"Students",
				"items":[],
				"id":"students"
			},
			{
				"url":"/courses/add",
				"icon":"sli-notebook",
				"title":"Courses",
				"items":[],
				"id":"course"
			}]
		}
	];
	constructor() {
		if(JSON.parse(localStorage.getItem("login")))
			this.role = JSON.parse(localStorage.getItem("login")).role;
  	}

	getItems():Array<Object>{
		if(this.role === "1"){

			return this.navigationListForIssuer;
		}
		else if(this.role === "2"){
			return this.navigationListForChecker;			
		}
		else{
			return this.navigationListForStudentAdder;
		}
		
	}
}