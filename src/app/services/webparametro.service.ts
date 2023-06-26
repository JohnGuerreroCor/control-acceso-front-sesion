import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Webparametro } from '../models/webparametro';

@Injectable({
  providedIn: 'root'
})
export class WebparametroService {
  private url: string = `${environment.URL_BACKEND}/webparametro`;
  private httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' });

  constructor(private http: HttpClient, private router: Router,
    private authservice: AuthService) { }


  obtenerWebParametro(): Observable<Webparametro[]> {
    return this.http.get<Webparametro[]>(`${this.url}/obtenerWebParametro`);
  }

}