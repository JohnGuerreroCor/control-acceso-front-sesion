import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Tercero } from '../models/tercero';
import { Token } from '../models/token';

@Injectable({
  providedIn: 'root'
})
export class TokenInternoService {
  private url: string = `${environment.URL_BACKEND}/token`;
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



  obtenerToken(id: String): Observable<Token[]> {
    return this.http.get<Token[]>(`${this.url}/obtener-token/${id}`);
  }

  generarToken(token: Token): Observable<number> {
    return this.http.post<number>(`${this.url}/generar-token`, token);
  }

  actualizarToken(token: Token): Observable<number> {
    return this.http.put<number>(`${this.url}/actualizar-estado-token`, token);
  }

  enviarEmailToken(token: String, email: String, nombre: String): Observable<any> {
    return this.http.get<any>(`${this.url}/enviar-token-email/${token}/${email}/${nombre}`);
  }

}