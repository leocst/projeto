import { Routes } from '@angular/router';
import { PersonagemListaComponent } from './pages/personagem-lista/personagem-lista.component';
import { PersonagemDetalheComponent } from './pages/personagem-detalhe/personagem-detalhe.component';
import { PersonagemFormComponent } from './pages/personagem-form/personagem-form.component';

export const PERSONAGENS_ROUTES: Routes = [
  {
    path: '',
    component: PersonagemListaComponent,
    title: 'Lista de Personagens'
  },
  {
    path: 'novo',
    component: PersonagemFormComponent,
    title: 'Novo Personagem'
  },
  {
    path: ':id/editar',
    component: PersonagemFormComponent,
    title: 'Editar Personagem'
  },
  {
    path: ':id',
    component: PersonagemDetalheComponent,
    title: 'Detalhe do Personagem'
  }
];