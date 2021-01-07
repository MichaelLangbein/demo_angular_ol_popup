import { Component, OnInit, Input, Type, ViewChild, ViewContainerRef, ComponentFactoryResolver, AfterViewInit } from '@angular/core';
import { PopupService } from '../../services/popup.service';


/**
 * # PopupComponent
 *
 * This component is a generic wrapper around a popup-body.
 *
 * Tasks:
 *  - It is used by the `PopupContainerComponent`.
 *  - Using this component, all UKIS popups look alike.
 *  - It contains an arbitrary angular-component that it renders as the popup-body.
 *  - It passes a click on the `X` button on to the `PopupService`
 */
@Component({
  selector: 'popups-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit, AfterViewInit {

  @Input() bodyComponent: Type<any>;
  @Input() attrs: {[key: string]: any};
  @Input() id: string;
  @Input() layerId: string;
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;

  constructor(
    private cfr: ComponentFactoryResolver,
    private popupService: PopupService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const factory = this.cfr.resolveComponentFactory(this.bodyComponent);
    const component = this.container.createComponent(factory);
    for (const key in this.attrs) {
      component.instance[key] = this.attrs[key];
    }
  }

  closerClicked(): void {
    this.popupService.closePopup(this.layerId, this.id);
  }

}
