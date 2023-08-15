import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { TipoDocumentoService } from '../../../services/tipo-documento.service';
import { TipoDocumento } from '../../../models/tipo-documento';
import { TerceroService } from '../../../services/tercero.service';
import { Tercero } from '../../../models/tercero';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Sede } from '../../../models/sede';
import { SubSede } from '../../../models/sub-sede';
import { Bloque } from '../../../models/bloque';
import { UbicacionService } from '../../../services/ubicacion.service';
import { Oficina } from '../../../models/oficina';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Ticket } from '../../../models/ticket';
import { TicketService } from '../../../services/ticket.service';
import { DatePipe } from '@angular/common';
import { Persona } from '../../../models/persona';
import { PersonaService } from '../../../services/persona.service';
import { GraduadoService } from '../../../services/graduado.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-tiquete-visitantes',
  templateUrl: './tiquete-visitantes.component.html',
  styleUrls: ['./tiquete-visitantes.component.css'],
  providers: [DatePipe],
})
export class TiqueteVisitantesComponent implements OnInit {
  //Arreglos
  listaTickets: Ticket[] = [];
  tipoDocumentos: TipoDocumento[] = [];
  tercero: Tercero[] = [];
  sedes: Sede[] = [];
  subsedes: SubSede[] = [];
  bloques: Bloque[] = [];
  oficinas: Oficina[] = [];
  persona: Persona[] = [];
  emails: any = [];

  //Booleanos
  tipoLugar: any = true;
  terceroExiste!: any;
  ipuntEmailPersona: any = false;
  personaExiste: any = false;
  graduadoExiste!: any;
  correoGraduado: any = false;
  ticket: any = false;
  botonesTickets: any = false;
  enviarTicketPersona: any = true;
  mobile: boolean = false;

  //Complementos
  hoy: Date = new Date();
  resizeObservable!: Observable<Event>;
  resizeSubscription!: Subscription;

  dataSource = new MatTableDataSource<Ticket>([]);
  displayedColumns: string[] = ['nombre', 'lugar', 'opciones'];
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  qrCodeTwo: any = null;
  formTercero!: FormGroup;
  selectDateInicio!: Date | null;
  selectDateFin!: Date | null;
  dateInicio = new FormControl(new Date());
  dateFin = new FormControl(new Date());
  filteredOptions!: Observable<Oficina[]>;
  myControl = new FormControl();
  oficinaCodigo!: number;
  carnetLugar: any = 'Lugar';
  carnetNombre: any = 'Nombre';
  carnetId: any = '********';
  carnetCorreo: any = '@email.com';
  carnetInicio: any = '';
  carnetVigencia: any = '';
  codigoTercero!: any;

  constructor(
    private formBuilder: FormBuilder,
    public tipoDocumentoService: TipoDocumentoService,
    public terceroService: TerceroService,
    public ticketService: TicketService,
    public ubicacionService: UbicacionService,
    public personaService: PersonaService,
    public graduadoService: GraduadoService,
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe
  ) {
    if (this.authService.validacionToken()) {
      this.qrCodeTwo = 'https://gaitana.usco.edu.co/sgd/';
      this.obtenerSede();
      this.obtenerTipoDocumento();
    }
  }

