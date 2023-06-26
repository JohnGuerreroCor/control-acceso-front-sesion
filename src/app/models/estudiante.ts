import { Persona } from "./persona";
import { ProgramaCarnet } from "./programa-carnet";

export class Estudiante {
  codigo!: String;
  codigoPrograma!: number;
  fechaIngreso!: Date;
  codigoInscripcion!: number;
  estadoEgresado!: number;
  persona!: Persona;
  programa!: ProgramaCarnet;
}
