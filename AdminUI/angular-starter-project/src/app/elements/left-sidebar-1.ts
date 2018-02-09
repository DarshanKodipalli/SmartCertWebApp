import { Component } from '@angular/core';
import { SideNavigationMenuList } from '../services/sideNavigation'

@Component({
  selector: 'left-sidebar-1',
  templateUrl: '../elements/left-sidebar-1.html'
})

export class LeftSidebar1Component {

  navigation:Array<Object>;
  constructor(private sideNavi:SideNavigationMenuList) {
  	this.navigation = sideNavi.getNavigationItems();
  }
}
