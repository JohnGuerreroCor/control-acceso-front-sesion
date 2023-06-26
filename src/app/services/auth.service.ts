import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Usuario } from '../models/usuario';
import { catchError } from 'rxjs/operators'
import { Router } from '@angular/router';
import swal from 'sweetalert2'


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuario: Usuario | undefined;
  private token: any;
  public codigoverificacion: any;
  private url: string = environment.URL_BACKEND;
  private httpHeaders = new HttpHeaders({ 'Content-type': 'application/json' })

  constructor(private http: HttpClient, private router: Router) { }

  public get user(): Usuario {
    if (this.usuario != null) {
      return this.usuario
    } else if (this.usuario == null && localStorage.getItem('usuario') != null) {
      this.usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}') as Usuario;
      return this.usuario
    }
    return new Usuario();
  }

  public obtenerUaa(): number {
    let { ucod } = (this.obtenerdatosToken(this.Token));
    return ucod;
  }

  public obtenerPerCodigo(): number {
    let { per_codigo } = (this.obtenerdatosToken(this.Token));
    return per_codigo;
  }

  public get Token(): any {
    if (this.token != null) {
      return this.token
    } else if (this.token == null && sessionStorage.getItem('token') != null) {
      this.token = sessionStorage.getItem('token');
      return this.token;
    }
    return null;
  }

  public get Codigoverificacion(): any {
    if (this.codigoverificacion != null) {
      return this.codigoverificacion
    } else if (this.codigoverificacion == null && sessionStorage.getItem('codigo') != null) {
      this.codigoverificacion = sessionStorage.getItem('codigo');
      return this.codigoverificacion;
    }
    return null;
  }

  login(usuario: Usuario): Observable<any> {
    const url = this.url + '/oauth/token';
    const credenciales = btoa('angularapp' + ':' + '12345');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + credenciales
    });
    let params = new URLSearchParams();

    params.set('grant_type', 'password');
    params.set('username', usuario.username);
    params.set('password', usuario.password);

    return this.http.post<any>(url, params.toString(), { headers: httpHeaders }).pipe(
      catchError(e => {
        if (e) {
          if (e.error.error_description == 'Bad credentials') {
            const Toast = swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', swal.stopTimer)
                toast.addEventListener('mouseleave', swal.resumeTimer)
              }
            });

            Toast.fire({
              icon: 'error',
              title: 'Error de inicio de sesión'
            });
            return [throwError(e), false];
          }
          const Toast = swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', swal.stopTimer)
              toast.addEventListener('mouseleave', swal.resumeTimer)
            }
          });

          Toast.fire({
            icon: 'error',
            title: 'Error de inicio de sesión'
          });
          return throwError(e);
        }
        return throwError(e);
      })
    )
  }

  guardarUsuario(accessToken: string): void {
    let datos = this.obtenerdatosToken(accessToken);
    //  let helper = new JwtHelperService();
    // let datos = helper.decodeToken(accessToken);

    this.usuario = new Usuario();
    this.usuario.username = datos.user_name;
    this.usuario.per_codigo = datos.per_codigo;
    this.usuario.roles = datos.authorities;
    this.usuario.nombre = datos.nombre;
    this.usuario.apellido = datos.apellido;
    this.usuario.correo = datos.correo;
    this.usuario.puesto = datos.puesto;
    this.usuario.sede = datos.sede;
    this.usuario.subsede = datos.subsede;

    sessionStorage.setItem('usuario', JSON.stringify(this.usuario));
    localStorage.setItem('usuario', JSON.stringify(this.usuario));
  }

  guardarToken(accessToken: string): void {
    this.token = accessToken;
    localStorage.setItem('token', accessToken)
    sessionStorage.setItem('token', accessToken);
  }

  guardarCodigoverificacion(codigo: string): void {
    this.codigoverificacion = codigo;
    sessionStorage.setItem('codigo', codigo);
    localStorage.setItem('codigo', codigo)
  }

  obtenerdatosToken(accessToken: string): any {
    if (accessToken != null) {
      return JSON.parse(atob(accessToken.split(".")[1]))
    }
    return null;
  }

  isAuthenticated(): boolean {
    let payload = this.obtenerdatosToken(this.Token);
    if (payload != null && payload.user_name && payload.user_name.length > 0) {
      return true;
    }
    return false;
  }


  logout(): void {
    this.token = null;
    this.usuario = undefined;
    sessionStorage.clear();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('codigo');

    localStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('codigo');
  }

  private aggAutorizacionHeader(): HttpHeaders {
    let token = this.token
    if (token != null) {
      return this.httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    return this.httpHeaders;
  }

  validacionToken() {
    if (!this.isAuthenticated()) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

}