import { Component } from '@angular/core';
import { PopupStrategy, PopupService } from './services/popup.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'olPopups';

  constructor(private popupService: PopupService) {}

}
