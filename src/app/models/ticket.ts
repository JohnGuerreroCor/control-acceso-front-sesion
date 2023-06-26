import { Tercero } from './tercero';
import { Sede } from './sede';
import { SubSede } from './sub-sede';
import { Bloque } from './bloque';
import { Oficina } from './oficina';
import { Persona } from './persona';
export class Ticket {

  codigo!: number;
  tercero!: Tercero;
  persona!: Persona;
  sede!: Sede;
  subSede!: SubSede;
  bloque!: Bloque;
  oficina!: Oficina;
  tipo!: number;
  tipoLugar!: number;
  fechaCreacion!: Date;
  fechaVigencia!: Date;
  emailGraduado!: number;
  qr!: String;

}
