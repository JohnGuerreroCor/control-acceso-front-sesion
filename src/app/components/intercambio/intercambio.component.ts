import { Component, OnInit } from '@angular/core';
import { EstudianteService } from '../../services/estudiante.service';
import { environment } from 'src/environments/environment';
import { Estudiante } from '../../models/estudiante';
import { FotoService } from 'src/app/services/foto.service';
import { FotoAntigua } from '../../models/foto-antigua';
import { AuthService } from '../../services/auth.service';
import { PoliticaService } from '../../services/politica.service';
import { PoliticaEstamento } from '../../models/politica-estamento';
import { FirmaDigitalService } from '../../services/firma-digital.service';
import { PersonaService } from 'src/app/services/persona.service';
import { EstamentoService } from 'src/app/services/estamento.service';
import { CarnetDigital } from '../../models/carnet-digital';
import { fromEvent, Observable, Subscription } from "rxjs";
import { FirmaDigital } from '../../models/firma-digital';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import * as CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-intercambio',
  templateUrl: './intercambio.component.html',
  styleUrls: ['./intercambio.component.css'],
  providers: [DatePipe],
})
export class IntercambioComponent implements OnInit {

  public perCodigo: any = this.auth.user.per_codigo;
  public perCodigoAntigua: any = '' + this.auth.user.per_codigo;
  public nombre: any = this.auth.user.nombre;
  public apellido: any = this.auth.user.apellido;
  public uaa: any[] = this.auth.user.uaa.split(" ");

  //Booleanos
  cargaFoto: boolean = false;
  mobile: boolean = false;
  flipped: boolean = false;

  //Objetos
  estudiante: Estudiante[] = [];
  carnet: CarnetDigital[] = [];
  politicaEstudiante: PoliticaEstamento[] = [];
  rector: FirmaDigital[] = [];

  //Complementos
  resizeObservable!: Observable<Event>;
  resizeSubscription!: Subscription;
  vistaMobile: String = '';

  codigoEstudiante!: String;
  codigoQr: any = null;
  busqueda!: String;
  url: string = environment.URL_BACKEND;
  nameFile = "Seleccione la foto a cargar...";
  file!: FileList;
  foto: FotoAntigua = {
    url: "",
  };
  firma: FotoAntigua = {
    url: "",
  };

  constructor(
    public estServices: EstudianteService,
    public fotoService: FotoService,
    public politicaService: PoliticaService,
    public firmaService: FirmaDigitalService,
    public estamentoService: EstamentoService,
    public personaService: PersonaService,
    private auth: AuthService,
    private router: Router,
    private datePipe: DatePipe,
  ) { }

  flipCard() {
    this.flipped = !this.flipped;
  }

  ngOnInit() {
    if (window.screen.width <= 950) { // 768px portrait
      this.mobile = true;
    } else {
      this.mobile = false;
    }
    this.resizeObservable = fromEvent(window, 'resize');
    this.resizeSubscription = this.resizeObservable.subscribe(evt => {
      if (window.screen.width <= 950) { // 768px portrait
        this.mobile = true;
      } else {
        this.mobile = false;
      }
    })
    this.vistaMobile = '' + window.screen.width;

    this.buscarPoliticaEstamento();
    this.buscarFirmaActiva();
    let codigo = this.auth.user.username.split('u');
    console.log(codigo);
    this.estamentoService.obtenerCarnetEstamento(this.perCodigo).subscribe(data => {
      this.carnet = data;
      console.log(data);
      for (let index = 0; index < this.carnet.length; index++) {
        if (this.carnet[index].codigo === 6) {
          let aux = this.carnet[index].usuario.split('i');
          this.codigoEstudiante = aux[1];
          this.estServices.getEstudiante(this.codigoEstudiante).subscribe(data => {
            if (JSON.stringify(data) !== "[]") {
              this.estudiante = data;
              this.mostrarFoto('' + this.estudiante[0].persona.codigo);
              const param1 = '6';
              const param2 = '' + this.estudiante[0].codigo;
              const encryptedParams = this.encryptParams(param1, param2);
              let qr = encryptedParams.replace('=', 'igual');
              //this.codigoQr = 'http://localhost:4200/#/publico;key=' + qr;
              this.codigoQr = 'https://gaitana.usco.edu.co/carnet_digital/#/publico;key=' + qr;
              console.log('UrlPublica:', this.codigoQr);
            } else {
              this.estudiante = [];
              this.codigoQr = 'Sin resultado';
              Swal.fire({
                icon: 'warning',
                title: 'No existe',
                text: 'El código digitado no encontró ningún Estudiante asociado, por favor rectifique el código.',
              });
            }
          });
        }
      }
    })
  }