  ngOnInit() {
    this.crearFormularioTercero();
    this.obtenerTickets();
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

  private crearFormularioTercero(): void {
    this.formTercero = this.formBuilder.group({
      //Vaiables Entidad Tercero
      codigo: new FormControl(''),
      tipoDocumento: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      identificacion: new FormControl('', [
        Validators.required,
        Validators.maxLength(15),
        Validators.pattern('^[0-9]*$'),
      ]),
      nombreCompleto: new FormControl(''),
      nombre1: new FormControl(''),
      nombre2: new FormControl(''),
      apellido1: new FormControl(''),
      apellido2: new FormControl(''),
      email: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      emailPersona: new FormControl(''),
      //Variables Entidad TicketVisitante
      terceroCodigo: new FormControl(''),
      nombre: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      apellido: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      sede: new FormControl({ value: '', disabled: true }, Validators.required),
      subsede: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      bloque: new FormControl(''),
      oficina: new FormControl(''),
      sedeCodigo: new FormControl(''),
      subsedeCodigo: new FormControl(''),
      bloqueCodigo: new FormControl(''),
      oficinaCodigo: new FormControl(''),
      tipoUbicacion: new FormControl('', Validators.required),
    });
  }

  cancelar() {
    this.formTercero.reset();
    this.obtenerSede();
    this.obtenerTipoDocumento();
    this.ticket = false;
    this.graduadoExiste = false;
  }

  obtenerTickets() {
    this.ticketService.obtenerTickets(2).subscribe((data) => {
      this.dataSource = new MatTableDataSource<Ticket>(data);
      this.listaTickets = data;
      this.paginator.firstPage();
      this.dataSource.paginator = this.paginator;
    });
  }

  tipoRegistro() {
    this.correoGraduado = !this.correoGraduado;
    this.ipuntEmailPersona = !this.ipuntEmailPersona;
  }

  obtenerSede() {
    this.ubicacionService.obtenerSedes().subscribe((data) => {
      this.sedes = data;
    });
  }

  obtenerTipoDocumento() {
    this.tipoDocumentoService.getTiposDocumentos().subscribe((data) => {
      this.tipoDocumentos = data;
    });
  }

  buscarPersona() {
    this.formTercero.get('sede')!.setValue(this.authService.user.sede);
    this.buscarSubsede(this.authService.user.sede);
    this.formTercero.get('subsede')!.setValue(this.authService.user.subsede);
    this.buscarBloque(this.authService.user.subsede);
    this.ticket = false;
    this.enviarTicketPersona = true;
    this.ipuntEmailPersona = false;
    this.emails = [];
    this.personaService
      .obtenerPersonaPorIdentificacion(
        this.formTercero.get('identificacion')!.value
      )
      .subscribe((data) => {
        if (JSON.stringify(data) !== '[]') {
          this.personaExiste = true;
          this.graduadoService
            .obtenerGraduado(data[0].identificacion)
            .subscribe((data) => {
              if (JSON.stringify(data) !== '[]') {
                this.graduadoExiste = true;
                swal.fire({
                  icon: 'warning',
                  title: 'El visitante es un Graduado',
                  confirmButtonText: 'Listo',
                  confirmButtonColor: '#8f141b',
                  text: 'Si el graduado no posee un correo electrónico vigente, por favor active el botón de la esquina superior derecha de este formulario, el sistema notificará a la Oficina de Graduados para su respectiva actualización, gracias.',
                });
              } else {
                this.graduadoExiste = false;
              }
            });
          this.persona = data;
          this.personaExiste = true; //Cambia input email por un select email
          this.emails.push(
            this.persona[0].emailPersonal,
            this.persona[0].emailInterno
          );
          this.terceroExiste = true;
          this.formTercero.controls['email'].enable();
          this.formTercero.controls['sede'].enable();
          this.formTercero.controls['subsede'].enable();
          this.obtenerSede();
          this.obtenerTipoDocumento();
          this.formTercero.get('codigo')!.setValue(this.persona[0].codigo);
          this.formTercero
            .get('tipoDocumento')!
            .setValue(this.persona[0].tipoDocumento);
          this.formTercero.get('nombre')!.setValue(this.persona[0].nombre);
          this.formTercero.get('apellido')!.setValue(this.persona[0].apellido);
          this.formTercero.get('email')!.setValue(this.persona[0].emailInterno);
        } else {
          this.buscarTercero();
        }
      });
  }

  buscarTercero() {
    this.graduadoExiste = false;
    this.terceroService
      .getTerceroId(this.formTercero.get('identificacion')!.value)
      .subscribe((data) => {
        if (JSON.stringify(data) !== '[]') {
          this.terceroExiste = true;
          this.ipuntEmailPersona = true;
          this.formTercero.controls['email'].enable();
          this.formTercero.controls['sede'].enable();
          this.formTercero.controls['subsede'].enable();
          this.obtenerSede();
          this.obtenerTipoDocumento();
          this.formTercero.get('codigo')!.setValue(data[0].codigo);
          this.formTercero.get('terceroCodigo')!.setValue(data[0].codigo);
          this.formTercero
            .get('tipoDocumento')!
            .setValue(data[0].tipoDocumento);
          this.formTercero
            .get('nombreCompleto')!
            .setValue(
              data[0].nombre1 +
                ' ' +
                data[0].nombre2 +
                ' ' +
                data[0].apellido1 +
                ' ' +
                data[0].apellido2
            );
          this.formTercero
            .get('nombre')!
            .setValue(data[0].nombre1 + ' ' + data[0].nombre2);
          this.formTercero.get('nombre1')!.setValue(data[0].nombre1);
          this.formTercero.get('nombre2')!.setValue(data[0].nombre1);
          this.formTercero
            .get('apellido')!
            .setValue(data[0].apellido1 + ' ' + data[0].apellido2);
          this.formTercero.get('apellido1')!.setValue(data[0].apellido1);
          this.formTercero.get('apellido2')!.setValue(data[0].apellido2);
          this.formTercero.get('email')!.setValue(data[0].email);
          this.tercero = data;
        } else {
          this.terceroExiste = false;
          this.graduadoExiste = false;
          this.ipuntEmailPersona = true;
          this.personaExiste = false;
          let id = this.formTercero.get('identificacion')!.value;
          this.formTercero.controls['tipoDocumento'].enable();
          this.formTercero.controls['nombre'].enable();
          this.formTercero.controls['apellido'].enable();
          this.formTercero.controls['email'].enable();
          this.formTercero.controls['sede'].enable();
          this.formTercero.controls['subsede'].enable();
          this.mensajeAdvertencia();
          this.formTercero.reset();
          this.formTercero.get('identificacion')!.setValue(id);
          this.obtenerTipoDocumento();
        }
      });
  }

  buscarSubsede(codigo: number) {
    this.formTercero.get('subsede')!.reset;
    this.ubicacionService.buscarSubSedes(codigo).subscribe((data) => {
      this.subsedes = data;
    });
    this.formTercero.get('oficina')!.reset;
    this.ubicacionService.buscarOficinas(codigo).subscribe((data) => {
      this.oficinas = data;
    });

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  buscarOficina(codigo: number) {
    this.formTercero.get('oficina')!.reset;
    this.ubicacionService.buscarOficinas(codigo).subscribe((data) => {
      this.oficinas = data;
    });
  }

  buscarBloque(codigo: number) {
    this.formTercero.get('bloque')!.reset;
    this.ubicacionService.buscarBloques(codigo).subscribe((data) => {
      console.log('BLOQUE:: ',data);
      this.bloques = data;
    });
  }

  generarTercero(): void {
    this.terceroService
      .getTerceroId(this.formTercero.get('identificacion')!.value)
      .subscribe((data) => {
        if (JSON.stringify(data) !== '[]') {
          this.terceroExiste = true;
          let tercero: Tercero = new Tercero();
          let nombres = this.formTercero.get('nombre')!.value.split(' ', 2);
          let apellidos = this.formTercero.get('apellido')!.value.split(' ', 2);
          tercero.codigo = data[0].codigo;
          tercero.tipoDocumento = this.formTercero.get('tipoDocumento')!.value;
          tercero.identificacion =
            this.formTercero.get('identificacion')!.value;
          tercero.nombreCompleto = '';
          for (let index = 0; index < nombres.length; index++) {
            tercero.nombreCompleto =
              tercero.nombreCompleto + nombres[index].toUpperCase() + ' ';
            if (index == 0) {
              tercero.nombre1 = '' + nombres[index].toUpperCase();
              tercero.nombre2 = '';
            }
            if (index == 1) {
              tercero.nombre2 = '' + nombres[index].toUpperCase();
            }
          }
          for (let index = 0; index < apellidos.length; index++) {
            tercero.nombreCompleto =
              tercero.nombreCompleto + apellidos[index].toUpperCase() + ' ';
            if (index == 0) {
              tercero.apellido1 = '' + apellidos[index].toUpperCase();
              tercero.apellido2 = '';
            }
            if (index == 1) {
              tercero.apellido2 = '' + apellidos[index].toUpperCase();
            }
          }
          tercero.email = this.formTercero.get('email')!.value;
          tercero.estado = '0';
          tercero.fechaRegistro = new Date();
          this.tercero[0] = tercero;
          this.carnetNombre = tercero.nombreCompleto;
          this.carnetCorreo = this.formTercero.get('email')!.value;
          this.carnetId = this.formTercero.get('identificacion')!.value;
          this.carnetInicio =
            '' + this.datePipe.transform(new Date(), 'dd-MM-yyyy');
          this.carnetVigencia =
            '' + this.datePipe.transform(new Date(), 'dd-MM-yyyy');
          if (this.terceroExiste) {
            this.actualizarTercero(tercero);
          } else {
            this.resgistrarTercero(tercero);
          }
        } else {
          this.terceroExiste = false;
          let tercero: Tercero = new Tercero();
          let nombres = this.formTercero.get('nombre')!.value.split(' ', 2);
          let apellidos = this.formTercero.get('apellido')!.value.split(' ', 2);
          tercero.codigo = this.formTercero.get('codigo')!.value;
          tercero.tipoDocumento = this.formTercero.get('tipoDocumento')!.value;
          tercero.identificacion =
            this.formTercero.get('identificacion')!.value;
          tercero.nombreCompleto = '';
          for (let index = 0; index < nombres.length; index++) {
            tercero.nombreCompleto =
              tercero.nombreCompleto + nombres[index].toUpperCase() + ' ';
            if (index == 0) {
              tercero.nombre1 = '' + nombres[index].toUpperCase();
              tercero.nombre2 = '';
            }
            if (index == 1) {
              tercero.nombre2 = '' + nombres[index].toUpperCase();
            }
          }
          for (let index = 0; index < apellidos.length; index++) {
            tercero.nombreCompleto =
              tercero.nombreCompleto + apellidos[index].toUpperCase() + ' ';
            if (index == 0) {
              tercero.apellido1 = '' + apellidos[index].toUpperCase();
              tercero.apellido2 = '';
            }
            if (index == 1) {
              tercero.apellido2 = '' + apellidos[index].toUpperCase();
            }
          }
          tercero.email = this.formTercero.get('email')!.value;
          tercero.estado = '0';
          tercero.fechaRegistro = new Date();
          this.tercero[0] = tercero;
          this.qrCodeTwo = tercero.nombreCompleto;
          this.carnetNombre = tercero.nombreCompleto;
          this.carnetCorreo = this.formTercero.get('email')!.value;
          this.carnetId = this.formTercero.get('identificacion')!.value;
          this.carnetInicio =
            '' + this.datePipe.transform(new Date(), 'dd-MM-yyyy');
          this.carnetVigencia =
            '' + this.datePipe.transform(new Date(), 'dd-MM-yyyy');
          if (this.terceroExiste) {
            this.actualizarTercero(tercero);
          } else {
            this.resgistrarTercero(tercero);
          }
        }
      });
  }

  resgistrarTercero(tercero: Tercero) {
    this.terceroService.registrarTercero(tercero).subscribe(
      (data) => {
        if (data > 0) {
          swal.fire({
            icon: 'success',
            title: 'Registrado',
            text: '¡Operación exitosa!',
            toast: true,
            position: 'top-right',
            timer: 2500,
          });
          this.ticket = !this.ticket;
          //this.generarTicket();
        } else {
          this.mensajeError();
        }
      },
      (err) => this.fError(err)
    );
  }

  actualizarTercero(tercero: Tercero) {
    this.terceroService.actualizarEmailTercero(tercero).subscribe(
      (data) => {
        if (data > 0) {
          swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: '¡Operación exitosa!',
            toast: true,
            position: 'top-right',
            timer: 2500,
          });
          this.ticket = !this.ticket;
          //this.generarTicket();
        } else {
          this.mensajeError();
        }
      },
      (err) => this.fError(err)
    );
  }

