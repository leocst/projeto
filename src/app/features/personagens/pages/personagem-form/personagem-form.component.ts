import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { PersonagemService } from '../../../../core/services/personagem.service';
import { Personagem } from '../../../../core/models/personagem.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-personagem-form',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule],
  templateUrl: './personagem-form.component.html',
  styleUrls: ['./personagem-form.component.css']
})
export class PersonagemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private personagemService = inject(PersonagemService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    name: ['', Validators.required],
    species: ['', Validators.required],
    status: ['Alive', Validators.required],
    image: ['', Validators.required],
  });

  personagemId: number | null = null;

  get modoEdicao(): boolean {
    return this.personagemId !== null;
  }

  constructor() {
    effect(() => {
      const personagem = this.personagemService.personagemSelecionado();
      if (personagem && this.personagemId) {
        this.form.patchValue({
          name: personagem.name,
          species: personagem.species,
          status: personagem.status,
          image: personagem.image
        });
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {

      this.personagemId = +id;
      this.personagemService.carregarPersonagemPorId(this.personagemId);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dadosFormulario = this.form.getRawValue() as Omit<Personagem, 'id'>;

    if (this.personagemId) {
      this.personagemService.atualizarPersonagem({ ...dadosFormulario, id: this.personagemId });
    } else {
      this.personagemService.adicionarPersonagem(dadosFormulario);
    }

    this.router.navigate(['/personagens']);
  }
}