import { Sede } from './sede';
import { SubSede } from './sub-sede';
import { Bloque } from './bloque';
import { PuestoTipo } from './puesto-tipo';

export class PuestoVigilancia {
  codigo!: number;
  sede!: Sede;
  subsede!: SubSede;
  bloque!: Bloque;
  nombre!: String;
  fechaCreacion!: Date;
  fechaCierre!: Date;
  cupoVigilante!: number;
  cupoCarro!: number;
  cupoMoto!: number;
  cupoBicicleta!: number;
  estado!: number;
  tipoPuesto!: PuestoTipo;
}
