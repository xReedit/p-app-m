import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

// Invitacion (una sola vez, app de escritorio) a usar este equipo como punto de toma de pedidos.
// Cierra con true = aceptar, false = ahora no. Lo abre main.component.
@Component({
  selector: 'app-dialog-invitar-punto',
  templateUrl: './dialog-invitar-punto.component.html',
  styleUrls: ['./dialog-invitar-punto.component.css'],
})
export class DialogInvitarPuntoComponent {
  readonly pasos = [
    { icono: 'fa-pencil-square-o', titulo: 'Anota en la mesa', texto: 'El mozo toma el pedido del cliente como siempre, en su libreta.' },
    { icono: 'fa-user-circle', titulo: 'Entra con su nombre', texto: 'Viene a esta computadora, toca su nombre y marca su clave.' },
    { icono: 'fa-cutlery', titulo: 'Ingresa y envía', texto: 'Busca los platos, indica la mesa y envía el pedido a cocina.' },
    { icono: 'fa-lock', titulo: 'Se cierra solo', texto: 'Al terminar, o sin uso por unos segundos, vuelve a la lista de mozos.' },
  ];

  constructor(private dialogRef: MatDialogRef<DialogInvitarPuntoComponent, boolean>) { }

  responder(acepta: boolean): void {
    this.dialogRef.close(acepta);
  }
}
