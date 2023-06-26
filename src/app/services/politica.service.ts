import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { PoliticaEstamento } from '../models/politica-estamento';

@Injectable({
  providedIn: 'root'
})
export class PoliticaService {
  private url: string = `${environment.URL_BACKEND}/politica`;
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


  obtenerPoliticaEstamento(): Observable<PoliticaEstamento[]> {
    return this.http.get<PoliticaEstamento[]>(`${this.url}/obtener-politicaEstamento/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        return throwError(e);
      })
    );
  }

  obtenerPoliticaPorCodigoEstamento(codigo: number): Observable<PoliticaEstamento[]> {
    return this.http.get<PoliticaEstamento[]>(`${this.url}/obtener-politicaPorCodigoEstamento/${codigo}/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() }).pipe(
      catchError(e => {
        if (this.isNoAutorizado(e)) {
          return throwError(e);
        }
        return throwError(e);
      })
    );
  }

  actualizarPoliticaEstamento(politicaEstamento: PoliticaEstamento): Observable<number> {
    return this.http.put<number>(`${this.url}/actualizar-politicaEstamento/${this.userLogeado}`, politicaEstamento, { headers: this.aggAutorizacionHeader() });
  }

}