import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { PersonagemListaComponent } from './personagem-lista.component';
import { PersonagemService } from '../../../../core/services/personagem.service';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PersonagemListaComponent', () => {
  let component: PersonagemListaComponent;
  let fixture: ComponentFixture<PersonagemListaComponent>;

  let mockPersonagemService: {
    personagens: ReturnType<typeof signal>;
    loading: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
    carregarPersonagens: jest.Mock;
  };

  beforeEach(async () => {
    mockPersonagemService = {
      personagens: signal([]),
      loading: signal(false),
      error: signal(null),
      carregarPersonagens: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        PersonagemListaComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({}) }
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
            createUrlTree: () => ({}),
            serializeUrl: () => ''
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonagemListaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve chamar carregarPersonagens no início', () => {
    fixture.detectChanges();
    expect(mockPersonagemService.carregarPersonagens).toHaveBeenCalled();
  });

  it('deve chamar carregarPersonagens com o nome correto ao receber evento de busca', () => {
    const nomeBusca = 'Rick';
    component.onBusca(nomeBusca);
    expect(mockPersonagemService.carregarPersonagens).toHaveBeenCalledWith(nomeBusca);
  });

  it('deve chamar carregarPersonagens quando o método recarregar for chamado', () => {
    mockPersonagemService.carregarPersonagens.mockClear();
    mockPersonagemService.error.set('Erro de teste');
    fixture.detectChanges();

    component.recarregar();

    expect(mockPersonagemService.carregarPersonagens).toHaveBeenCalled();
  });
});