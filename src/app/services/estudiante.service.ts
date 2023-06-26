import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators'
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Estudiante } from '../models/estudiante';
import { Persona } from '../models/persona';
import { AuthService } from './auth.service';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private url: string = `${environment.URL_BACKEND}/estudiante`;
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

  getEstudiante(codigo: any): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(`${this.url}/estudiante-get/${codigo}`, { headers: this.aggAutorizacionHeader() });
  }

  buscarEstudianteIdentifiacion(id: any): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(`${this.url}/buscar-estudiante-identificacion/${id}`, { headers: this.aggAutorizacionHeader() });
  }
}