  generarTicketTercero(): void {
    this.terceroService
      .getTerceroId(this.formTercero.get('identificacion')!.value)
      .subscribe((data) => {
        this.codigoTercero = data[0].codigo;
        let ticket: Ticket = new Ticket();
        let sede: Sede = new Sede();
        let subSede: SubSede = new SubSede();
        let bloque: Bloque = new Bloque();
        let oficina: Oficina = new Oficina();
        let tercero: Tercero = new Tercero();
        let persona: Persona = new Persona();
        tercero.codigo = this.codigoTercero;
        ticket.tercero = tercero;
        //persona.codigo = null;
        ticket.persona = persona;
        ticket.fechaCreacion = new Date();
        ticket.fechaVigencia = new Date();
        ticket.qr = '7%20' + data[0].identificacion;
        sede.codigo = this.formTercero.get('sede')!.value;
        ticket.sede = sede;
        subSede.codigo = this.formTercero.get('subsede')!.value;
        ticket.subSede = subSede;
        if (+this.formTercero.get('tipoUbicacion')!.value === 1) {
          bloque.codigo = +this.formTercero.get('bloque')!.value;
          //oficina.codigo = null;
        } else {
          oficina.codigo = +this.formTercero.get('oficinaCodigo')!.value;
          //bloque.codigo = null;
        }
        ticket.bloque = bloque;
        ticket.oficina = oficina;
        ticket.tipoLugar = +this.formTercero.get('tipoUbicacion')!.value;
        ticket.tipo = 2;
        if (this.correoGraduado === true) {
          ticket.emailGraduado = 1;
        } else {
          ticket.emailGraduado = 0;
        }
        this.resgistrarTicket(ticket);
        this.enviarTicketEmailTercero(ticket);
      });
  }

