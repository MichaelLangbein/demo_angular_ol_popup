import { Component, OnInit } from '@angular/core';
import { ColorService } from '../../services/color.service';

@Component({
  selector: 'app-color',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.css']
})
export class ColorComponent implements OnInit {

  constructor(
    private cs: ColorService
  ) {}

  ngOnInit(): void {
  }

  buttonClicked(color: string) {
    this.cs.colorSelected(color);
  }

}
