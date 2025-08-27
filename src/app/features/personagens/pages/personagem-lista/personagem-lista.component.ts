import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonagemService } from '../../../../core/services/personagem.service';
import { BarraBuscaComponent } from '../../components/barra-busca/barra-busca.component';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button'

@Component({
  selector: 'app-personagem-lista',
  standalone: true,
  imports: [CommonModule,
    BarraBuscaComponent,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './personagem-lista.component.html',
  styleUrls: ['./personagem-lista.component.css']
})
export class PersonagemListaComponent implements OnInit {
  private personagemService = inject(PersonagemService);

  public personagens = this.personagemService.personagens;
  public loading = this.personagemService.loading;
  public error = this.personagemService.error;

  ngOnInit(): void {
    this.personagemService.carregarPersonagens();
  }

  onBusca(nome: string): void {
    this.personagemService.carregarPersonagens(nome);
  }

  recarregar(): void {
    this.personagemService.carregarPersonagens();
  }
}