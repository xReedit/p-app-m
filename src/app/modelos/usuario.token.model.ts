import { DeliveryDireccionCliente } from './delivery.direccion.cliente.model';

export class UsuarioTokenModel {
    acc: string;
    cargo: string;
    estadistica: number;
    estado: number;
    idalmacen: number;
    idorg: number;
    idsede: number;
    idusuario: number;
    nombres: string;
    nuevo: number;
    pass: string;
    per: string;
    rol: number;
    super: number;
    usuario: string;
    idcliente: number;
    isCliente: boolean;
    email: string;
    numMesaLector: number; // numero de mesa del lector qr
    ipCliente: string; // ip del cliente api autorizacion
    isSoloLLevar: boolean; // si escanea qr solo para llevar
    isDelivery: boolean; // si es delivery
    direccionEnvioSelected: DeliveryDireccionCliente;
    telefono: string;
    orderDelivery: string; // pedido pendiente de confirmacion
    importeDelivery: string; // importe pendiente de confirmacion
}