  generarTicketPersona(): void {
    this.ticket = !this.ticket;
    let ticket: Ticket = new Ticket();
    let sede: Sede = new Sede();
    let subSede: SubSede = new SubSede();
    let bloque: Bloque = new Bloque();
    let oficina: Oficina = new Oficina();
    let tercero: Tercero = new Tercero();
    let persona: Persona = new Persona();
    persona.codigo = this.persona[0].codigo;
    ticket.persona = persona;
    //tercero.codigo = null;
    ticket.tercero = tercero;
    ticket.fechaCreacion = new Date();
    ticket.fechaVigencia = new Date();
    ticket.qr = '7%20' + this.persona[0].identificacion;
    sede.codigo = this.formTercero.get('sede')!.value;
    ticket.sede = sede;
    subSede.codigo = this.formTercero.get('subsede')!.value;
    ticket.subSede = subSede;
    if (+this.formTercero.get('tipoUbicacion')!.value === 1) {
      bloque.codigo = +this.formTercero.get('bloque')!.value;
      //oficina.codigo = null;
    } else {
      oficina.codigo = +this.formTercero.get('oficinaCodigo')!.value;
      //bloque.codigo = null;
    }
    ticket.bloque = bloque;
    ticket.oficina = oficina;
    ticket.tipoLugar = +this.formTercero.get('tipoUbicacion')!.value;
    ticket.tipo = 2;
    ticket.emailGraduado = 0;
    this.resgistrarTicket(ticket);
    this.carnetNombre =
      this.formTercero.get('nombre')!.value +
      ' ' +
      this.formTercero.get('apellido')!.value;
    this.carnetCorreo = this.formTercero.get('email')!.value;
    this.carnetId = this.formTercero.get('identificacion')!.value;
    this.carnetInicio = '' + this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    this.carnetVigencia =
      '' + this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    this.enviarTicketEmailPersona(ticket);
  }

