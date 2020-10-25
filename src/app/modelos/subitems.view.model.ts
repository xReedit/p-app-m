import { SubItem } from './subitems.model';

export class SubItemsView {
    id: string;
    des: string;
    listDes: string[];
    cantidad: string;
    indicaciones: string;
    cantidad_seleccionada: number;
    precio: number;
    subitems: SubItem[];
    idtipo_consumo: number; // idtipoconsumo para no sumar de otro tpc
}
