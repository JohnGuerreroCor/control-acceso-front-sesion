import { PuestoVigilancia } from "./puesto-vigilancia";

export class ControlAcceso {
  codigo!: number;
  identificacion!: String;
  usuarioTipo!: number;
  puesto!: PuestoVigilancia;
  accesoTipo!: number;
  fecha!:Date;
}
