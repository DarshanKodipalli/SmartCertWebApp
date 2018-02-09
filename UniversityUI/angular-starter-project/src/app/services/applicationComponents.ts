import { Injectable } from '@angular/core';

@Injectable()

export class ApplicationComponents{
	constructor(){
	}

	getUrlAndPortForUniversity(){
		//return "https://192.168.0.36:3001";
		return "https://56.68.95.151:3001";
	}
	getUrlAndPortForStudent(){
		//return "https://192.168.0.36:3003";
		return "https://56.68.95.151:3004";
	}
	getUrlAndPortForBlockchainIssuer(){
		return "https://localhost:3008";
	}
	getUrlAndPortForApplicationAdmin(){
		return "https://56.68.95.151:3010";
	}	
	getUrlAndPortForConsumer(){
//		return "https://192.168.0.36:3002"
		return "https://58.68.95.151:3002";
	}
}