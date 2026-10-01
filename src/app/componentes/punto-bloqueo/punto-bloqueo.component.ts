import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EstadoPunto, MozoPunto, PuntoTomaPedidosService } from 'src/app/shared/services/punto-toma-pedidos.service';
import { colorMozo, esClaveNuevaValida, inicialesMozo, SEGUNDOS_AVISO_CIERRE } from 'src/app/shared/config/punto-toma-pedidos';
import { IS_TAURI } from 'src/app/shared/config/config.const';
import { ActualizacionEscritorioService } from 'src/app/shared/services/actualizacion-escritorio.service';
import { alternarPantallaCompleta, esPantallaCompleta } from 'src/app/shared/config/pantalla-completa';

type Paso = 'lista' | 'clave' | 'clave-actual' | 'clave-nueva' | 'clave-repetir';

const TITULOS: Record<Exclude<Paso, 'lista'>, string> = {
  'clave': 'Ingresa tu clave',
  'clave-actual': 'Cambiar clave: ingresa tu clave actual',
  'clave-nueva': 'Nueva clave de 4 números',
  'clave-repetir': 'Repite la nueva clave',
};

// Pantalla completa del punto de toma de pedidos: elegir mozo, clave, cambio de clave y aviso por inactividad.
// Solo se monta cuando el punto esta activo (ver main.component.html).
@Component({
  selector: 'app-punto-bloqueo',
  templateUrl: './punto-bloqueo.component.html',
  styleUrls: ['./punto-bloqueo.component.css'],
})
export class PuntoBloqueoComponent implements OnInit, OnDestroy {
  estado: EstadoPunto = { bloqueado: false, cancelable: false };
  aviso: number | null = null;
  readonly segundosAviso = SEGUNDOS_AVISO_CIERRE;

  mozos: MozoPunto[] = [];
  cargandoMozos = true;
  filtro = '';
  paso: Paso = 'lista';
  mozo: MozoPunto = null;
  nombreMozoActual = '';

  clave = '';
  error = '';
  exito = '';
  enviando = false;
  sacudir = false;
  readonly teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  private claveActual = '';
  private claveNueva = '';
  private destroy$ = new Subject<void>();

  constructor(
    public punto: PuntoTomaPedidosService,
    public actualizacion: ActualizacionEscritorioService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.punto.estado$.pipe(takeUntil(this.destroy$)).subscribe(e => {
      const seAbre = e.bloqueado && !this.estado.bloqueado;
      this.estado = e;
      if (seAbre) { this.abrirLista(); }
    });
    this.punto.aviso$.pipe(takeUntil(this.destroy$)).subscribe(s => this.aviso = s);
    this.punto.nombreMozo$.pipe(takeUntil(this.destroy$)).subscribe(n => this.nombreMozoActual = n);
    if (this.estado.bloqueado) { this.abrirLista(); }
    this.onResize(); // estado real del boton de pantalla completa
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get mozosFiltrados(): MozoPunto[] {
    const f = this.filtro.trim().toLowerCase();
    return f ? this.mozos.filter(m => (m.nombres || '').toLowerCase().includes(f)) : this.mozos;
  }

  get titulo(): string { return this.paso === 'lista' ? '' : TITULOS[this.paso]; }
  get esCambioClave(): boolean { return this.paso !== 'lista' && this.paso !== 'clave'; }
  get soloNumeros(): boolean { return this.paso === 'clave-nueva' || this.paso === 'clave-repetir'; }
  get puntos(): number[] { return Array.from({ length: Math.max(4, this.clave.length) }, (_, i) => i); }

  iniciales = inicialesMozo;
  color = colorMozo;

  // solo app de escritorio (Windows / Mac); en celular y web no se muestra
  readonly isEscritorio = IS_TAURI;
  isPantallaCompleta = false;

  pantallaCompleta(): void {
    alternarPantallaCompleta().then(v => this.isPantallaCompleta = v).catch(() => {});
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isEscritorio) { return; }
    esPantallaCompleta().then(v => this.isPantallaCompleta = v).catch(() => {});
  }

