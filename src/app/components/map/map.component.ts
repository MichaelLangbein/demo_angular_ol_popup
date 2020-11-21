import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, ComponentRef, ViewChildren, Type, QueryList, ContentChildren } from '@angular/core';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Map, View, Overlay } from 'ol';
import { PopupComponent } from '../popup/popup.component';
import { Coordinate } from 'ol/coordinate';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  @ViewChild('map') map: ElementRef;
  @ViewChild('popupContainer', { read: ViewContainerRef}) popupContainer: ViewContainerRef;
  private olMap: Map;

  constructor(
    private cfr: ComponentFactoryResolver
  ) { }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    const bg = new TileLayer({
      source: new OSM()
    });

    const view = new View({
      center: [15, 52],
      zoom: 6,
      projection: 'EPSG:4326'
    });

    const map = new Map({
      layers: [bg],
      target: this.map.nativeElement,
      view: view
    });

    map.on('singleclick', (evt) => {
      const coordinates = evt.coordinate;
      this.createPopup(PopupComponent, {content: `${coordinates}`}, coordinates);
    });

    this.olMap = map;
  }

  private createPopup(component: Type<any>, attrs: {[key: string]: any}, coordinates: Coordinate): void {
    const popupFactory = this.cfr.resolveComponentFactory(component);
    const newPopup = this.popupContainer.createComponent(popupFactory);
    for (const key in attrs) {
      newPopup.instance[key] = attrs[key];
    }

    const popupElement: ElementRef = newPopup.location;
    const overlay = new Overlay({
      autoPan: true,
      element: popupElement.nativeElement
    });
    overlay.setPosition(coordinates);
    this.olMap.addOverlay(overlay);
  }
}
