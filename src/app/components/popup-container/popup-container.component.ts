import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, AfterViewInit, Input, ViewRef } from '@angular/core';
import { PopupService, PopupData } from '../../services/popup.service';
import { PopupComponent } from '../popup/popup.component';
import { Map, Overlay } from 'ol';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'popups-popup-container',
  templateUrl: './popup-container.component.html',
  styleUrls: ['./popup-container.component.css']
})
export class PopupContainerComponent implements OnInit, AfterViewInit {

  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;

  constructor(
    private cfr: ComponentFactoryResolver,
    private popupService: PopupService,
    private mapService: MapService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.popupService.getPopups().subscribe((popups: PopupData[]) => {

      // Todo: differentiate between new popups, updated popups, removed popups
      // const oldPopups = [];
      // for (let i = 0; i < this.container.length; i++) {
      //   const oldPopup: ViewRef = this.container.get(i);
      //   oldPopup.
      //   oldPopups.push(this.container.get(i));
      // }

      this.container.clear();
      for (const popup of popups) {
        this.addPopup(popup);
      }
    });
  }

  addPopup(popupData: PopupData): void {
    const factory = this.cfr.resolveComponentFactory(PopupComponent);
    const popup: ComponentRef<PopupComponent> = this.container.createComponent(factory);
    popup.instance.bodyComponent = popupData.bodyComponent;
    popup.instance.attrs = popupData.attrs;
    popup.instance.id = popupData.id;

    const overlay = new Overlay({
      element: popup.location.nativeElement,
      autoPan: true
    });
    overlay.setPosition(popupData.coordinates);

    this.mapService.getMap().addOverlay(overlay);
  }

}
