import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MapComponent } from './components/map/map.component';
import { PopupComponent } from './components/popup/popup.component';
import { ColorComponent } from './components/color/color.component';
import { SimpleChartComponent } from './components/simple-chart/simple-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    PopupComponent,
    ColorComponent,
    SimpleChartComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
