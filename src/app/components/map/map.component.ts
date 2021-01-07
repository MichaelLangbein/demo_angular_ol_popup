import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Tile as TileLayer, Layer } from 'ol/layer';
import { OSM } from 'ol/source';
import { MapService } from '../../services/map.service';
import { PopupService } from 'src/app/services/popup.service';
import { DataService, LayerData } from 'src/app/services/data.service';
import { Map, View, Overlay, MapBrowserEvent } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import { FeatureLike } from 'ol/Feature';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  @ViewChild('map') map: ElementRef;

  constructor(
    private mapService: MapService,
    private popupService: PopupService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.initLayers();
    this.initPopups();
  }

  private initMap(): void {
    const bg = new TileLayer({
      source: new OSM()
    });

    const view = new View({
      center: [15, 52],
      zoom: 4,
      projection: 'EPSG:4326'
    });

    const map = new Map({
      layers: [bg],
      target: this.map.nativeElement,
      view: view
    });

    this.mapService.setMap(map);
  }

  private initLayers(): void {
    this.dataService.getLayers().subscribe((layers: LayerData[]) => {
      for (const layer of layers) {

        const olLayer = new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures(layer.features)
          })
        });
        olLayer.set('id',  layer.id);

        this.mapService.getMap().addLayer(olLayer);
      }
    });
  }

  private initPopups(): void {
    this.popupService.setStrategy('single-popup');

    this.mapService.getMap().on('click', (evt: MapBrowserEvent) => {
      const lnf = this.getLayerAndFeatureForEvent(evt);
      if (lnf) {
        this.popupService.onClick(lnf.l.get('id'), lnf.f, evt.coordinate);
      }
    });

    this.popupService.setPointerMoveDebounceTime(30);
    this.mapService.getMap().on('pointermove', (evt: MapBrowserEvent) => {
      const lnf = this.getLayerAndFeatureForEvent(evt);
      if (lnf) {
        this.popupService.onPointerMove(lnf.l.get('id'), lnf.f, evt.coordinate);
      }
    });
  }

  private getLayerAndFeatureForEvent(evt: MapBrowserEvent<UIEvent>): {l: Layer, f: FeatureLike} | null {
    const pixel = evt.pixel;
    let output = null;
    this.mapService.getMap().forEachFeatureAtPixel(pixel, (f: FeatureLike, l: Layer) => {
      output = { l, f };
    });
    return output;
  }
}
