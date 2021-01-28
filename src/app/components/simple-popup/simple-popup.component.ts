import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-simple-popup',
  templateUrl: './simple-popup.component.html',
  styleUrls: ['./simple-popup.component.css']
})
export class SimplePopupComponent implements OnInit {
  @Input() data: number[];
  constructor() { }

  ngOnInit(): void {
  }

}
