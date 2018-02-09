import { Injectable } from '@angular/core';

@Injectable()

export class SideNavigationMenuList {
  constructor() {
  }

  navigationList: Array<Object> = [
    {
      "title": "Menu",
      "items": [
        {
          "url": "university/university-component",
          "icon": "sli-organization",
          "title": "Manage University/Institute",
          "items": [],
          "id": "university"
        },
/*        {
          "url": "institute/institute-component",
          "icon": "sli-layers",
          "title": "Manage Institute",
          "items": [],
          "id": "institute"
        },*/
        {
          "url": "#",
          "icon": "sli-people",
          "title": "Manage Users",
          "items": [
           {
               "url": "add/creator",
               "icon": "sli-notebook",
               "title": "Creator",
               "items": [],
               "id": "Creator"
             },
						{
  					 "url": "add/issuer",
  					 "icon": "sli-notebook",
  					 "title": "Issuer",
  					 "items": [],
  					 "id": "issuer"
  				 },
            {
              "url": "add/approver",
              "icon": "sli-check",
              "title": "Approver",
              "items": [],
              "id": "checker"
            }
          
						 ],
          "id": "users"
        }
      ]
    }];
  getNavigationItems(): Array<Object> {
    return this.navigationList;
  }
}
