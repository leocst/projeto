
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PersonagemService } from '../../../../core/services/personagem.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-personagem-detalhe',
  standalone: true,
  imports: [CommonModule,
    RouterLink,
    MatCardModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatIconModule,
    MatButtonModule],
  templateUrl: './personagem-detalhe.component.html',
  styleUrls: ['./personagem-detalhe.component.css']
})
export class PersonagemDetalheComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private personagemService = inject(PersonagemService);
  private router = inject(Router);

  public personagem = this.personagemService.personagemSelecionado;
  public loading = this.personagemService.loading;
  public error = this.personagemService.error;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.personagemService.carregarPersonagemPorId(+id);
    }
  }

  onExcluir(): void {
    const personagemAtual = this.personagem();
    if (!personagemAtual) {
      return;
    }

    const confirmou = confirm(`Tem certeza que deseja excluir ${personagemAtual.name}? Esta ação não pode ser desfeita.`);

    if (confirmou) {
      this.personagemService.excluirPersonagem(personagemAtual.id);
      this.router.navigate(['/personagens']);
    }
  }
}