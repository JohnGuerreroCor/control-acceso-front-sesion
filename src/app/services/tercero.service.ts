import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Tercero } from '../models/tercero';

@Injectable({
  providedIn: 'root',
})
export class TerceroService {
  private url: string = `${environment.URL_BACKEND}/tercero`;
  private httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' });

  userLogeado: String = this.authservice.user.username;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authservice: AuthService
  ) {}

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

  getTerceroId(id: String): Observable<Tercero[]> {
    return this.http.get<Tercero[]>(`${this.url}/obtener-tercero/${id}`);
  }

  registrarTercero(tercero: Tercero): Observable<number> {
    return this.http.post<number>(`${this.url}/registrar-tercero`, tercero);
  }

  actualizarEmailTercero(tercero: Tercero): Observable<number> {
    return this.http.put<number>(
      `${this.url}/actualizar-email-tercero`,
      tercero
    );
  }
}
