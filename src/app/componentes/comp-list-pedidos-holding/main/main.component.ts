import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-tab-pedidos-holding',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainTabPedidosHoldingComponent implements OnInit {
  activeTab = 'pedidos-listos'; // Default tab

  constructor() { }

  ngOnInit(): void {
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
