import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoryIcon',
})
export class CategoryIconPipe implements PipeTransform {
  // Diccionario centralizado de íconos
  private categoryIcons: Record<string, string> = {
    ALIMENTACION: 'matRestaurantOutline',
    VIVIENDA: 'matHomeOutline',
    TRANSPORTE: 'matDirectionsCarOutline',
    INGRESO: 'matTrendingUpOutline',
    SERVICIOS: 'matHouseSharp',
    SALUD: 'solarMedicalKit',
    EDUCACION: 'matBookmarkManagerOutline',
    ENTRETENIMIENTO: 'solarStream',
    ROPA: 'solarTShirt',
    TECNOLOGIA: 'solarDevices',
  };

  transform(categoryName: string | undefined): string {
    if (!categoryName) return 'matCategoryOutline '; // ícono por defecto si no se ingresa una

    return this.categoryIcons[categoryName.toUpperCase()] || 'matCategoryOutline'; // ícono por defecto si no se encuentra la categoría
  }
}
