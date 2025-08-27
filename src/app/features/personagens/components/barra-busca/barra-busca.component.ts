import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-barra-busca',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './barra-busca.component.html',
  styleUrls: ['./barra-busca.component.css']
})
export class BarraBuscaComponent {
  @Output() termoBusca = new EventEmitter<string>();

  /**
   * Este método é chamado diretamente pelo template a cada 'keyup'.
   * Ele recebe o valor atual do input como uma string.
   * @param valor A string digitada pelo usuário no campo de busca.
   */
  onBusca(valor: string): void {
    this.termoBusca.emit(valor);
  }
}