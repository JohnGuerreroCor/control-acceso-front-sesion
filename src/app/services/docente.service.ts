import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Docente } from '../models/docente';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  private url: string = `${environment.URL_BACKEND}/docente`;
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


  getDocente(id: any): Observable<Docente[]> {
    return this.http.get<Docente[]>(`${this.url}/docente-get/${id}/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() });
  }
}