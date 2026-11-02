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
    const baseStyles = `flex justify-center items-center font-semibold text-sm w-full sm:w-auto h-11 rounded-2xl px-5 py-2.5 gap-2
     shadow-sm hover:shadow
     transition duration-200 ${this.disabled() ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105 active:scale-95 hover:' + this.colorBg() + '/90'}`;

    return `${baseStyles} ${this.colorText()} ${this.colorBg()}`;
  });
}
