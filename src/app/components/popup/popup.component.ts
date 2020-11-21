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

    // The fact that the background color is dynamically updated proves that
    // this component is not detached from Angular's update-cycle.
    this.cs.color.subscribe((c) => {
      this.backgroundColor = c;
    });
  }

}
