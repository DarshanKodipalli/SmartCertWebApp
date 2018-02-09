import { Injectable} from '@angular/core';

@Injectable()
export class NavigationItems {

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
				"url":"transaction/transactionPage",
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
				"url":"addStudents/addStudentsUniversity",
				"icon":"sli-people",
				"title":"Students",
				"items":[],
				"id":"students"
			}]
		}
	];

	getItems():Array<Object>{
		console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:")
	  	console.log(JSON.parse(localStorage.getItem("universityUserInfo")));
		if(JSON.parse(localStorage.getItem("universityUserInfo"))[0].role === "1"){//if he is an approver
			return this.navigationListForIssuer;
		}else if(JSON.parse(localStorage.getItem("universityUserInfo"))[0].role === "2"){
			return this.navigationListForChecker;			
		}else{
			return this.navigationListForStudentAdder;
		}
	}
}