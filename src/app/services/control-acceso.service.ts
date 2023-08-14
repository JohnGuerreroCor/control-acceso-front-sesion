import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { ControlAcceso } from '../models/control-acceso';

@Injectable({
  providedIn: 'root',
})
export class ControlAccesoService {
  private url: string = `${environment.URL_BACKEND}/acceso`;
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

  obtenerAccesos(): Observable<ControlAcceso[]> {
    return this.http.get<ControlAcceso[]>(`${this.url}/obtener-accesos`);
  }

  registrarAcceso(acceso: ControlAcceso): Observable<number> {
    return this.http.post<number>(`${this.url}/insertar-acceso`, acceso);
  }
}
