import { Persona } from "./persona";
import { ProgramaCarnet } from "./programa-carnet";

export class Graduado {
  codigo!: String;
  fechaGrado!: Date;
  codigoPlan!: number;
  persona!: Persona;
  programa!: ProgramaCarnet;
}