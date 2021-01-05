import { Injectable, Type } from "@angular/core";

import { Observable, BehaviorSubject, from, of } from 'rxjs';
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

export type PopupStrategy = 'single-popup' | 'one-per-click' | 'follow-cursor';


@Injectable()
export class PopupService {

  private popups$: BehaviorSubject<PopupData[]>;
  private strategy: PopupStrategy;

  constructor(
    private dataService: DataService,
    ) {
      this.popups$ = new BehaviorSubject<PopupData[]>([]);
      this.strategy = 'single-popup';
  }

  setStrategy(strategy: PopupStrategy): void {
    this.strategy = strategy;
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

  onPointerMove(layerId: string, feature: FeatureLike, coords: Coordinate, delay = 0): void {
    if (this.strategy === 'follow-cursor') {
      this.doAfterDebounce(delay, () => {

        const layerData = this.dataService.getLayer(layerId);
        if (layerData.popup) {
          const popup = this.createPopup(layerData, feature, coords);
          this.setPopups([popup]);
        }

      });
    }
  }

  onClick(layerId: string, feature: FeatureLike, coords: Coordinate): void {
    if (this.strategy === 'follow-cursor') {
      return;
    }

    const layerData = this.dataService.getLayer(layerId);
    if (layerData.popup) {

      const popup = this.createPopup(layerData, feature, coords);

      if (this.strategy === 'one-per-click') {
        this.addPopup(popup);
      } else if (this.strategy === 'single-popup') {
        this.setPopups([popup]);
      }
    }
  }

  private createPopup(layerData: LayerData, feature: FeatureLike, coords: Coordinate): PopupData {
    const popup: PopupData = {
      id: layerData.id + '_popup_' + Math.random() * 100000,
      bodyComponent: layerData.popup.bodyComponent,
      attrs: layerData.popup.featureToAttrs(feature, coords),
      coordinates: coords
    };

    return popup;
  }

  private doAfterDebounce(time: number, action: CallableFunction): void {
    of(1).pipe(
      debounceTime(time),
    ).subscribe(() => {
      action();
    });
  }
}
