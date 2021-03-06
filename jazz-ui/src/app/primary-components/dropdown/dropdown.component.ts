/** 
  * @type Component 
  * @desc Generic dropdowns element
  * @author
*/

import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';


@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  @Input() dropdwnContent;
  @Input() selected;
  @Input() public statusFilter: Function;
  @Output() onSelected:EventEmitter<boolean> = new EventEmitter<boolean>();

  onDropdownClick(selected){
    this.onSelected.emit(selected)
    this.selected = selected;
  }
  onDropdownOpen(){
  }
  onDropdownClose(){
  }

  constructor() { }

  ngOnInit() {
  }

}
