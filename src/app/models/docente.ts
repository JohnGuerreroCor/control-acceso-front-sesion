import { Persona } from "./persona";
import { ProgramaCarnet } from "./programa-carnet";

export class Docente {
  codigo!: number;
  vinculacionCodigo!: number;
  vinculacionNombre!: String;
  vinculacionFechaInicio!: Date;
  vinculacionFechaFin!: Date;
  nombrePrograma!: String;
  sede!: String;
  persona!: Persona;
}