  scrollToSection(page: HTMLElement) {
    page.scrollIntoView({ behavior: 'smooth' });
  }

  encryptParams(param1: string, param2: string): string {
    const currentDate: any = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    let fecha = currentDate.toString();
    const encryptedParam1 = CryptoJS.AES.encrypt(param1, fecha).toString();
    let parm1 = encryptedParam1.replace(/=/g, 'igual');
    parm1 = parm1.replace(/\//g, 'usco');
    const encryptedParam2 = CryptoJS.AES.encrypt(param2, fecha).toString();
    let parm2 = encryptedParam2.replace(/=/g, 'igual');
    parm2 = parm2.replace(/\//g, 'usco');

    // Concatenar los parámetros encriptados y retornarlos
    return parm1 + ',' + parm2;
  }

  decryptParams(encryptedParams: string): { param1: string, param2: string } {
    const currentDate: any = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    let fecha = currentDate.toString();
    const [encryptedParam1, encryptedParam2] = encryptedParams.split(',');
    const decryptedParam1 = CryptoJS.AES.decrypt(encryptedParam1, fecha).toString(CryptoJS.enc.Utf8);
    const decryptedParam2 = CryptoJS.AES.decrypt(encryptedParam2, fecha).toString(CryptoJS.enc.Utf8);
    return { param1: decryptedParam1, param2: decryptedParam2 };
  }

  buscarFirmaActiva() {
    this.firmaService.obtenerFirmaActiva().subscribe(data => {
      if (JSON.stringify(data) !== '[]') {
        this.rector = data;
        this.obtenerFirma(+data[0].ruta);
      }
    });
  }

  obtenerFirma(ruta: number) {
    this.firmaService.mirarFirma(ruta).subscribe(data => {
      var blob = new Blob([data], { type: 'image/png' });
      const foto = blob;
      const reader = new FileReader();
      reader.onload = () => {
        this.firma.url = reader.result as string;
      }
      reader.readAsDataURL(foto);
    });
  }

  buscarPoliticaEstamento() {
    this.politicaService.obtenerPoliticaPorCodigoEstamento(2).subscribe(data => {
      this.politicaEstudiante = data;
    });
  }

  mostrarFoto(perCodigo: String) {
    this.fotoService.mirarFoto(perCodigo).subscribe(data => {
      var gg = new Blob([data], { type: 'application/json' })
      if (gg.size !== 4) {
        var blob = new Blob([data], { type: 'image/png' });
        const foto = blob;
        const reader = new FileReader();
        reader.onload = () => {
          this.foto.url = reader.result as string;
        }
        reader.readAsDataURL(foto);

      } else {
        this.fotoService.mirarFotoAntigua('' + this.estudiante[0].persona.codigo).subscribe(data => {
          this.foto = data;
        });
      }
    });
  }

  mensajeRealizado() {
    Swal.fire({
      icon: 'success',
      title: 'Proceso Realizado',
      showConfirmButton: false,
      timer: 1500
    })
  }

  mensajeError() {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Ocurrio Un Error!',
    })

  }

  fError(er: any): void {

    let err = er.error.error_description;
    let arr: string[] = err.split(":");
    this.mensajeError()
    if (arr[0] == "Access token expired") {

      this.auth.logout();
      this.router.navigate(['login']);

    } else {
      this.mensajeError();
    }

  }

}