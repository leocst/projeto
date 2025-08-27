import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'personagens',
    loadChildren: () => import('./features/personagens/personagens.routes')
      .then(m => m.PERSONAGENS_ROUTES) 
  },
  {
    path: '',
    redirectTo: '/personagens',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/personagens'
  }
];