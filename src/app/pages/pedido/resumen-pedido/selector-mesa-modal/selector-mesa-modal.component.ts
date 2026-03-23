import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface AreaMesa {
  titulo: string;
  prefijo_mesa: string;
  num_mesa_ini: number;
  num_mesa_fin: number;
  tipo_mesa: string;
  mesas: string[];
}

@Component({
  selector: 'app-selector-mesa-modal',
  templateUrl: './selector-mesa-modal.component.html',
  styleUrls: ['./selector-mesa-modal.component.css']
})
export class SelectorMesaModalComponent implements OnInit {
  areas: AreaMesa[] = [];
  selectedAreaIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<SelectorMesaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { areasMesas: any[] }
  ) {}

  ngOnInit(): void {
    this.generarMesas();
  }

  generarMesas(): void {
    if (!this.data.areasMesas || this.data.areasMesas.length === 0) {
      return;
    }

    this.areas = this.data.areasMesas.map((area: any) => {
      const mesas: string[] = [];
      const inicio = parseInt(area.num_mesa_ini, 10);
      const fin = parseInt(area.num_mesa_fin, 10);
      const prefijo = area.prefijo_mesa || '';

      for (let i = inicio; i <= fin; i++) {
        if (area.tipo_mesa === 'alfanumerica') {
          const numeroFormateado = i.toString().padStart(2, '0');
          mesas.push(`${prefijo}${numeroFormateado}`);
        } else {
          mesas.push(i.toString());
        }
      }

      return {
        titulo: area.titulo,
        prefijo_mesa: area.prefijo_mesa,
        num_mesa_ini: inicio,
        num_mesa_fin: fin,
        tipo_mesa: area.tipo_mesa,
        mesas: mesas
      };
    });
  }

  seleccionarMesa(mesa: string): void {
    this.dialogRef.close(mesa);
  }

  cerrarModal(): void {
    this.dialogRef.close();
  }

  cambiarTab(index: number): void {
    this.selectedAreaIndex = index;
  }
}
