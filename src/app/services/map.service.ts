import { Injectable } from "@angular/core";
import { Map } from 'ol';

@Injectable()
export class MapService {

  private map: Map;

  setMap(map: Map): void {
    this.map = map;
  }

  getMap(): Map {
    return this.map;
  }
}