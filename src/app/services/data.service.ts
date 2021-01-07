import { Injectable, Type } from '@angular/core';
import { of, Observable } from 'rxjs';
import { SimpleChartComponent } from '../components/simple-chart/simple-chart.component';
import { FeatureLike } from 'ol/Feature';
import { layer1Data, layer2Data, layer3Data } from './data';
import { Coordinate } from 'ol/coordinate';
import { PopupStrategy } from './popup.service';


export interface PopupInstructions {
  strategy: PopupStrategy;
  bodyComponent: Type<any>;
  featureToAttrs: (f: FeatureLike, c: Coordinate) => {[key: string]: any};
}


export interface LayerData {
  id: string;
  features: string | object | Element | ArrayBuffer | Document;
  popup?: PopupInstructions;
}


@Injectable()
export class DataService {

  private layers: LayerData[] = [{
    id: 'Layer 1',
    features: layer1Data,
    popup: {
      strategy: 'single-popup',
      bodyComponent: SimpleChartComponent,
      featureToAttrs: (f: FeatureLike, c: Coordinate) => {
        return {
          data: f.getProperties()['data']
        };
      }
    }
  }, {
    id: 'Layer 2',
    features: layer2Data,
    popup: {
      strategy: 'follow-cursor',
      bodyComponent: SimpleChartComponent,
      featureToAttrs: (f: FeatureLike, c: Coordinate) => {
        return {
          data: f.getProperties()['data']
        };
      }
    }
  }, {
    id: 'Layer 3',
    features: layer3Data,
    popup: {
      strategy: 'one-per-click',
      bodyComponent: SimpleChartComponent,
      featureToAttrs: (f: FeatureLike, c: Coordinate) => {
        return {
          data: f.getProperties()['data']
        };
      }
    }
  }];

  getLayers(): Observable<LayerData[]> {
    return of(this.layers);
  }

  getLayer(layerId: string) {
    return this.layers.find(l => l.id === layerId);
  }

  constructor() { }
}
