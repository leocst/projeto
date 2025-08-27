
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { PersonagemFormComponent } from './personagem-form.component';
import { PersonagemService } from '../../../../core/services/personagem.service';
import { Personagem } from '../../../../core/models/personagem.model';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PersonagemFormComponent', () => {
  let component: PersonagemFormComponent;
  let fixture: ComponentFixture<PersonagemFormComponent>;
  let router: Router;
  let mockPersonagemService: any;

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

  async function setupTestBed(mode: 'create' | 'edit') {
    const routeParams = mode === 'edit' ? { id: '1' } : {};

    mockPersonagemService = {
      personagemSelecionado: signal<Personagem | null>(null),
      adicionarPersonagem: jest.fn(),
      atualizarPersonagem: jest.fn(),
      carregarPersonagemPorId: jest.fn().mockImplementation(() => {
        if (mode === 'edit') {
          mockPersonagemService.personagemSelecionado.set(mockPersonagem);
        }
        return Promise.resolve();
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        PersonagemFormComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(routeParams) }
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

    fixture = TestBed.createComponent(PersonagemFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  describe('Modo de Criação', () => {
    beforeEach(async () => {
      await setupTestBed('create');
      fixture.detectChanges();
    });

    it('deve criar o componente', () => {
      expect(component).toBeTruthy();
    });

    it('deve chamar adicionarPersonagem ao submeter o formulário', () => {
      component.form.setValue({
        name: 'Morty Smith',
        species: 'Human',
        status: 'Alive',
        image: 'url_morty'
      });
      component.onSubmit();
      expect(mockPersonagemService.adicionarPersonagem).toHaveBeenCalled();
      expect(mockPersonagemService.atualizarPersonagem).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/personagens']);
    });
  });

  describe('Modo de Edição', () => {
    beforeEach(async () => {
      await setupTestBed('edit');
    });

    it('deve carregar os dados do personagem e preencher o formulário', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockPersonagemService.carregarPersonagemPorId).toHaveBeenCalledWith(1);
      expect(component.form.value.name).toBe(mockPersonagem.name);
      expect(component.form.value.species).toBe(mockPersonagem.species);
    }));

    it('deve chamar atualizarPersonagem ao submeter o formulário', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const nomeAlterado = 'Evil Rick';
      component.form.patchValue({ name: nomeAlterado });
      component.onSubmit();

      const personagemEsperado = {
        id: 1,
        name: nomeAlterado,
        species: mockPersonagem.species,
        status: mockPersonagem.status,
        image: mockPersonagem.image
      };

      expect(mockPersonagemService.atualizarPersonagem).toHaveBeenCalledWith(personagemEsperado);
      expect(mockPersonagemService.adicionarPersonagem).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/personagens']);
    }));
  });
});