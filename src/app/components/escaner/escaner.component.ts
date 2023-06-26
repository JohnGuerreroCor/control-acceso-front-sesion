import { Component, OnInit } from '@angular/core';
import { BarcodeFormat } from "@zxing/library";
import { EstudianteService } from '../../services/estudiante.service';
import { environment } from 'src/environments/environment';
import { Estudiante } from '../../models/estudiante';
import { FotoService } from 'src/app/services/foto.service';
import { FotoAntigua } from '../../models/foto-antigua';
import { AuthService } from '../../services/auth.service';
import { PoliticaService } from '../../services/politica.service';
import { PoliticaEstamento } from '../../models/politica-estamento';
import { FirmaDigitalService } from '../../services/firma-digital.service';
import { Router } from '@angular/router';
import { BehaviorSubject, fromEvent, Observable, Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Graduado } from 'src/app/models/graduado';
import { GraduadoService } from 'src/app/services/graduado.service';
import { Docente } from 'src/app/models/docente';
import { DocenteService } from 'src/app/services/docente.service';
import { Administrativo } from 'src/app/models/administrativo';
import { AdministrativoService } from 'src/app/services/administrativo.service';
import { PersonaService } from 'src/app/services/persona.service';
import { TicketService } from 'src/app/services/ticket.service';
import { Persona } from 'src/app/models/persona';
import { Ticket } from 'src/app/models/ticket';
import * as CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-escaner',
  templateUrl: './escaner.component.html',
  styleUrls: ['./escaner.component.css'],
  providers: [DatePipe],
})
export class EscanerComponent implements OnInit {


  availableDevices!: MediaDeviceInfo[];
  currentDevice!: MediaDeviceInfo;

  titulo: String = "Hello";


  hasDevices!: boolean;
  hasPermission!: boolean;

