import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TokenComponent } from './components/token/token.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { TiquetesComponent } from './components/inicio/tiquetes/tiquetes.component';
import { TiqueteInvitadosComponent } from './components/tiquete/tiquete-invitados/tiquete-invitados.component';
import { TiqueteVisitantesComponent } from './components/tiquete/tiquete-visitantes/tiquete-visitantes.component';
import { EscanerComponent } from './components/escaner/escaner.component';
import { InstructivoComponent } from './components/instructivo/instructivo.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'token', component: TokenComponent },

  { path: 'inicio', component: InicioComponent },
  
  { path: 'tiquetes', component: TiquetesComponent },
  { path: 'tiquete-invitados', component: TiqueteInvitadosComponent },
  { path: 'tiquete-visitantes', component: TiqueteVisitantesComponent },

  { path: 'escaner', component: EscanerComponent },

  { path: 'instructivo', component: InstructivoComponent },

  { path: '', pathMatch: 'full', redirectTo: '/login' },
  { path: '**', pathMatch: 'full', redirectTo: '/login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
