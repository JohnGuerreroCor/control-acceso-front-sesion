import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Estudiante } from '../models/estudiante';
import { Persona } from '../models/persona';
import { AuthService } from './auth.service';
import { Graduado } from '../models/graduado';
import { Administrativo } from '../models/administrativo';
import { Docente } from '../models/docente';
import { Tercero } from '../models/tercero';
import { Ticket } from '../models/ticket';
import { FotoAntigua } from '../models/foto-antigua';
import { FirmaDigital } from '../models/firma-digital';
import { PoliticaEstamento } from '../models/politica-estamento';

@Injectable({
  providedIn: 'root'
})
export class PublicoService {
  private url: string = `${environment.URL_BACKEND}/publico`;
  private httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' });


  constructor(
    private http: HttpClient, private router: Router,
    private authservice: AuthService
  ) { }

  getEstudiante(codigo: any): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(`${this.url}/estudiante-get/${codigo}`);
  }

  buscarEstudianteIdentifiacion(id: any): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(`${this.url}/buscar-estudiante-identificacion/${id}`);
  }

  obtenerGraduado(codigo: String): Observable<Graduado[]> {
    return this.http.get<Graduado[]>(`${this.url}/obtener-graduado/${codigo}`);
  }

  getAdministrativo(id: any): Observable<Administrativo[]> {
    return this.http.get<Administrativo[]>(`${this.url}/administrativo-get/${id}`);
  }

  getDocente(id: any): Observable<Docente[]> {
    return this.http.get<Docente[]>(`${this.url}/docente-get/${id}`);
  }

  obtenerPersonaPorPerCodigo(codigo: number): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.url}/obtener-persona-codigo/${codigo}`);
  }

  obtenerPersonaPorIdentificacion(id: String): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.url}/obtener-persona-identificacion/${id}`);
  }

  getTerceroId(id: String): Observable<Tercero[]> {
    return this.http.get<Tercero[]>(`${this.url}/obtener-tercero/${id}`);
  }

  registrarTercero(tercero: Tercero): Observable<number> {
    return this.http.post<number>(`${this.url}/registrar-tercero`, tercero);
  }

  actualizarEmailTercero(tercero: Tercero): Observable<number> {
    return this.http.put<number>(`${this.url}/actualizar-email-tercero`, tercero);
  }

  obtenerTickets(tipoTicket: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/obtener-tickets/${tipoTicket}`);
  }

  obtenerTicketTerCodigo(codigo: number, tipoTicket: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/obtener-ticket-tercodigo/${codigo}/${tipoTicket}`);
  }

  obtenerTicketPerCodigo(codigo: number, tipoTicket: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/obtener-ticket-percodigo/${codigo}/${tipoTicket}`);
  }

  obtenerTicketIdentificacion(identificacion: String): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/obtener-ticket-identificacion/${identificacion}`);
  }

  obtenerFirmaActiva(): Observable<FirmaDigital[]> {
    return this.http.get<FirmaDigital[]>(`${this.url}/obtener-firma-activa`);
  }

  obtenerPoliticaPorCodigoEstamento(codigo: number): Observable<PoliticaEstamento[]> {
    return this.http.get<PoliticaEstamento[]>(`${this.url}/obtener-politicaPorCodigoEstamento/${codigo}`);
  }

  mirarFirma(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.url}/mirar-archivo/${codigo}`, { responseType: 'blob' as 'json' });
  }

  mirarFoto(perCodigo: String): Observable<any> {
    return this.http.get<any>(`${this.url}/obtener-foto/${perCodigo}`, { responseType: 'blob' as 'json' });
  }

  mirarFotoAntigua(perCodigo: String): Observable<FotoAntigua> {
    return this.http.get<FotoAntigua>(`${this.url}/obtener-foto-antigua/${perCodigo}`);
  }

}