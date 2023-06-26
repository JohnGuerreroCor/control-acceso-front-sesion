import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Rector } from '../models/rector';
import { FirmaDigital } from '../models/firma-digital';


@Injectable({
  providedIn: 'root'
})
export class FirmaDigitalService {
  private url: string = `${environment.URL_BACKEND}/firmaDigital`;
  private httpHeaders = new HttpHeaders()

  userLogeado: String = this.authservice.user.username;

  private uaa = this.authservice.obtenerUaa();

  private perCodigo = this.authservice.obtenerPerCodigo();

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

  obtenerRectorActual(): Observable<Rector[]> {
    return this.http.get<Rector[]>(`${this.url}/obtener-rectorActual/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() });
  }

  obtenerFirmaActiva(): Observable<FirmaDigital[]> {
    return this.http.get<FirmaDigital[]>(`${this.url}/obtener-firma-activa/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() });
  }

  obtenerFirma(): Observable<FirmaDigital[]> {
    return this.http.get<FirmaDigital[]>(`${this.url}/obtener-firma/${this.userLogeado}`, { headers: this.aggAutorizacionHeader() });
  }

  registrarFirma(archivo: File, json: FirmaDigital): Observable<null> {
    let formData: FormData = new FormData();
    formData.set('archivo', archivo);
    formData.set('json', JSON.stringify(json));
    return this.http.post<null>(`${this.url}/registrar-firma/${this.userLogeado}/${this.perCodigo}/${this.uaa}`, formData, { headers: this.aggAutorizacionHeader() });
  }

  actualizarFirma(firma: FirmaDigital): Observable<number> {
    return this.http.put<number>(`${this.url}/actualizar-firma/${this.userLogeado}`, firma, { headers: this.aggAutorizacionHeader() });
  }

  mirarFirma(codigo: number): Observable<any> {
    return this.http.get<any>(`${this.url}/mirar-archivo/${codigo}/${this.userLogeado}`, { headers: this.aggAutorizacionHeader(), responseType: 'blob' as 'json' });
  }

  enviarEmailRector(email: String, firma: String, nombrePersona: String, fecha: String, nombre: String, correo: String, cargo: String): Observable<any> {
    console.log('Servicio email::', email, firma, nombrePersona, fecha, nombre, correo, cargo);
    return this.http.get<any>(`${this.url}/enviar-email-rector/${email}/${firma}/${nombrePersona}/${fecha}/${nombre}/${correo}/${cargo}`, { headers: this.aggAutorizacionHeader() });
  }
}