import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  imports: [NgIcon],
  selector: 'app-button',
  styleUrl: './button.css',
  templateUrl: './button.html',
})
export class Button {
  text = input('text');
  colorText = input('text-white');
  colorBg = input('bg-primary-2');
  type = input<'button' | 'submit' | 'reset'>('button');
  icon = input<string>('');
  disabled = input(false);

  styles = computed(() => {
    const baseStyles = `flex justify-center items-center font-medium w-full h-11 rounded-lg p-3
     shadow shadow-${this.colorBg()}/[2]
     transition duration-200 ${this.disabled() ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105 active:scale-95 hover:' + this.colorBg() + '/90'}`;

    return `${baseStyles} ${this.colorText()} ${this.colorBg()}`;
  });
}
