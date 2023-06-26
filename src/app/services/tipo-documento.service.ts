import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { TipoDocumento } from '../models/tipo-documento';

@Injectable({
  providedIn: 'root'
})
export class TipoDocumentoService {
  private url: string = `${environment.URL_BACKEND}/tipoDocumento`;
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

  getTiposDocumentos(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${this.url}/obtener-tipo-documento/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() });
  }
}