  resgistrarTicket(ticket: Ticket) {
    this.ticketService.registrarTicket(ticket).subscribe(
      (data) => {
        if (data > 0) {
          this.mensajeSuccses();
          this.obtenerTickets();
          //this.generarTicket();
        } else {
          this.mensajeError();
        }
      },
      (err) => this.fError(err)
    );
  }

  enviarTicketEmailTercero(ticket: Ticket) {
    this.terceroService
      .getTerceroId(this.formTercero.get('identificacion')!.value)
      .subscribe((data) => {
        let email = this.formTercero.get('email')!.value;
        let nombre = data[0].nombreCompleto;
        let identificacion = data[0].identificacion;
        this.ticketService
          .obtenerTicketTerCodigo(data[0].codigo, 2)
          .subscribe((data) => {
            let fechaInicioEmail: any = this.datePipe.transform(
              new Date(),
              'dd-MM-yyyy'
            );
            let fechaVigenciaEmail: any = this.datePipe.transform(
              new Date(),
              'dd-MM-yyyy'
            );
            let qr: String = 'size=150x150&data=' + '7%20' + identificacion;
            this.qrCodeTwo = data[0].codigo + '-' + nombre;
            this.ticketService
              .enviarTicketVisitanteEmail(
                email,
                nombre,
                identificacion,
                this.carnetLugar,
                fechaInicioEmail,
                fechaVigenciaEmail,
                qr
              )
              .subscribe(
                (data) => {
                  if (data.estado == true) {
                    this.mensajeSuccsesEmail();
                  } else {
                    this.mensajeError();
                  }
                },
                (err) => this.fError(err)
              );
          });
      });
  }

