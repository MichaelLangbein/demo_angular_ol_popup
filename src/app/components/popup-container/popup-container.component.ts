import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, AfterViewInit, Input, ViewRef } from '@angular/core';
import { PopupService, PopupData, LayerPopupData } from '../../services/popup.service';
import { PopupComponent } from '../popup/popup.component';
import { Map, Overlay } from 'ol';
import { MapService } from 'src/app/services/map.service';
import { stringify } from '@angular/compiler/src/util';



interface PopupBoundData {
  layerId: string;
  popupData: PopupData;
  popup: ComponentRef<PopupComponent>;
  overlay: Overlay;
}




/**
 * # PopupContainerComponent
 *
 * This container handles the display of popup-data in an ol-map.
 * It connects the `PopupService` with openlayers `Overlay`s.
 * It's tasks are:
 *  - listen to the `PopupService` for changes in the Popup-state
 *  - For each new popup,
 *    - create an angular `PopupComponent`
 *    - connect that component to openlayers using an `Overlay`
 *  - remove old popups both from openlayers and from angular
 */
@Component({
  selector: 'popups-popup-container',
  templateUrl: './popup-container.component.html',
  styleUrls: ['./popup-container.component.css']
})
export class PopupContainerComponent implements OnInit, AfterViewInit {

  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  private currentData: PopupBoundData[] = [];

  constructor(
    private cfr: ComponentFactoryResolver,
    private popupService: PopupService,
    private mapService: MapService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.popupService.getLayerPopupData().subscribe((layerPopupData: LayerPopupData[]) => {
console.log(layerPopupData)
      for (const layerData of layerPopupData) {

        // Checking what data to update and what to remove
        const currentIds = this.currentData.filter(d => d.layerId === layerData.layerId).map(d => d.popupData.id);
        const newIds = layerData.popupData.map(p => p.id);
        const newlyAdded = newIds.filter(id => !currentIds.includes(id));
        const obsolete = currentIds.filter(id => !newIds.includes(id));

        // removing obsolete popups
        for (const oldId of obsolete) {
          const oldData = this.currentData.find(d => d.layerId === layerData.layerId &&  d.popupData.id === oldId);
          this.removeOldData(oldData);
        }

        // adding new ones
        for (const newId of newlyAdded) {
          const newPopup = layerData.popupData.find(p => p.id === newId);
          this.addNewPopup(layerData.layerId, newPopup);
        }
      }


    });
  }

  private addNewPopup(layerId: string, newPopup: PopupData): void {
    const factory = this.cfr.resolveComponentFactory(PopupComponent);
    const popup: ComponentRef<PopupComponent> = this.container.createComponent(factory);
    popup.instance.bodyComponent = newPopup.bodyComponent;
    popup.instance.attrs = newPopup.attrs;
    popup.instance.id = newPopup.id;
    popup.instance.layerId = layerId;

    const overlay = new Overlay({
      element: popup.location.nativeElement,
      autoPan: true
    });
    overlay.setPosition(newPopup.coordinates);

    this.mapService.getMap().addOverlay(overlay);

    this.currentData.push({
      layerId: layerId,
      popupData: newPopup,
      popup: popup,
      overlay: overlay
    });
  }

  private removeOldData(oldData: PopupBoundData): void {
    this.mapService.getMap()
      .removeOverlay(oldData.overlay);
    this.container.remove(
      this.container.indexOf(oldData.popup.hostView));

      this.currentData = this.currentData.filter(cd => cd.popupData.id !== oldData.popupData.id);
  }

}
