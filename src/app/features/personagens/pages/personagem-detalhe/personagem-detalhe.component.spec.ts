
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { PersonagemDetalheComponent } from './personagem-detalhe.component';
import { PersonagemService } from '../../../../core/services/personagem.service';
import { Personagem } from '../../../../core/models/personagem.model';
import { signal, WritableSignal } from '@angular/core';

describe('PersonagemDetalheComponent', () => {
  let component: PersonagemDetalheComponent;
  let fixture: ComponentFixture<PersonagemDetalheComponent>;
  let router: Router;

  let mockPersonagemSignal: WritableSignal<Personagem | null>;
  let mockPersonagemService: {
    personagemSelecionado: WritableSignal<Personagem | null>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
    excluirPersonagem: jest.Mock;
    carregarPersonagemPorId: jest.Mock;
  };

  const mockPersonagem: Personagem = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    image: 'url_to_image',
    gender: 'Male',
    origin: { name: 'Earth (C-137)', url: '' },
    location: { name: 'Earth (Replacement Dimension)', url: '' },
    episode: [],
    url: '',
    created: new Date().toISOString(),
    type: ''
  };

  beforeEach(async () => {
    mockPersonagemSignal = signal<Personagem | null>(null);

    mockPersonagemService = {
      personagemSelecionado: mockPersonagemSignal,
      loading: signal(false),
      error: signal(null),
      excluirPersonagem: jest.fn(),
      carregarPersonagemPorId: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        PersonagemDetalheComponent,
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: '1' }) }
          }
        },
        {
          provide: PersonagemService,
          useValue: mockPersonagemService
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            events: { subscribe: () => ({ unsubscribe: () => { } }) },
            isActive: () => false,
            createUrlTree: () => ({}),
            serializeUrl: () => ''
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonagemDetalheComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar o serviço de exclusão e navegar se o usuário confirmar', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    mockPersonagemSignal.set(mockPersonagem);
    fixture.detectChanges();

    component.onExcluir();

    expect(window.confirm).toHaveBeenCalledWith(`Tem certeza que deseja excluir ${mockPersonagem.name}? Esta ação não pode ser desfeita.`);
    expect(mockPersonagemService.excluirPersonagem).toHaveBeenCalledWith(mockPersonagem.id);
    expect(router.navigate).toHaveBeenCalledWith(['/personagens']);
  });

  it('NÃO deve chamar o serviço de exclusão nem navegar se o usuário cancelar', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    mockPersonagemSignal.set(mockPersonagem);
    fixture.detectChanges();

    component.onExcluir();

    expect(window.confirm).toHaveBeenCalledWith(`Tem certeza que deseja excluir ${mockPersonagem.name}? Esta ação não pode ser desfeita.`);
    expect(mockPersonagemService.excluirPersonagem).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});