import { Component, OnInit, Input } from '@angular/core';
import { ColorService } from 'src/app/services/color.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {

  @Input() content: string;
  backgroundColor = 'blue';

  constructor(
    private cs: ColorService
  ) { }

  ngOnInit(): void {
    this.cs.color.subscribe((c) => {
      this.backgroundColor = c;
    });
  }

}
