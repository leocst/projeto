import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PersonagemService } from './personagem.service';
import { Personagem, ApiResponse } from '../models/personagem.model';

describe('PersonagemService', ( ) => {
  let service: PersonagemService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://rickandmortyapi.com/api/character';

  const mockPersonagens: Personagem[] = [
    { id: 1, name: 'Rick Sanchez', species: 'Human', status: 'Alive', image: 'url1', gender: 'Male', origin: { name: 'Earth', url: '' }, location: { name: 'Earth', url: '' }, episode: [], url: '', created: '', type: '' },
    { id: 2, name: 'Morty Smith', species: 'Human', status: 'Alive', image: 'url2', gender: 'Male', origin: { name: 'Earth', url: '' }, location: { name: 'Earth', url: '' }, episode: [], url: '', created: '', type: '' }
  ];

  const mockApiResponse: ApiResponse = {
    info: { count: 2, pages: 1, next: null, prev: null },
    results: mockPersonagens
  };

  beforeEach(( ) => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PersonagemService]
    });
    service = TestBed.inject(PersonagemService);
    httpMock = TestBed.inject(HttpTestingController );
  });

  afterEach(() => {
    httpMock.verify( );
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('carregarPersonagens', () => {
    it('deve carregar personagens e atualizar os signals corretamente', async () => {
      const promise = service.carregarPersonagens();
      expect(service.loading()).toBe(true);
      const req = httpMock.expectOne(apiUrl );
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
      await promise;
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
      expect(service.personagens().length).toBe(2);
      expect(service.personagens()[0].name).toBe('Rick Sanchez');
    });

    it('deve tratar erro 404 (não encontrado) como uma lista vazia', async () => {
      const promise = service.carregarPersonagens('nome_inexistente');
      const req = httpMock.expectOne(`${apiUrl}/?name=nome_inexistente` );
      req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });
      await promise;
      expect(service.loading()).toBe(false);
      expect(service.error()).toBeNull();
      expect(service.personagens().length).toBe(0);
    });

    it('deve tratar outros erros de HTTP e atualizar o signal de erro', async () => {
      const promise = service.carregarPersonagens();
      const req = httpMock.expectOne(apiUrl );
      req.flush('Erro no servidor', { status: 500, statusText: 'Internal Server Error' });
      await promise;
      expect(service.loading()).toBe(false);
      expect(service.personagens().length).toBe(0);
      expect(service.error()).not.toBeNull();
      expect(service.error()).toContain('Não foi possível carregar');
    });

    // NOVO TESTE ADICIONADO AQUI
    it('não deve fazer uma nova chamada HTTP se a lista já estiver carregada e não houver filtro', async () => {
      const promise1 = service.carregarPersonagens();
      const req1 = httpMock.expectOne(apiUrl );
      req1.flush(mockApiResponse);
      await promise1;

      await service.carregarPersonagens();

      // Verifica que NENHUMA nova requisição foi feita, cobrindo a lógica de otimização
      httpMock.expectNone(apiUrl );
    });
  });

  // NOVO DESCRIBE ADICIONADO AQUI
  describe('carregarPersonagemPorId', () => {
    it('deve retornar um personagem da API se ele não estiver na lista local', async () => {
      const promise = service.carregarPersonagemPorId(99);
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne(`${apiUrl}/99` );
      req.flush({ id: 99, name: 'Alien 99', species: 'Alien', status: 'Alive', image: 'url99', gender: 'unknown', origin: { name: 'Unknown', url: '' }, location: { name: 'Unknown', url: '' }, episode: [], url: '', created: '', type: '' });
      await promise;

      expect(service.loading()).toBe(false);
      expect(service.personagemSelecionado()?.id).toBe(99);
      expect(service.personagemSelecionado()?.name).toBe('Alien 99');
    });

    it('deve retornar um personagem da lista local se ele já existir', async () => {
        // Pré-carrega a lista
        const promise1 = service.carregarPersonagens();
        httpMock.expectOne(apiUrl ).flush(mockApiResponse);
        await promise1;

        // Tenta carregar o personagem de ID 1, que já está na lista
        await service.carregarPersonagemPorId(1);

        // Verifica que NENHUMA nova requisição foi feita
        httpMock.expectNone(`${apiUrl}/1` );
        expect(service.personagemSelecionado()?.id).toBe(1);
        expect(service.personagemSelecionado()?.name).toBe('Rick Sanchez');
    });
  });

  describe('Operações Locais (CRUD)', () => {
    beforeEach(async () => {
      const promise = service.carregarPersonagens();
      const req = httpMock.expectOne(apiUrl );
      req.flush(mockApiResponse);
      await promise;
    });

    it('adicionarPersonagem deve adicionar um novo personagem no início da lista', () => {
      const novoPersonagemData: Omit<Personagem, 'id'> = {
        name: 'Summer Smith', species: 'Human', status: 'Alive', image: 'url3', gender: 'Female', origin: { name: 'Earth', url: '' }, location: { name: 'Earth', url: '' }, episode: [], url: '', created: new Date().toISOString(), type: ''
      };
      service.adicionarPersonagem(novoPersonagemData);
      const personagens = service.personagens();
      expect(personagens.length).toBe(3);
      expect(personagens[0].name).toBe('Summer Smith');
    });

    it('atualizarPersonagem deve modificar um personagem existente', () => {
      const personagemAtualizado = { ...mockPersonagens[0], name: 'Pickle Rick' };
      service.atualizarPersonagem(personagemAtualizado);
      const personagens = service.personagens();
      expect(personagens.length).toBe(2);
      expect(personagens[0].name).toBe('Pickle Rick');
    });

    // NOVO TESTE ADICIONADO AQUI
    it('atualizarPersonagem não deve fazer nada se o ID não existir', () => {
      const personagemInexistente = { ...mockPersonagens[0], id: 999, name: 'Fantasma' };
      service.atualizarPersonagem(personagemInexistente);
      const personagens = service.personagens();
      expect(personagens.length).toBe(2);
      expect(personagens[0].name).toBe('Rick Sanchez');
    });

    it('excluirPersonagem deve remover um personagem da lista', () => {
      service.excluirPersonagem(1);
      const personagens = service.personagens();
      expect(personagens.length).toBe(1);
      expect(personagens[0].name).toBe('Morty Smith');
    });
  });
});