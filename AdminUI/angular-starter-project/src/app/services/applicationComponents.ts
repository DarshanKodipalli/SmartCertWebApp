import { Injectable } from '@angular/core';

@Injectable()

export class ApplicationComponents{
	constructor(){
	}
	getUrlAndPort(){
		// return "http://"+location.hostname+":"+3000;
		//  return "http://"+location.hostname+":"+3005;
		return "https://56.68.95.151:3010";
//		return "https://58.68.95.151:3000"; 

	}
	getIssuerUrlAndPort(){
		//return "http://58.68.95.151:3001";
		return "https://58.68.95.151:3001";
	}
}
