import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';
import swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  usuario: Usuario;
  hide = true;
  ver = true;
  today = new Date();
  cargando: boolean = false;

  constructor(public authService: AuthService, private router: Router) {
    this.usuario = new Usuario();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      if (this.authService.codigoverificacion != null) {
        const Toast = swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', swal.stopTimer)
            toast.addEventListener('mouseleave', swal.resumeTimer)
          }
        });

        Toast.fire({
          icon: 'info',
          title: 'Ya se ha iniciado sesión.'
        });
        this.router.navigate(['inicio']);
      } else {
        this.router.navigate(['token']);
      }
    }
  }

  informacion() {
    swal.fire({
      icon: 'info',
      title: 'Tipos de Usuario USCO',
      imageUrl: 'assets/tipousuariousco2.png',
      imageWidth: 400,
      imageHeight: 230,
      imageAlt: 'USCO',
      confirmButtonColor: '#8f141b',
      confirmButtonText: 'Listo',
      showClass: {
        popup: 'slide-top'
      },
    })
  }


  login(): void {
    this.cargando = true;
    if (this.usuario.username == null || this.usuario.password == null) {
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
        title: 'Error de inicio de sesión', text: 'Usuario o contraseña vacía'
      });
      this.cargando = false;
      return;
    }
    this.authService.login(this.usuario).subscribe(response => {
      this.authService.guardarUsuario(response.access_token);
      this.authService.guardarToken(response.access_token);
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
        icon: 'success',
        title: 'Inicio de sesión exitoso.'
      });
      this.router.navigate(['/token']);
      /*  this.webparametroService.obtenerWebParametro().subscribe(data => {
         if (data[0].webValor === '1') {
           this.router.navigate(['/token']);
         } else {
           this.router.navigate(['/inicio']);
         }
       }); */
    }, err => this.fError(err));
  }

  fError(er: { error: { error_description: any; }; }): void {
    let err = er.error.error_description;
    let arr: string[] = err.split(":");
    if (arr[0] == "Access token expired") {
      this.router.navigate(['login']);
      this.cargando = false;
    } else {
      this.cargando = false;
    }

  }

}