import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Persona } from '../models/persona';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private url: string = `${environment.URL_BACKEND}/persona`;
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

  obtenerPersonaPorPerCodigo(codigo: number): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.url}/obtener-persona-codigo/${codigo}`, { headers: this.aggAutorizacionHeader() });
  }

  obtenerPersonaPorIdentificacion(id: String): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.url}/obtener-persona-identificacion/${id}`, { headers: this.aggAutorizacionHeader() });
  }
}
