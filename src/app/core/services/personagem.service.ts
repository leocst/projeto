import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Personagem, ApiResponse } from '../models/personagem.model';

export interface PersonagensState {
  personagens: Personagem[];
  loading: boolean;
  error: string | null;
  filtroNome: string;
  personagemSelecionado: Personagem | null;
}

@Injectable({
  providedIn: 'root',
} )
export class PersonagemService {
  private http = inject(HttpClient );
  private readonly API_URL = 'https://rickandmortyapi.com/api/character';

  #estado = signal<PersonagensState>({
    personagens: [],
    loading: false,
    error: null,
    filtroNome: '',
    personagemSelecionado: null,
  } );

  // --- SIGNALS PÚBLICOS ---
  public readonly personagens: Signal<Personagem[]> = computed(() => this.#estado().personagens);
  public readonly loading: Signal<boolean> = computed(() => this.#estado().loading);
  public readonly error: Signal<string | null> = computed(() => this.#estado().error);
  public readonly personagemSelecionado: Signal<Personagem | null> = computed(() => this.#estado().personagemSelecionado);

  // --- MÉTODOS PÚBLICOS ---

  public async carregarPersonagens(nome?: string): Promise<void> {
    const estadoAtual = this.#estado();
    const temFiltroNovo = nome !== undefined && nome.trim() !== estadoAtual.filtroNome;
    const listaVazia = estadoAtual.personagens.length === 0;

    if (!listaVazia && !temFiltroNovo) {
      return;
    }

    if (nome !== undefined) {
      this.#estado.update(estado => ({ ...estado, filtroNome: nome.trim() }));
    }
    const nomeFiltro = this.#estado().filtroNome;
    this.#estado.update((estado) => ({ ...estado, loading: true, error: null }));

    let url = this.API_URL;
    if (nomeFiltro) {
      url += `/?name=${encodeURIComponent(nomeFiltro)}`;
    }

    try {
      const response = await lastValueFrom(this.http.get<ApiResponse>(url ));
      this.#estado.update(estado => ({ ...estado, personagens: response.results, loading: false }));
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 404) {
        this.#estado.update(estado => ({ ...estado, personagens: [], loading: false }));
      } else {
        console.error('Erro ao buscar personagens:', err);
        this.#estado.update(estado => ({ ...estado, personagens: [], loading: false, error: 'Não foi possível carregar os personagens.' }));
      }
    }
  }

  public async carregarPersonagemPorId(id: number): Promise<void> {
    this.#estado.update(estado => ({ ...estado, loading: true, error: null, personagemSelecionado: null }));

    try {
      const personagemExistente = this.#estado().personagens.find(p => p.id === id);
      if (personagemExistente) {
        this.#estado.update(estado => ({ ...estado, personagemSelecionado: personagemExistente, loading: false }));
        return;
      }

      const url = `${this.API_URL}/${id}`;
      const personagem = await lastValueFrom(this.http.get<Personagem>(url ));
      this.#estado.update(estado => ({ ...estado, personagemSelecionado: personagem, loading: false }));

    } catch (err) {
      console.error(`Erro ao buscar personagem com ID ${id}:`, err);
      this.#estado.update(estado => ({ ...estado, loading: false, error: 'Não foi possível carregar os detalhes do personagem.' }));
    }
  }

  public adicionarPersonagem(dadosFormulario: Omit<Personagem, 'id'>): void {
    this.#estado.update(estadoAtual => {
      const novoPersonagem: Personagem = {
        ...dadosFormulario,
        id: Date.now(),
        gender: 'unknown',
        origin: { name: 'Desconhecida', url: '' },
        location: { name: 'Desconhecida', url: '' },
        episode: [],
        url: '',
        created: new Date().toISOString(),
        type: ''
      };
      return { ...estadoAtual, personagens: [novoPersonagem, ...estadoAtual.personagens] };
    });
  }

  public atualizarPersonagem(personagemAtualizado: Personagem): void {
    this.#estado.update(estado => {
      const index = estado.personagens.findIndex(p => p.id === personagemAtualizado.id);
      if (index === -1) {
        return estado;
      }
      const novaLista = [...estado.personagens];
      novaLista[index] = personagemAtualizado;
      return { ...estado, personagens: novaLista };
    });
  }

  /**
   * Exclui um personagem do estado local pelo seu ID.
   * Este é o novo método que foi adicionado.
   */
  public excluirPersonagem(id: number): void {
    this.#estado.update(estado => {
      // Filtra a lista de personagens, mantendo apenas aqueles
      // cujo ID é DIFERENTE do ID que queremos excluir.
      const novaLista = estado.personagens.filter(p => p.id !== id);

      // Retorna o novo estado com a lista atualizada.
      return {
        ...estado,
        personagens: novaLista
      };
    });
  }
}