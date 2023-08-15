import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';
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
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
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
import { ControlAcceso } from 'src/app/models/control-acceso';
import { ControlAccesoService } from 'src/app/services/control-acceso.service';
import { PuestoVigilancia } from 'src/app/models/puesto-vigilancia';

@Component({
  selector: 'app-escaner',
  templateUrl: './escaner.component.html',
  styleUrls: ['./escaner.component.css'],
  providers: [DatePipe],
})
export class EscanerComponent implements OnInit {
  availableDevices!: MediaDeviceInfo[];
  currentDevice!: MediaDeviceInfo;

  titulo: String = 'ValoresEscaner';

  hasDevices!: boolean;
  hasPermission!: boolean;
  ingreso: boolean = false;

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

  formAcceso!: FormGroup;

  url: string = environment.URL_BACKEND;
  file!: FileList;
  foto: FotoAntigua = {
    url: '',
  };
  firma: FotoAntigua = {
    url: '',
  };

  // Referencia al elemento div oculto
  @ViewChild('hiddenDiv') hiddenDiv!: ElementRef;

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
    private formBuilder: FormBuilder,
    private router: Router,
    public controlAccesoService: ControlAccesoService,
    private elementRef: ElementRef
  ) {
    this.codigoQr = 'https://www.usco.edu.co/';
    console.log(this.auth.user);
  }

  onCodeResult(resultString: string) {
    let llave = resultString.split(
      'https://gaitana.usco.edu.co/carnet_digital/#/publico;key='
    );
    let parametros: any;
    if (llave.length == 2) {
      parametros = llave[1].split(',');
      this.qrResultString.push(resultString);
    } else {
      parametros = resultString.split(' ');
      this.qrResultString.push(resultString);
    }
    if (this.qrResultString.length < 2) {
      if (parametros.length <= 1) {
        this.foto.url = '';
        //this.alert = true;
        this.mensajeError();
        this.error();
      } else {
        //this.alert = false;
        if (llave.length == 2) {
          this.decifrar('' + llave[1]);
        } else {
          this.buscar(+parametros[0], parametros[1]);
        }
        //this.buscar(+parametros[0], parametros[1]);
      }
    } else {
      if (
        this.qrResultString[this.qrResultString.length - 2] !== resultString
      ) {
        if (parametros.length <= 1) {
          this.foto.url = '';
          //this.alert = true;
          this.mensajeError();
          this.error();
        } else {
          this.alert = false;
          if (llave.length == 2) {
            this.decifrar('' + llave[1]);
          } else {
            this.buscar(+parametros[0], parametros[1]);
          }
          //this.buscar(+parametros[0], parametros[1]);
        }
      } else {
        //this.alert = true;
        Swal.fire({
          icon: 'warning',
          title: 'Mismo QR',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
    this.titulo = this.qrResultString[this.qrResultString.length];
  }

  // Función para mostrar el div oculto y desplazarse hacia él
  showAndScrollToHiddenDiv() {
    this.hiddenDiv.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToSection(sectionId: string) {
    const section = this.elementRef.nativeElement.querySelector(
      '#' + sectionId
    );
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private crearFormularioAcceso(): void {
    this.formAcceso = this.formBuilder.group({
      codigo: new FormControl(''),
      identificacion: new FormControl(''),
      usuarioTipo: new FormControl(''),
      puesto: new FormControl(''),
      puestoTipo: new FormControl(''),
      sede: new FormControl(''),
      subsede: new FormControl(''),
      bloque: new FormControl(''),
      accesoTipo: new FormControl(''),
      fecha: new FormControl(''),
    });
  }

  registrarIngreso() {
    //FUNCIÓN PARA HACER INSERT DEL INGRESO DE UNA PERSONA
    let acceso: ControlAcceso = new ControlAcceso();
    acceso.identificacion = this.formAcceso.get('identificacion')!.value;
    acceso.usuarioTipo = this.formAcceso.get('usuarioTipo')!.value;
    let puesto: PuestoVigilancia = new PuestoVigilancia();
    puesto.codigo = this.auth.user.puesto;
    acceso.puesto = puesto;
    acceso.accesoTipo = 1;
    acceso.fecha = new Date();
    this.controlAccesoService.registrarAcceso(acceso).subscribe(
      (data) => {
        if (data > 0) {
          Swal.fire({
            icon: 'success',
            title: 'El usuario ingreso a la institución.',
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          this.mensajeError();
        }
      },
      (err) => this.fError(err)
    );
  }

  registrarSalida() {
    //FUNCIÓN PARA HACER INSERT DE LA SALIDA DE UNA PERSONA
    let acceso: ControlAcceso = new ControlAcceso();
    acceso.identificacion = this.formAcceso.get('identificacion')!.value;
    acceso.usuarioTipo = this.formAcceso.get('usuarioTipo')!.value;
    let puesto: PuestoVigilancia = new PuestoVigilancia();
    puesto.codigo = this.auth.user.puesto;
    acceso.puesto = puesto;
    acceso.accesoTipo = 2;
    acceso.fecha = new Date();
    this.controlAccesoService.registrarAcceso(acceso).subscribe(
      (data) => {
        if (data > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'El usuario salio de la institución.',
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          this.mensajeError();
        }
      },
      (err) => this.fError(err)
    );
  }

  entrada() {
    this.foto.url = '';
    this.busquedaAdministrativo = '';
    this.busquedaDocente = '';
    this.busquedaGraduado = '';
    this.busqueda = '';
    this.busquedaAdministrativo = '';
    this.carnetEstudiante = false;
    this.carnetGraduado = false;
    this.carnetDocente = false;
    this.carnetAdministrativo = false;
    this.alert = true;
    this.registrarIngreso();
  }

  salida() {
    this.foto.url = '';
    this.busquedaAdministrativo = '';
    this.busquedaDocente = '';
    this.busquedaGraduado = '';
    this.busqueda = '';
    this.busquedaAdministrativo = '';
    this.carnetEstudiante = false;
    this.carnetGraduado = false;
    this.carnetDocente = false;
    this.carnetAdministrativo = false;
    this.alert = true;
    this.registrarSalida();
  }

  decryptParams(encryptedParams: string): { param1: string; param2: string } {
    const currentDate: any = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    let fecha = currentDate.toString();
    const [encryptedParam1, encryptedParam2] = encryptedParams.split(',');
    const decryptedParam1 = CryptoJS.AES.decrypt(
      encryptedParam1,
      fecha
    ).toString(CryptoJS.enc.Utf8);
    const decryptedParam2 = CryptoJS.AES.decrypt(
      encryptedParam2,
      fecha
    ).toString(CryptoJS.enc.Utf8);
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
    page.scrollIntoView();
  }

  buscar(estamento: number, codigo: String) {
    switch (estamento) {
      case 1: //ADMINISTRATIVO
        this.formAcceso.get('usuarioTipo')!.setValue(1);
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = false;
        this.carnetDocente = false;
        this.carnetAdministrativo = true;
        this.tiquete = false;
        this.buscarAdministrativo(codigo);
        break;
      case 2: //ESTUDIANTE
        this.formAcceso.get('usuarioTipo')!.setValue(2);
        this.foto.url = '';
        this.carnetEstudiante = true;
        this.carnetGraduado = false;
        this.carnetDocente = false;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.buscarEstudiante(codigo);
        break;
      case 3: //DOCENTE
        this.formAcceso.get('usuarioTipo')!.setValue(3);
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = false;
        this.carnetDocente = true;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.buscarDocente(codigo);
        break;
      case 4: //GRADUADO
        this.formAcceso.get('usuarioTipo')!.setValue(4);
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = true;
        this.carnetDocente = false;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.buscarGraduado(codigo);
        break;
      case 7: //TIQUETE
        this.formAcceso.get('usuarioTipo')!.setValue(7);
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
    this.alert = false;
    switch (+estamento) {
      case 1: //ADMINISTRATIVO
        this.formAcceso.get('usuarioTipo')!.setValue(1);
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = false;
        this.carnetDocente = false;
        this.carnetAdministrativo = true;
        this.tiquete = false;
        this.busquedaAdministrativo = '';
        this.busquedaDocente = '';
        this.busqueda = '';
        this.busquedaGraduado = '';
        break;
      case 2: //ESTUDIANTE
        this.formAcceso.get('usuarioTipo')!.setValue(2);
        this.foto.url = '';
        this.carnetEstudiante = true;
        this.carnetGraduado = false;
        this.carnetDocente = false;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.busquedaAdministrativo = '';
        this.busquedaDocente = '';
        this.busquedaGraduado = '';
        break;
      case 3: //DOCENTE
        this.formAcceso.get('usuarioTipo')!.setValue(3);
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = false;
        this.carnetDocente = true;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.busquedaAdministrativo = '';
        this.busqueda = '';
        this.busquedaGraduado = '';
        break;
      case 4: //GRADUADO
        this.formAcceso.get('usuarioTipo')!.setValue(4);
        this.foto.url = '';
        this.carnetEstudiante = false;
        this.carnetGraduado = true;
        this.carnetDocente = false;
        this.carnetAdministrativo = false;
        this.tiquete = false;
        this.busquedaAdministrativo = '';
        this.busquedaDocente = '';
        this.busqueda = '';
        break;
      case 5: //TIQUETE
        this.formAcceso.get('usuarioTipo')!.setValue(7);
        this.tiquete = true;
        this.carnetEstudiante = false;
        this.carnetGraduado = false;
        this.carnetDocente = false;
        this.carnetAdministrativo = false;
        this.busquedaAdministrativo = '';
        this.busquedaDocente = '';
        this.busquedaGraduado = '';
        this.busqueda = '';
        break;
      default:
        Swal.fire({
          icon: 'error',
          title: 'Codigo desconocido',
          text: 'El código no posee los parametros correspondientes.',
          confirmButtonColor: '#8f141b',
          confirmButtonText: 'Listo',
        });
        break;
    }
  }

  buscarEstudiante(codigo: String) {
    this.estServices.getEstudiante(codigo).subscribe((data) => {
      if (JSON.stringify(data) !== '[]') {
        this.lectura();
        this.estudiante = data;
        this.codigoQr =
          'https://sanagustin.usco.edu.co/planes_academicos/obtenerFoto/' +
          this.estudiante[0].persona.codigo;
        this.formAcceso
          .get('identificacion')!
          .setValue(data[0].persona.identificacion);
        this.mostrarFotoEstudiante('' + this.estudiante[0].persona.codigo);
        setTimeout(() => {
          this.showAndScrollToHiddenDiv();
        }, 1000);
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
          confirmButtonColor: '#8f141b',
          confirmButtonText: 'Listo',
        });
      }
    });
  }

  buscarGraduado(codigo: String) {
    this.graduadoService.obtenerGraduado(codigo).subscribe((data) => {
      if (JSON.stringify(data) !== '[]') {
        this.lectura();
        this.graduado = data;
        this.formAcceso
          .get('identificacion')!
          .setValue(data[0].persona.identificacion);
        this.codigoQr =
          'https://sanagustin.usco.edu.co/planes_academicos/obtenerFoto/' +
          this.graduado[0].persona.codigo;
        this.mostrarFotoGraduado('' + this.graduado[0].persona.codigo);
        setTimeout(() => {
          this.showAndScrollToHiddenDiv();
        }, 1000);
        this.scrollToSection('section1');
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
          confirmButtonColor: '#8f141b',
          confirmButtonText: 'Listo',
        });
      }
    });
  }

  buscarDocente(id: String) {
    this.docenteService.getDocente(id).subscribe((data) => {
      if (JSON.stringify(data) !== '[]') {
        this.lectura();
        this.docente = data;
        this.formAcceso
          .get('identificacion')!
          .setValue(data[0].persona.identificacion);
        this.codigoQr =
          'https://sanagustin.usco.edu.co/planes_academicos/obtenerFoto/' +
          this.docente[0].persona.codigo;
        this.mostrarFotoDocente('' + this.docente[0].persona.codigo);
        setTimeout(() => {
          this.showAndScrollToHiddenDiv();
        }, 1000);
        this.scrollToSection('section1');
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
          confirmButtonColor: '#8f141b',
          confirmButtonText: 'Listo',
        });
      }
    });
  }

  buscarAdministrativo(id: String) {
    this.administrativoService.getAdministrativo(id).subscribe((data) => {
      if (JSON.stringify(data) !== '[]') {
        this.lectura();
        this.administrativo = data;
        this.codigoQr =
          'https://sanagustin.usco.edu.co/planes_academicos/obtenerFoto/' +
          this.administrativo[0].codigo;
        this.personaService
          .obtenerPersonaPorPerCodigo(data[0].codigo)
          .subscribe((data) => {
            this.persona = data;
            this.formAcceso
              .get('identificacion')!
              .setValue(data[0].identificacion);
            this.mostrarFotoAdministrativo('' + this.persona[0].codigo);
          });
        setTimeout(() => {
          this.showAndScrollToHiddenDiv();
        }, 1000);
        this.scrollToSection('section1');
      } else {
        this.error();
        this.foto.url = '';
        Swal.fire({
          icon: 'warning',
          title: 'No existe',
          text: 'El código no encontró ningún Administrativo asociado, por favor rectifique el código.',
          confirmButtonColor: '#8f141b',
          confirmButtonText: 'Listo',
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
    this.foto.url = '-';
    this.tiketServie.obtenerTicketIdentificacion(id).subscribe((data) => {
      if (JSON.stringify(data) !== '[]') {
        if (
          this.datePipe.transform(data[0].fechaVigencia, 'yyyy-MM-dd')! >=
          this.datePipe.transform(new Date(), 'yyyy-MM-dd')!
        ) {
          this.ticket = data;
          this.formAcceso
            .get('identificacion')!
            .setValue(data[0].persona.identificacion);
          this.tipoTiquete = data[0].tipo;
          this.mensajeRealizado();
          this.lectura();
          setTimeout(() => {
            this.showAndScrollToHiddenDiv();
          }, 1000);
          this.personaService
            .obtenerPersonaPorPerCodigo(data[0].codigo)
            .subscribe((data) => {
              this.persona = data;
            });
        } else {
          this.error();
          this.foto.url = '';
          Swal.fire({
            icon: 'warning',
            title: 'No existe o expiró el tiquete',
            text: 'El código no encontró ningún Tiquete vigente o asociado, por favor rectifique el código.',
            confirmButtonColor: '#8f141b',
            confirmButtonText: 'Listo',
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
          confirmButtonColor: '#8f141b',
          confirmButtonText: 'Listo',
        });
        this.ticket = [];
      }
    });
  }

  lectura() {
    let audio = new Audio();
    audio.src = 'assets/lectura.mp3';
    audio.load();
    audio.play();
  }

  error() {
    let audio = new Audio();
    audio.src = 'assets/error.mp3';
    audio.load();
    audio.play();
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onDeviceSelectChange(selected: string) {
    const device = this.availableDevices.find((x) => x.deviceId === selected);
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
      icon: 'success',
      title: 'Usuario activo.',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  mensajeError() {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Ocurrio Un Error!',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  ngOnInit() {
    this.crearFormularioAcceso();
    if (window.screen.width <= 950) {
      // 768px portrait
      this.mobile = true;
    } else {
      this.mobile = false;
    }
    this.resizeObservable = fromEvent(window, 'resize');
    this.resizeSubscription = this.resizeObservable.subscribe((evt) => {
      if (window.screen.width <= 950) {
        // 768px portrait
        this.mobile = true;
      } else {
        this.mobile = false;
      }
    });
  }

  buscarPoliticaEstamento() {
    this.politicaService
      .obtenerPoliticaPorCodigoEstamento(2)
      .subscribe((data) => {
        this.politicaEstudiante = data;
      });
  }

  mostrarFotoEstudiante(perCodigo: String) {
    this.fotoService.mirarFoto(perCodigo).subscribe((data) => {
      var gg = new Blob([data], { type: 'application/json' });
      if (gg.size !== 4) {
        var blob = new Blob([data], { type: 'image/png' });
        const foto = blob;
        const reader = new FileReader();
        reader.onload = () => {
          this.foto.url = reader.result as string;
          if (this.foto.url != '') {
            this.mensajeRealizado();
          }
        };
        reader.readAsDataURL(foto);
      } else {
        this.fotoService
          .mirarFotoAntigua('' + this.estudiante[0].persona.codigo)
          .subscribe((data) => {
            this.foto = data;
          });
      }
    });
  }

  mostrarFotoAdministrativo(perCodigo: String) {
    this.fotoService.mirarFoto(perCodigo).subscribe((data) => {
      var gg = new Blob([data], { type: 'application/json' });
      if (gg.size !== 4) {
        var blob = new Blob([data], { type: 'image/png' });
        const foto = blob;
        const reader = new FileReader();
        reader.onload = () => {
          this.foto.url = reader.result as string;
          if (this.foto.url != '') {
            this.mensajeRealizado();
          }
        };
        reader.readAsDataURL(foto);
      } else {
        this.fotoService
          .mirarFotoAntigua('' + this.persona[0].codigo)
          .subscribe((data) => {
            this.foto = data;
          });
      }
    });
  }

  mostrarFotoDocente(perCodigo: String) {
    this.fotoService.mirarFoto(perCodigo).subscribe((data) => {
      var gg = new Blob([data], { type: 'application/json' });
      if (gg.size !== 4) {
        var blob = new Blob([data], { type: 'image/png' });
        const foto = blob;
        const reader = new FileReader();
        reader.onload = () => {
          this.foto.url = reader.result as string;
          if (this.foto.url != '') {
            this.mensajeRealizado();
          }
        };
        reader.readAsDataURL(foto);
      } else {
        this.fotoService
          .mirarFotoAntigua('' + this.docente[0].persona.codigo)
          .subscribe((data) => {
            this.foto = data;
          });
      }
    });
  }

  mostrarFotoGraduado(perCodigo: String) {
    this.fotoService.mirarFoto(perCodigo).subscribe((data) => {
      var gg = new Blob([data], { type: 'application/json' });
      if (gg.size !== 4) {
        var blob = new Blob([data], { type: 'image/png' });
        const foto = blob;
        const reader = new FileReader();
        reader.onload = () => {
          this.foto.url = reader.result as string;
          if (this.foto.url != '') {
            this.mensajeRealizado();
          }
        };
        reader.readAsDataURL(foto);
      } else {
        this.fotoService
          .mirarFotoAntigua('' + this.graduado[0].persona.codigo)
          .subscribe((data) => {
            this.foto = data;
          });
      }
    });
  }

  fError(er: any): void {
    let err = er.error.error_description;
    let arr: string[] = err.split(':');

    if (arr[0] == 'Access token expired') {
      this.auth.logout();
      this.router.navigate(['login']);
    } else {
      this.mensajeError();
    }
  }
}
