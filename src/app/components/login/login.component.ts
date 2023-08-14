import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';
import { VigilanteService } from 'src/app/services/vigilante.service';
import swal from 'sweetalert2';
import { Vigilante } from 'src/app/models/vigilante';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  usuario: Usuario;
  hide = true;
  ver = true;
  today = new Date();
  cargando: boolean = false;
  formLogin!: FormGroup;
  vigilantes!: Vigilante[];

  constructor(
    public authService: AuthService,
    public vigilanteService: VigilanteService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.usuario = new Usuario();
  }

  private crearFormularioLogin(): void {
    this.formLogin = this.formBuilder.group({
      identificacion: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
      ]),
      correo: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  ngOnInit() {
    this.crearFormularioLogin();
    if (this.authService.isAuthenticated()) {
      if (this.authService.codigoverificacion != null) {
        const Toast = swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', swal.stopTimer);
            toast.addEventListener('mouseleave', swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: 'info',
          title: 'Ya se ha iniciado sesión.',
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
        popup: 'slide-top',
      },
    });
  }

  validarEmail() {
    this.cargando = true;
    this.vigilanteService.obtenerVigilantesActivos().subscribe((data) => {
      this.vigilantes = data;
      let count = 0;
      for (const e of data) {
        if (e.correo === this.formLogin.get('correo')!.value) {
          count = count + 1;
        }
      }
      if (count > 0) {
        this.login();
      } else {
        swal.fire({
          icon: 'error',
          title: 'Correo no encontrado',
          text: 'El correo digitado no corresponde a ningún vigilante, por favor rectificar.',
          confirmButtonColor: '#8f141b',
          confirmButtonText: 'Listo',
        });
        this.cargando = false;
      }
    });
  }

  login(): void {
    this.cargando = true;
    if (
      this.formLogin.get('identificacion')!.value == null ||
      this.formLogin.get('correo')!.value == null
    ) {
      const Toast = swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', swal.stopTimer);
          toast.addEventListener('mouseleave', swal.resumeTimer);
        },
      });

      Toast.fire({
        icon: 'error',
        title: 'Error de inicio de sesión',
        text: 'Usuario o contraseña vacía',
      });
      this.cargando = false;
      return;
    }
    this.usuario.username = this.formLogin.get('identificacion')!.value;
    this.authService.login(this.usuario).subscribe(
      (response) => {
        this.authService.guardarUsuario(response.access_token);
        this.authService.guardarToken(response.access_token);
        const Toast = swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', swal.stopTimer);
            toast.addEventListener('mouseleave', swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso.',
        });
        this.router.navigate(['/token']);
        /*  this.webparametroService.obtenerWebParametro().subscribe(data => {
         if (data[0].webValor === '1') {
           this.router.navigate(['/token']);
         } else {
           this.router.navigate(['/inicio']);
         }
       }); */
      },
      (err) => this.fError(err)
    );
  }

  fError(er: { error: { error_description: any } }): void {
    let err = er.error.error_description;
    let arr: string[] = err.split(':');
    if (arr[0] == 'Access token expired') {
      this.router.navigate(['login']);
      this.cargando = false;
    } else {
      this.cargando = false;
    }
  }
}
