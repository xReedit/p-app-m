import { Component } from '@angular/core';

@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.css']
})
export class MarcasComponent {
  
  constructor() { }

  ngOnInit() {
    console.log('llega a marcas');
  }
}