  camara: boolean = true;

  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;

  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_13,
    BarcodeFormat.QR_CODE,
  ];

  qrResultString: string[] = [];

  resizeObservable!: Observable<Event>;
  resizeSubscription!: Subscription;


  //Booleanos
  alert: boolean = true;
  cargaFoto: boolean = false;
  mobile: boolean = false;

  carnetEstudiante: boolean = true;
  carnetGraduado: boolean = false;
  carnetAdministrativo: boolean = false;
  carnetDocente: boolean = false;
  tiquete: boolean = false;

  //Objetos
  estudiante: Estudiante[] = [];
  graduado: Graduado[] = [];
  docente: Docente[] = [];
  administrativo: Administrativo[] = [];
  persona: Persona[] = [];
  ticket: Ticket[] = [];

  politicaEstudiante: PoliticaEstamento[] = [];

  //Complementos
  tipoTiquete: number = 2;
  botonRadio!: number;
  codigoQr: any = null;
  busqueda!: String;
  busquedaGraduado!: String;
  busquedaDocente!: String;
  busquedaAdministrativo!: String;
  busquedaTiquete!: String;

  url: string = environment.URL_BACKEND;
  file!: FileList;
  foto: FotoAntigua = {
    url: "",
  };
  firma: FotoAntigua = {
    url: "",
  };

  constructor(
    public estServices: EstudianteService,
    public graduadoService: GraduadoService,
    public docenteService: DocenteService,
    public administrativoService: AdministrativoService,
    public personaService: PersonaService,
    public tiketServie: TicketService,
    public fotoService: FotoService,
    public politicaService: PoliticaService,
    public firmaService: FirmaDigitalService,
    private datePipe: DatePipe,
    private auth: AuthService,
    private router: Router) {
    this.codigoQr = 'https://www.usco.edu.co/';
  }

  onCodeResult(resultString: string) {
    console.log('QR: ', resultString);
    let llave = resultString.split("https://gaitana.usco.edu.co/carnet_digital/#/publico;key=");
    console.log('LENGTH:', llave.length);
    let parametros: any;
    if (llave.length == 2) {
      parametros = llave[1].split(",");
      console.log('Parametros::: ', parametros);
      this.qrResultString.push(resultString);
      console.log('Parametros: ', parametros);
      console.log('Longitud: ', parametros.length);
      console.log("Longitud", this.qrResultString.length);
    } else {
      parametros = resultString.split(" ");
      console.log('Parametros::: ', parametros);
      this.qrResultString.push(resultString);
      console.log('Parametros: ', parametros);
      console.log('Longitud: ', parametros.length);
      console.log("Longitud", this.qrResultString.length);
    }
    if (this.qrResultString.length < 2) {
      console.log("Longitud", this.qrResultString.length);
      if (parametros.length <= 1) {
        this.foto.url = '';
        this.alert = true;
        this.mensajeError();
        this.error();
      } else {
        this.alert = false;
        console.log('LLAVE:::', llave[1]);
        if (llave.length == 2) {
          this.decifrar("" + llave[1]);
        } else {
          this.buscar(+parametros[0], parametros[1]);
        }
        //this.buscar(+parametros[0], parametros[1]);
      }
    } else {
      console.log('**', this.qrResultString);
      console.log(
        this.qrResultString[this.qrResultString.length - 2],
        "---",
        resultString
      );
      if (
        this.qrResultString[this.qrResultString.length - 2] !== resultString
      ) {
        if (parametros.length <= 1) {
          this.foto.url = '';
          this.alert = true;
          this.mensajeError();
          this.error();
        } else {
          this.alert = false;
          if (llave.length == 2) {
            this.decifrar("" + llave[1]);
          } else {
            this.buscar(+parametros[0], parametros[1]);
          }
          //this.buscar(+parametros[0], parametros[1]);
        }
      } else {
        this.alert = true;
        Swal.fire({
          icon: "warning",
          title: "Mismo QR",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
    this.titulo = this.qrResultString[this.qrResultString.length];
  }

  decryptParams(encryptedParams: string): { param1: string, param2: string } {
    console.log('Decrypte', encryptedParams);
    const currentDate: any = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    let fecha = currentDate.toString();
    const [encryptedParam1, encryptedParam2] = encryptedParams.split(',');
    const decryptedParam1 = CryptoJS.AES.decrypt(encryptedParam1, fecha).toString(CryptoJS.enc.Utf8);
    console.log('param1: ', decryptedParam1);
    const decryptedParam2 = CryptoJS.AES.decrypt(encryptedParam2, fecha).toString(CryptoJS.enc.Utf8);
    console.log('param2: ', decryptedParam2);
    return { param1: decryptedParam1, param2: decryptedParam2 };
  }

  decifrar(key: String) {
    const [parm1, parm2] = key.split(',');
    let val1 = this.reemplazarIgual(parm1);
    val1 = this.reemplazarUsco(val1);
    let val2 = this.reemplazarIgual(parm2);
    val2 = this.reemplazarUsco(val2);
    let qr = val1 + ',' + val2;
    const decryptedParams = this.decryptParams(qr);
    this.buscar(+decryptedParams.param1, decryptedParams.param2);
  }

  reemplazarUsco(input: string): string {
    const regex = new RegExp('usco', 'gi');
    const replacedInput = input.replace(regex, '/');

    return replacedInput;
  }

  reemplazarIgual(input: string): string {
    const regex = new RegExp('igual', 'gi');
    const replacedInput = input.replace(regex, '=');

    return replacedInput;
  }

  scroll(page: HTMLElement) {
    console.log('Scroll');
    page.scrollIntoView();
  }

  buscar(estamento: number, codigo: String) {
    switch (estamento) {
      case 1://ADMINISTRATIVO
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = false;
        this.carnetDocente = false;
        this.carnetAdministrativo = true;
        this.tiquete = false;
        this.buscarAdministrativo(codigo);
        break;
      case 2://ESTUDIANTE
        this.foto.url = '';
        this.carnetEstudiante = true;
        this.carnetGraduado = false;
        this.carnetDocente = false;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.buscarEstudiante(codigo);
        break;
      case 3://DOCENTE
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = false;
        this.carnetDocente = true;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.buscarDocente(codigo);
        break;
      case 4://GRADUADO
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = true;
        this.carnetDocente = false;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.buscarGraduado(codigo);
        break;
      case 7://TIQUETE
        this.foto.url = '-';
        this.tiquete = true;
        this.carnetEstudiante = false;
        this.carnetGraduado = false;
        this.carnetDocente = false;
        this.carnetAdministrativo = false;
        this.buscarTiquete(codigo);
        break;
      default:
        this.foto.url = '';
        this.alert = true;
        Swal.fire({
          icon: 'error',
          title: 'QR Desconocido',
          text: 'El código escaneado no posee los parametros correspondientes.',
        });
        break;
    }
  }

  buscarManual(estamento: number) {
    console.log('Estamento', estamento);
    switch (+estamento) {
      case 1://ADMINISTRATIVO
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = false;
        this.carnetDocente = false;
        this.carnetAdministrativo = true;
        this.tiquete = false;
        this.busquedaAdministrativo = ""
        this.busquedaDocente = "";
        this.busqueda = "";
        this.busquedaGraduado = "";
        break;
      case 2://ESTUDIANTE
        this.foto.url = '';
        this.carnetEstudiante = true;
        this.carnetGraduado = false;
        this.carnetDocente = false;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.busquedaAdministrativo = ""
        this.busquedaDocente = "";
        this.busquedaGraduado = "";
        break;
      case 3://DOCENTE
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = false;
        this.carnetDocente = true;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.busquedaAdministrativo = ""
        this.busqueda = "";
        this.busquedaGraduado = "";
        break;
      case 4://GRADUADO
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = true;
        this.carnetDocente = false;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.busquedaAdministrativo = ""
        this.busquedaDocente = "";
        this.busqueda = "";
        break;
      case 5://TIQUETE
        this.foto.url = '';
        this.tiquete = true;
        this.carnetEstudiante = false;
        this.carnetGraduado = false;
        this.carnetDocente = false;
        this.carnetAdministrativo = false;
        this.busquedaAdministrativo = ""
        this.busquedaDocente = "";
        this.busquedaGraduado = "";
        this.busqueda = "";
        break;
      default:
        Swal.fire({
          icon: 'error',
          title: 'Codigo desconocido',
          text: 'El código no posee los parametros correspondientes.',
        });
        break;
    }
  }

  buscarEstudiante(codigo: String) {
    this.estServices.getEstudiante(codigo).subscribe(data => {
      if (JSON.stringify(data) !== "[]") {
        this.lectura();
        this.estudiante = data;
        this.codigoQr = 'https://sanagustin.usco.edu.co/planes_academicos/obtenerFoto/' + this.estudiante[0].persona.codigo;
        this.mostrarFotoEstudiante('' + this.estudiante[0].persona.codigo);
        setTimeout(() => {
          this.alert = true;
        }, 2000);
      } else {
        this.error();
        this.foto.url = '';
        this.estudiante = [];
        this.codigoQr = 'Sin resultado';
        setTimeout(() => {
          this.alert = true;
        }, 2000);
        Swal.fire({
          icon: 'warning',
          title: 'No existe',
          text: 'El código digitado no encontró ningún Estudiante asociado, por favor rectifique el código.',
        });
      }
    });
  }

  buscarGraduado(codigo: String) {
    this.graduadoService.obtenerGraduado(codigo).subscribe(data => {
      if (JSON.stringify(data) !== "[]") {
        this.lectura();
        this.graduado = data;
        this.codigoQr = 'https://sanagustin.usco.edu.co/planes_academicos/obtenerFoto/' + this.graduado[0].persona.codigo;
        this.mostrarFotoGraduado('' + this.graduado[0].persona.codigo);
        setTimeout(() => {
          this.alert = true;
        }, 2000);
      } else {
        this.error();
        this.foto.url = '';
        this.graduado = [];
        this.codigoQr = 'Sin resultado';
        setTimeout(() => {
          this.alert = true;
        }, 2000);
        Swal.fire({
          icon: 'warning',
          title: 'No existe',
          text: 'El código no encontró ningún Graduado asociado, por favor rectifique el código.',
        });
      }
    });
  }

  buscarDocente(id: String) {
    this.docenteService.getDocente(id).subscribe(data => {
      if (JSON.stringify(data) !== "[]") {
        this.lectura();
        this.docente = data;
        this.codigoQr = 'https://sanagustin.usco.edu.co/planes_academicos/obtenerFoto/' + this.docente[0].persona.codigo;
        this.mostrarFotoDocente('' + this.docente[0].persona.codigo);
        setTimeout(() => {
          this.alert = true;
        }, 2000);
      } else {
        this.error();
        this.foto.url = '';
        this.docente = [];
        this.codigoQr = 'Sin resultado';
        setTimeout(() => {
          this.alert = true;
        }, 2000);
        Swal.fire({
          icon: 'warning',
          title: 'No existe',
          text: 'El código no encontró ningún Docente asociado, por favor rectifique el código.',
        });
      }
    });
  }

  buscarAdministrativo(id: String) {
    this.administrativoService.getAdministrativo(id).subscribe(data => {
      if (JSON.stringify(data) !== "[]") {
        this.lectura();
        this.administrativo = data;
        this.codigoQr = 'https://sanagustin.usco.edu.co/planes_academicos/obtenerFoto/' + this.administrativo[0].codigo;
        this.personaService.obtenerPersonaPorPerCodigo(data[0].codigo).subscribe(data => {
          this.persona = data;
          this.mostrarFotoAdministrativo('' + this.persona[0].codigo);
        });
        setTimeout(() => {
          this.alert = true;
        }, 2000);
      } else {
        this.error();
        this.foto.url = '';
        Swal.fire({
          icon: 'warning',
          title: 'No existe',
          text: 'El código no encontró ningún Administrativo asociado, por favor rectifique el código.',
        });
        setTimeout(() => {
          this.alert = true;
        }, 2000);
        this.administrativo = [];
        this.codigoQr = 'Sin resultado';
      }
    });
  }

  buscarTiquete(id: String) {
    this.tiketServie.obtenerTicketIdentificacion(id).subscribe(data => {
      console.log(data);
      if (JSON.stringify(data) !== "[]") {
        console.log(this.datePipe.transform(data[0].fechaVigencia, 'yyyy-MM-dd') + '>' + this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
        if ((this.datePipe.transform(data[0].fechaVigencia, 'yyyy-MM-dd'))! >= (this.datePipe.transform(new Date(), 'yyyy-MM-dd'))!) {
          this.ticket = data;
          this.tipoTiquete = data[0].tipo;
          this.mensajeRealizado();
          this.lectura();
          console.log(this.ticket);
          setTimeout(() => {
            this.alert = true;
          }, 2000);
          /* this.personaService.obtenerPersonaPorPerCodigo(data[0].codigo).subscribe(data => {
            this.persona = data;
          }); */
        } else {
          this.error();
          this.foto.url = '';
          Swal.fire({
            icon: 'warning',
            title: 'No existe o expiró el tiquete',
            text: 'El código no encontró ningún Tiquete vigente o asociado, por favor rectifique el código.',
          });
          this.ticket = [];
          setTimeout(() => {
            this.alert = true;
          }, 2000);
        }
      } else {
        this.error();
        this.foto.url = '';
        Swal.fire({
          icon: 'warning',
          title: 'No existe o expiró el tiquete',
          text: 'El código no encontró ningún Tiquete vigente o asociado, por favor rectifique el código.',
        });
        this.ticket = [];
      }
    });
  }

  lectura() {
    let audio = new Audio();
    audio.src = "../assets/lectura.mp3";
    audio.load();
    audio.play();
  }

  error() {
    let audio = new Audio();
    audio.src = "../assets/error.mp3";
    audio.load();
    audio.play();
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onDeviceSelectChange(selected: string) {
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.currentDevice;
  }

  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  /* setTimeout(() => {
          this.camara = false;
        }, 9000); */

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }

  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
  }

  toggleTryHarder(): void {
    this.tryHarder = !this.tryHarder;
  }

  mensajeRealizado() {
    Swal.fire({
      icon: "success",
      title: "Proceso Realizado",
      showConfirmButton: false,
      timer: 1500,
    });
  }

  mensajeError() {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Ocurrio Un Error!",
      showConfirmButton: false,
      timer: 1500,
    });
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
    });
  }

  buscarPoliticaEstamento() {
    this.politicaService.obtenerPoliticaPorCodigoEstamento(2).subscribe(data => {
      this.politicaEstudiante = data;
    });
  }


  mostrarFotoEstudiante(perCodigo: String) {
    this.fotoService.mirarFoto(perCodigo).subscribe(data => {
      var gg = new Blob([data], { type: 'application/json' })
      if (gg.size !== 4) {
        var blob = new Blob([data], { type: 'image/png' });
        const foto = blob;
        const reader = new FileReader();
        reader.onload = () => {
          this.foto.url = reader.result as string;
          if (this.foto.url != '') {
            this.mensajeRealizado();
          }
        }
        reader.readAsDataURL(foto);

      } else {
        this.fotoService.mirarFotoAntigua('' + this.estudiante[0].persona.codigo).subscribe(data => {
          this.foto = data;
        });
      }
    });
  }

  mostrarFotoAdministrativo(perCodigo: String) {
    this.fotoService.mirarFoto(perCodigo).subscribe(data => {
      var gg = new Blob([data], { type: 'application/json' })
      if (gg.size !== 4) {
        var blob = new Blob([data], { type: 'image/png' });
        const foto = blob;
        const reader = new FileReader();
        reader.onload = () => {
          this.foto.url = reader.result as string;
          if (this.foto.url != '') {
            this.mensajeRealizado();
          }
        }
        reader.readAsDataURL(foto)

      } else {
        this.fotoService.mirarFotoAntigua('' + this.persona[0].codigo).subscribe(data => {
          this.foto = data;
        });
      }
    });
  }

  mostrarFotoDocente(perCodigo: String) {
    this.fotoService.mirarFoto(perCodigo).subscribe(data => {
      var gg = new Blob([data], { type: 'application/json' })
      if (gg.size !== 4) {
        var blob = new Blob([data], { type: 'image/png' });
        const foto = blob;
        const reader = new FileReader();
        reader.onload = () => {
          this.foto.url = reader.result as string;
          if (this.foto.url != '') {
            this.mensajeRealizado();
          }
        }
        reader.readAsDataURL(foto)

      } else {
        this.fotoService.mirarFotoAntigua('' + this.docente[0].persona.codigo).subscribe(data => {
          this.foto = data;
        });
      }
    });
  }

  mostrarFotoGraduado(perCodigo: String) {
    this.fotoService.mirarFoto(perCodigo).subscribe(data => {
      var gg = new Blob([data], { type: 'application/json' })
      if (gg.size !== 4) {
        var blob = new Blob([data], { type: 'image/png' });
        const foto = blob;
        const reader = new FileReader();
        reader.onload = () => {
          this.foto.url = reader.result as string;
          if (this.foto.url != '') {
            this.mensajeRealizado();
          }
        }
        reader.readAsDataURL(foto);

      } else {
        this.fotoService.mirarFotoAntigua('' + this.graduado[0].persona.codigo).subscribe(data => {
          this.foto = data;
        });
      }
    });
  }

}