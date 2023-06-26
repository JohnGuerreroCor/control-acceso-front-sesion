import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Sede } from '../models/sede';
import { SubSede } from '../models/sub-sede';
import { Bloque } from '../models/bloque';
import { Oficina } from '../models/oficina';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {
  private url: string = `${environment.URL_BACKEND}/ubicacion`;
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

  private isNoAutorizado(e: { status: number; }): boolean {
    if (e.status == 401 || e.status == 403) {
      if (this.authservice.isAuthenticated()) {
        this.authservice.logout();
      }
      this.router.navigate(['login']);
      return true;
    }
    return false;
  }


  obtenerSedes(): Observable<Sede[]> {
    return this.http.get<Sede[]>(`${this.url}/obtener-sedes/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        return throwError(e);
      })
    );
  }

  obtenerSubSedes(): Observable<SubSede[]> {
    return this.http.get<SubSede[]>(`${this.url}/obtener-subsedes/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        return throwError(e);
      })
    );
  }

  obtenerBloques(): Observable<Bloque[]> {
    return this.http.get<Bloque[]>(`${this.url}/obtener-bloques/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        return throwError(e);
      })
    );
  }

  obtenerOficinas(): Observable<Oficina[]> {
    return this.http.get<Oficina[]>(`${this.url}/obtener-oficina/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() });
  }

  buscarSubSedes(codigo: number): Observable<SubSede[]> {
    return this.http.get<SubSede[]>(`${this.url}/buscar-subsede/${codigo}/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() });
  }

  buscarBloques(codigo: number): Observable<Bloque[]> {
    return this.http.get<Bloque[]>(`${this.url}/buscar-bloque/${codigo}/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() });
  }

  buscarOficinas(codigo: number): Observable<Oficina[]> {
    return this.http.get<Oficina[]>(`${this.url}/buscar-oficina/${codigo}/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() });
  }
}