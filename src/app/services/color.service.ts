import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  public color = new BehaviorSubject<string>('lightgrey');

  constructor() { }

  colorSelected(color: string): void {
    this.color.next(color);
  }
}