  enviarTicketEmailPersona(ticket: Ticket) {
    this.enviarTicketPersona = false;
    this.personaService
      .obtenerPersonaPorIdentificacion(
        this.formTercero.get('identificacion')!.value
      )
      .subscribe((data) => {
        let email = this.formTercero.get('email')!.value;
        let nombre = data[0].nombre + ' ' + data[0].apellido;
        let identificacion = data[0].identificacion;
        this.ticketService
          .obtenerTicketPerCodigo(data[0].codigo, 2)
          .subscribe((data) => {
            let fechaInicioEmail: any = this.datePipe.transform(
              new Date(),
              'dd-MM-yyyy'
            );
            let fechaVigenciaEmail: any = this.datePipe.transform(
              new Date(),
              'dd-MM-yyyy'
            );
            let qr: String = 'size=150x150&data=' + '7%20' + identificacion;
            this.ticketService
              .enviarTicketVisitanteEmail(
                email,
                nombre,
                identificacion,
                this.carnetLugar,
                fechaInicioEmail,
                fechaVigenciaEmail,
                qr
              )
              .subscribe(
                (data) => {
                  if (data.estado == true) {
                    this.mensajeSuccsesEmail();
                  } else {
                    this.mensajeError();
                  }
                },
                (err) => this.fError(err)
              );
          });
      });
  }

  //FILTRO AUTOCOMPLETAR OFICINA
  private _filter(value: any): Oficina[] {
    const filterValue = value.toLowerCase();
    return this.oficinas.filter((oficina) =>
      oficina.uaaNombre.toLowerCase().includes(filterValue)
    );
  }

  openDialog(element: any): void {
    const dialogRef = this.dialog.open(ModalTiqueteVisitante, {
      data: { ticket: element },
    });
  }

  cargarLugar(lugar: any, codigo: any, condicion: any) {
    this.carnetLugar = lugar;
    if (condicion === 1) {
      this.formTercero.get('bloque')!.setValue(codigo);
      this.carnetLugar = lugar;
    } else {
      this.formTercero.get('oficinaCodigo')!.setValue(codigo);
      this.carnetLugar = lugar;
      this.oficinaCodigo = codigo;
    }
  }

  irArriba(page: HTMLElement) {
    page.scrollIntoView();
  }

  /* generarTicket() {
    this.ticket = !this.ticket;
  } */

  mensajeAdvertencia() {
    swal.fire({
      icon: 'warning',
      title: 'Sin Resultados',
      text: 'No se encontró ninguna persona relacionada con el documento, por favor completar los campos necesarios para el registro.',
      showConfirmButton: true,
      confirmButtonText: 'Listo',
      confirmButtonColor: '#8f141b',
    });
  }

  mensajeError() {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo completar el proceso.',
      showConfirmButton: true,
      confirmButtonText: 'Listo',
      confirmButtonColor: '#8f141b',
    });
  }

  mensajeSuccsesEmail() {
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
      title: 'Correo enviado, ¡Operación exitosa!',
    });
  }

  mensajeSuccses() {
    swal.fire({
      icon: 'success',
      title: 'Registrado.',
      text: '¡Operación exitosa!',
      showConfirmButton: false,
      timer: 2500,
    });
  }

  fError(er: any): void {
    let err = er.error.error_description;
    let arr: string[] = err.split(':');

    if (arr[0] == 'Access token expired') {
      this.authService.logout();
      this.router.navigate(['login']);
    } else {
      this.mensajeError();
    }
  }
}

//// MODAL

@Component({
  selector: 'modal-tiquete-visitante',
  templateUrl: 'modal-tiquete-visitante.html',
  styleUrls: ['./tiquete-visitantes.component.css'],
})
export class ModalTiqueteVisitante implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ModalTiqueteVisitante>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
