import { TipoDocumento } from './tipo-documento';

export class Vigilante {
  codigo!: number;
  documento!: TipoDocumento;
  identificacion!: String;
  nombre!: String;
  apellido!: String;
  correo!: String;
  empresa!: String;
  fechaCreacion!: Date;
  fechaRetiro!: Date;
  estado!: number;
}
