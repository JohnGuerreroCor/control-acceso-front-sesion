import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NavbarHiddenService } from 'src/app/services/navbar-hidden.service';
import { FotoService } from 'src/app/services/foto.service';
import swal from 'sweetalert2'
import { FotoAntigua } from '../../../models/foto-antigua';
import { Estamento } from 'src/app/models/estamento';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {


  public perCodigo: any = this.auth.user.per_codigo;
  public perCodigoAntigua: any = '' + this.auth.user.per_codigo;
  public nombre: any = this.auth.user.nombre;
  public apellido: any = this.auth.user.apellido;
  carnetEstudiante: boolean = false;
  carnetGraduado: boolean = false;
  carnetAdministrativo: boolean = false;
  carnetDocente: boolean = false;
  carnetVirtual: boolean = false;
  carnetIntercambio: boolean = false;

  carnets: Estamento[] = [];

  url: string = environment.URL_BACKEND;
  panelOpenState = false;
  foto: FotoAntigua = {
    url: "",
  };

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    public auth: AuthService,
    private router: Router,
    public navbarHiddenService: NavbarHiddenService,
    public fotoService: FotoService
  ) {
    this.fotoService.mirarFoto('' + this.perCodigo).subscribe(data => {
      var gg = new Blob([data], { type: 'application/json' })
      if (gg.size !== 4) {
        var blob = new Blob([data], { type: 'image/png' });
        const foto = blob;
        const reader = new FileReader();
        reader.onload = () => {
          this.foto.url = reader.result as string;
        }
        reader.readAsDataURL(foto)

      } else {
        this.fotoService.mirarFotoAntigua('' + this.perCodigo).subscribe(data => {
          this.foto = data;
        });
      }
    });
  }


  scroll(page: HTMLElement) {
    page.scrollIntoView();
  }

  logout(): void {
    this.auth.logout();
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
      icon: 'success',
      title: 'Sesión cerrada correctamente.'
    });
    this.router.navigate(['/login']);
  }

  ngOnInit() {

  }

  toggle() {
    this.navbarHiddenService.toggleSideBar();
  }

}