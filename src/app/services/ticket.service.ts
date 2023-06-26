import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Ticket } from '../models/ticket';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private url: string = `${environment.URL_BACKEND}/ticket`;
  private httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' });

  userLogeado: String = this.authservice.user.username;

  constructor(private http: HttpClient, private router: Router,
    private authservice: AuthService) { }

  private aggAutorizacionHeader(): HttpHeaders {
    let token = this.authservice.Token;
    if (token != null) {
      return this.httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    return this.httpHeaders;
  }

  private isNoAutorizado(e: any): boolean {
    if (e.status == 401 || e.status == 403) {
      if (this.authservice.isAuthenticated()) {
        this.authservice.logout();
      }
      this.router.navigate(['login']);
      return true;
    }
    return false;
  }


  obtenerTickets(tipoTicket: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/obtener-tickets/${tipoTicket}`, { headers: this.aggAutorizacionHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        return throwError(e);
      })
    );
  }

  obtenerTicketTerCodigo(codigo: number, tipoTicket: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/obtener-ticket-tercodigo/${codigo}/${tipoTicket}`, { headers: this.aggAutorizacionHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        return throwError(e);
      })
    );
  }

  obtenerTicketPerCodigo(codigo: number, tipoTicket: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/obtener-ticket-percodigo/${codigo}/${tipoTicket}`, { headers: this.aggAutorizacionHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        return throwError(e);
      })
    );
  }

  obtenerTicketIdentificacion(identificacion: String): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/obtener-ticket-identificacion/${identificacion}`, { headers: this.aggAutorizacionHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        return throwError(e);
      })
    );
  }

  registrarTicket(ticket: Ticket): Observable<number> {
    console.log('Servicio ticket::: ', ticket);
    return this.http.post<number>(`${this.url}/registrar-ticket`, ticket, { headers: this.aggAutorizacionHeader() });
  }

  enviarTicketVisitanteEmail(email: String, nombre: String, id: String, lugar: String, registro: String, vigencia: String, qr: String): Observable<any> {
    console.log('Servicio email::', email, nombre, id, lugar, vigencia);
    return this.http.get<any>(`${this.url}/enviar-ticket-visitante-email/${email}/${nombre}/${id}/${lugar}/${registro}/${vigencia}/${qr}`, { headers: this.aggAutorizacionHeader() });
  }

  enviarTicketInvitadoEmail(email: String, foto: String, nombre: String, id: String, lugar: String, registro: String, vigencia: String, qr: String): Observable<any> {
    console.log('Servicio email::', email, foto, nombre, id, lugar, vigencia);
    return this.http.get<any>(`${this.url}/enviar-ticket-invitado-email/${email}/${foto}/${nombre}/${id}/${lugar}/${registro}/${vigencia}/${qr}`, { headers: this.aggAutorizacionHeader() });
  }

}