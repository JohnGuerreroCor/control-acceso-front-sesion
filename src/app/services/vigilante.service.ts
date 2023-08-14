import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Vigilante } from '../models/vigilante';

@Injectable({
  providedIn: 'root',
})
export class VigilanteService {
  private url: string = `${environment.URL_BACKEND}/vigilante`;
  private httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' });

  constructor(private http: HttpClient, private router: Router) {}

  obtenerVigilantes(): Observable<Vigilante[]> {
    return this.http.get<Vigilante[]>(`${this.url}/obtener-vigilantes`);
  }

  obtenerVigilantesActivos(): Observable<Vigilante[]> {
    return this.http.get<Vigilante[]>(`${this.url}/obtener-vigilantes-activos`);
  }

  obtenerVigilantesSinAsignacion(): Observable<Vigilante[]> {
    return this.http.get<Vigilante[]>(
      `${this.url}/obtener-vigilantes-sin-asignacion`
    );
  }

  obtenerVigilanteIdentificacion(id: String): Observable<Vigilante[]> {
    return this.http.get<Vigilante[]>(
      `${this.url}/obtener-vigilantes-identificacion/${id}`
    );
  }

  obtenerVigilanteCodigo(codigo: number): Observable<Vigilante[]> {
    return this.http.get<Vigilante[]>(
      `${this.url}/obtener-vigilante-codigo/${codigo}`
    );
  }
}
