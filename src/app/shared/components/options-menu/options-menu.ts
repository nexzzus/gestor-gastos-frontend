import { Component, ElementRef, effect, inject, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matMoreVertOutline } from '@ng-icons/material-icons/outline';

export interface MenuOption {
  id: string;
  label: string;
  danger?: boolean;
}

@Component({
  selector: 'app-options-menu',
  imports: [NgIcon],
  templateUrl: './options-menu.html',
  providers: [provideIcons({ matMoreVertOutline })],
  host: {
    class: 'relative inline-block',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class OptionsMenu {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  options = input.required<MenuOption[]>();
  // 'auto' abre hacia arriba si no hay espacio debajo
  position = input<'auto' | 'down' | 'up'>('auto');
  selected = output<string>();

  open = signal(false);
  // Coordenadas en pantalla (el menú es position: fixed, así que no lo recorta ningún overflow)
  menuPos = signal<{ top?: string; bottom?: string; right: string }>({ right: '0px' });

  constructor() {
    // Mientras está abierto: cerrar al hacer scroll (en cualquier contenedor) o redimensionar
    effect((onCleanup) => {
      if (!this.open()) return;
      const close = () => this.close();
      document.addEventListener('scroll', close, true);
      window.addEventListener('resize', close);
      onCleanup(() => {
        document.removeEventListener('scroll', close, true);
        window.removeEventListener('resize', close);
      });
    });
  }

  toggle(trigger: HTMLElement): void {
    if (this.open()) {
      this.close();
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const estimatedHeight = this.options().length * 40 + 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    const pos = this.position();
    const openUp =
      pos === 'up' || (pos === 'auto' && spaceBelow < estimatedHeight && rect.top > spaceBelow);

    this.menuPos.set({
      right: `${window.innerWidth - rect.right}px`,
      ...(openUp
        ? { bottom: `${window.innerHeight - rect.top + 4}px` }
        : { top: `${rect.bottom + 4}px` }),
    });
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  select(option: MenuOption): void {
    this.selected.emit(option.id);
    this.close();
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
