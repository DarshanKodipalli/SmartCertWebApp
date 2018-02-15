import { Injectable } from '@angular/core';

@Injectable()

export class ApplicationComponents{
	constructor(){
	}
	getUrlAndPort(){
		// return "http://"+location.hostname+":"+3000;
		//  return "http://"+location.hostname+":"+3005;
		return "https://localhost:3010";
//		return "https://localhost:3000"; 

	}
	getIssuerUrlAndPort(){
		//return "http://localhost:3001";
		return "https://localhost:3001";
	}
}
