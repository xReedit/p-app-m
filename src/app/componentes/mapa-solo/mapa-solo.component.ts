import { Component, OnInit, Input } from '@angular/core';

declare var google: any;

@Component({
  selector: 'app-mapa-solo',
  templateUrl: './mapa-solo.component.html',
  styleUrls: ['./mapa-solo.component.css']
})
export class MapaSoloComponent implements OnInit {

  @Input() origin: any;
  @Input() destination: any;

  displayDirections = true;
  zoom = 20;

  constructor() { }

  ngOnInit() {
    this.zoom = 20;
    console.log('origin from solo mapa', this.origin);
  }



}