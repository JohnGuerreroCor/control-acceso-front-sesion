export class Usuario {
  id!: number;
  username!: string;
  password!: string;
  per_codigo!: number;
  nombre!: String;
  apellido!: String;
  correo!: String;
  uaa!: String;
  puesto!: number;
  sede!: number;
  subsede!: number;
  roles : string[] = [];
}