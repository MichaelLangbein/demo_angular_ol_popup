import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MapComponent } from './components/map/map.component';
import { PopupComponent } from './components/popup/popup.component';
import { PopupContainerComponent } from './components/popup-container/popup-container.component';
import { DataService } from './services/data.service';
import { PopupService } from './services/popup.service';
import { SimpleChartComponent } from './components/simple-chart/simple-chart.component';
import { MapService } from './services/map.service';


@NgModule({
  declarations: [
    AppComponent,
    SimpleChartComponent,
    MapComponent,
    PopupComponent,
    PopupContainerComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [
    DataService,
    PopupService,
    MapService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