  private abrirLista(): void {
    this.paso = 'lista';
    this.filtro = '';
    this.limpiar();
    this.cargandoMozos = true;
    this.punto.listarMozos().subscribe(({ mozos, cargo }) => {
      this.mozos = mozos;
      this.cargandoMozos = false;
      if (mozos.length > 0) { return; }
      // nunca dejar la pantalla sin salida:
      // sin lista (sesion vencida o sin red) -> login; la sede no tiene mozos -> pantalla normal
      if (!cargo) {
        this.router.navigate(['/login-personal-autorizado']);
      } else {
        this.punto.volverAlMozoActual();
      }
    });
  }

  elegir(mozo: MozoPunto): void {
    this.mozo = mozo;
    this.irA('clave');
  }

  noSoyYo(): void {
    this.mozo = null;
    this.paso = 'lista';
    this.limpiar();
  }

  iniciarCambioClave(): void {
    this.exito = '';
    this.irA('clave-actual');
  }

  cancelarCambioClave(): void {
    this.irA('clave');
  }

  teclear(t: string): void {
    if (this.enviando) { return; }
    if (this.soloNumeros && (!/^\d$/.test(t) || this.clave.length >= 4)) { return; }
    if (this.clave.length >= 20) { return; }
    this.error = '';
    this.clave += t;
    if (this.soloNumeros && this.clave.length === 4) { this.confirmar(); }
  }

  borrar(): void {
    this.error = '';
    this.clave = this.clave.slice(0, -1);
  }

  confirmar(): void {
    if (!this.clave || this.enviando) { return; }
    switch (this.paso) {
      case 'clave': return this.entrar();
      case 'clave-actual':
        this.claveActual = this.clave;
        return this.irA('clave-nueva');
      case 'clave-nueva':
        if (!esClaveNuevaValida(this.clave)) { return this.fallo('La clave debe tener 4 números'); }
        this.claveNueva = this.clave;
        return this.irA('clave-repetir');
      case 'clave-repetir':
        if (this.clave !== this.claveNueva) {
          this.claveNueva = '';
          this.paso = 'clave-nueva';
          return this.fallo('Las claves no coinciden, ingrésala de nuevo');
        }
        return this.guardarClaveNueva();
    }
  }

  private entrar(): void {
    this.enviando = true;
    this.punto.entrar(this.mozo, this.clave).subscribe(err => {
      this.enviando = false;
      if (err) { return this.fallo(err); }
      this.limpiar();
    });
  }

  private guardarClaveNueva(): void {
    this.enviando = true;
    const claveNueva = this.claveNueva;
    this.punto.cambiarClave(this.mozo.usuario, this.claveActual, claveNueva).subscribe(err => {
      if (err) {
        this.enviando = false;
        this.paso = 'clave-actual';
        return this.fallo(err);
      }
      this.exito = '¡Clave cambiada!';
      // entra solo con la clave nueva
      setTimeout(() => this.punto.entrar(this.mozo, claveNueva).subscribe(errLogin => {
        this.enviando = false;
        this.exito = '';
        if (errLogin) { this.irA('clave'); this.fallo(errLogin); } else { this.limpiar(); }
      }), 1200);
    });
  }

  private irA(paso: Paso): void {
    this.paso = paso;
    this.clave = '';
    this.error = '';
  }

  private fallo(mensaje: string): void {
    this.error = mensaje;
    this.clave = '';
    this.sacudir = true;
    setTimeout(() => this.sacudir = false, 450);
  }

  private limpiar(): void {
    this.clave = '';
    this.error = '';
    this.claveActual = '';
    this.claveNueva = '';
    this.enviando = false;
  }

  // teclado fisico: numeros (y letras en la clave actual, por si alguna tiene), borrar, enter, escape
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.estado.bloqueado || this.paso === 'lista') { return; }
    if (e.key === 'Enter') { e.preventDefault(); return this.confirmar(); }
    if (e.key === 'Backspace') { e.preventDefault(); return this.borrar(); }
    if (e.key === 'Escape') { return this.esCambioClave ? this.cancelarCambioClave() : this.noSoyYo(); }
    if (e.key.length === 1 && /[0-9a-zA-Z]/.test(e.key)) { this.teclear(e.key); }
  }
}
