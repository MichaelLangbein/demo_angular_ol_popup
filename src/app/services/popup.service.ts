import { Injectable, Type } from "@angular/core";

import { Observable, BehaviorSubject, from, of, Subscription } from 'rxjs';
import { debounceTime, tap, map } from 'rxjs/operators';

import { MapBrowserEvent } from 'ol';
import { FeatureLike } from 'ol/Feature';
import { Layer } from 'ol/layer';
import { Coordinate } from 'ol/coordinate';

import { DataService, LayerData } from './data.service';
import { MapService } from './map.service';



/**
 * - `single-popup`: There is always only one popup. Upon a left-click, the old popup is removed and a new one is placed over the clicked location.
 * - `one-per-click`: For each click, a new popup is created. Allows user to compare popups side-by-side. The user has to manually close the popups.
 * - `follow-cursor`: A popup follows the user's cursor around the map. This is done by regenerating a popup on every move. (Consider calling `setPointerMoveDebounceTime`)
 */
export type PopupStrategy = 'single-popup' | 'one-per-click' | 'follow-cursor';

export interface PopupData {
  coordinates: Coordinate;
  attrs: { [key: string]: any; };
  bodyComponent: Type<any>;
  id: string;
}

/**
 * Each layer has it's own Popup-Strategy
 */
export interface LayerPopupData {
  strategy: PopupStrategy;
  layerId: string;
  popupData: PopupData[];
}


/**
 * # PopupService
 */
@Injectable()
export class PopupService {

  private layerPopupData$: BehaviorSubject<LayerPopupData[]>;
  private actionQueue$: BehaviorSubject<CallableFunction>;
  private actionQueueSub: Subscription;

  constructor(
    private dataService: DataService,
    ) {

      this.layerPopupData$ = new BehaviorSubject<LayerPopupData[]>([]);
      this.dataService.getLayers().subscribe((layers: LayerData[]) => {
        const popups: LayerPopupData[] = [];
        for (const layer of layers) {
          if (layer.popup) {
            popups.push({
              layerId: layer.id,
              strategy: layer.popup.strategy,
              popupData: []
            });
          }
        }
        this.setPopups(popups);
      });


      this.actionQueue$ = new BehaviorSubject<CallableFunction>(() => {});
      this.actionQueueSub = this.actionQueue$.pipe(debounceTime(50)).subscribe((action: CallableFunction) => action());
  }


  /**
   * Configure how often a popup should be re-rendered when it follows the cursor
   * (Try to find a compromise between smooth user-experience and app-performance)
   */
  setPointerMoveDebounceTime(milliseconds: number): void {
    this.actionQueueSub.unsubscribe();
    this.actionQueueSub = this.actionQueue$.pipe(debounceTime(milliseconds)).subscribe((action: CallableFunction) => action());
  }

  /**
   * Displays a popup for a given feature upon pointer-movement - but only if the strategy has been set to `follow-cursor`.
   * Call this method any time a pointer-move-event has occurred over a feature.
   *
   * *Note*: consider calling `setPointerMoveDebounceTime` to fine-tune the performance of pointer-move-popups.
   */
  onPointerMove(layerId: string, feature: FeatureLike, coords: Coordinate): void {
    const layerPopupData = this.layerPopupData$.getValue().find(pd => pd.layerId === layerId);
    if (layerPopupData.strategy === 'follow-cursor') {
      this.actionQueue$.next(() => { // <-- using actionQueue$ for debounce

        const layerData = this.dataService.getLayer(layerId);
        if (layerData.popup) {
          const popup = this.createPopupData(layerData, feature, coords);
          this.setLayerPopups(layerId, [popup]);
        }

      });
    }
  }

  /**
   * Displays a popup for a given feature upon click - but only if the strategy has been set to `single-popup` or `one-per-click`.
   * Call this method any time a click-event has occurred over a feature.
   */
  onClick(layerId: string, feature: FeatureLike, coords: Coordinate): void {
      const layerPopupData = this.layerPopupData$.getValue().find(d => d.layerId === layerId);

      if (layerPopupData.strategy === 'follow-cursor'){
        return;
      } else {
        const layerData = this.dataService.getLayer(layerId);
        const popup = this.createPopupData(layerData, feature, coords);

        if (layerPopupData.strategy === 'one-per-click') {
          this.addLayerPopup(layerId, popup);
        }
        else if (layerPopupData.strategy === 'single-popup') {
          this.setLayerPopups(layerId, [popup]);
        }
      }

  }

  closePopup(layerId: string, popupId: string): void {
    const layerData = this.layerPopupData$.getValue().find(p => p.layerId === layerId);
    const newPopupData = layerData.popupData.filter(d => d.id !== popupId);
    this.setLayerPopups(layerId, newPopupData);
  }

  addLayerPopup(layerId: string, newPopup: PopupData): void {
      const popups = this.layerPopupData$.getValue();
      popups.find(p => p.layerId === layerId).popupData.push(newPopup);
      this.layerPopupData$.next(popups);
  }

  setPopups(newPopups: LayerPopupData[]): void {
    this.layerPopupData$.next(newPopups);
  }

  setLayerPopups(layerId: string, popups: PopupData[]): void {
    const layerPopupData = this.layerPopupData$.getValue();
    layerPopupData.find(l => l.layerId === layerId).popupData = popups;
    this.setPopups(layerPopupData);
  }

  getLayerPopupData(): Observable<LayerPopupData[]> {
      return this.layerPopupData$;
  }

  getLayerPopups(layerId: string): Observable<PopupData[]> {
    return this.layerPopupData$.pipe(
      map((layerPopupData: LayerPopupData[]) => {
        return layerPopupData.find(lp => lp.layerId === layerId).popupData;
      })
    );
  }

  private createPopupData(layerData: LayerData, feature: FeatureLike, coords: Coordinate): PopupData {
    const popup: PopupData = {
      id: layerData.id + '_popup_' + Math.random() * 100000,
      bodyComponent: layerData.popup.bodyComponent,
      attrs: layerData.popup.featureToAttrs(feature, coords),
      coordinates: coords
    };

    return popup;
  }

}
