import { Injectable, Type } from "@angular/core";

import { Observable, BehaviorSubject, from, of, Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

import { MapBrowserEvent } from 'ol';
import { FeatureLike } from 'ol/Feature';
import { Layer } from 'ol/layer';
import { Coordinate } from 'ol/coordinate';

import { DataService, LayerData } from './data.service';
import { MapService } from './map.service';


export interface PopupData {
  coordinates: Coordinate;
  attrs: { [key: string]: any; };
  bodyComponent: Type<any>;
  id: string;
}

/**
 * - `single-popup`: There is always only one popup. Upon a left-click, the old popup is removed and a new one is placed over the clicked location.
 * - `one-per-click`: For each click, a new popup is created. Allows user to compare popups side-by-side. The user has to manually close the popups.
 * - `follow-cursor`: A popup follows the user's cursor around the map. This is done by regenerating a popup on every move. (Consider calling `setPointerMoveDebounceTime`)
 */
export type PopupStrategy = 'single-popup' | 'one-per-click' | 'follow-cursor';

/**
 * # PopupService
 *
 * 
 */
@Injectable()
export class PopupService {

  private popups$: BehaviorSubject<PopupData[]>;
  private actionQueue$: BehaviorSubject<CallableFunction>;
  private actionQueueSub: Subscription;
  private strategy: PopupStrategy;

  constructor(
    private dataService: DataService,
    ) {
      this.popups$ = new BehaviorSubject<PopupData[]>([]);
      this.actionQueue$ = new BehaviorSubject<CallableFunction>(() => {});
      this.actionQueueSub = this.actionQueue$.pipe(debounceTime(50)).subscribe((action: CallableFunction) => action());
      this.strategy = 'single-popup';
  }

  /**
   * Configure how popups should be displayed on a map
   */
  setStrategy(strategy: PopupStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Configure how often a popup should be re-rendered when it follows the cursor
   * (Try to find a compromise between smooth user-experience and app-performance)
   */
  setPointerMoveDebounceTime(milliseconds: number) {
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
    if (this.strategy === 'follow-cursor') {
      this.actionQueue$.next(() => { // <-- using actionQueue$ for debounce

        const layerData = this.dataService.getLayer(layerId);
        if (layerData.popup) {
          const popup = this.createPopupData(layerData, feature, coords);
          this.setPopups([popup]);
        }

      });
    }
  }

  /**
   * Displays a popup for a given feature upon click - but only if the strategy has been set to `single-popup` or `one-per-click`.
   * Call this method any time a click-event has occurred over a feature.
   */
  onClick(layerId: string, feature: FeatureLike, coords: Coordinate): void {
      const layerData = this.dataService.getLayer(layerId);
      if (layerData.popup) {

        const popup = this.createPopupData(layerData, feature, coords);


        if (this.strategy === 'one-per-click') {
          this.addPopup(popup);
        } else if (this.strategy === 'single-popup') {
          this.setPopups([popup]);
        }
      }
  }

  closePopup(id: string): void {
    const popups = this.popups$.getValue().filter(p => p.id !== id);
    this.popups$.next(popups);
  }

  addPopup(newPopup: PopupData): void {
      const popups = this.popups$.getValue();
      popups.push(newPopup);
      this.popups$.next(popups);
  }

  setPopups(newPopups: PopupData[]): void {
    this.popups$.next(newPopups);
  }

  getPopups(): Observable<PopupData[]> {
      return this.popups$;
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
