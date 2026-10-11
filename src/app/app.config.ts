import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth-interceptor';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { provideIcons } from '@ng-icons/core';
import localeEsCo from '@angular/common/locales/es-CO';
import {
  matAccountBalanceFillOutline,
  matAccountBalanceWalletOutline,
  matArrowForwardOutline,
  matBookmarkManagerOutline,
  matCalendarMonthOutline,
  matCategoryOutline,
  matDashboardOutline,
  matDirectionsCarOutline,
  matEditOutline,
  matHelpOutline,
  matHomeOutline,
  matLogoutOutline,
  matMoreVertOutline,
  matReceiptLongOutline,
  matRestaurantOutline,
  matSearchOutline,
  matTrendingUpOutline,
} from '@ng-icons/material-symbols/outline';
import { matHouseSharp } from '@ng-icons/material-symbols/sharp';
import {
  solarDevices,
  solarMedicalKit,
  solarStream,
  solarTShirt,
} from '@ng-icons/solar-icons/outline';
import {
  matAddOutline,
  matPlusOutline,
  matTrendingDownOutline,
} from '@ng-icons/material-icons/outline';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideIcons({
      // matShoppingCartOutline,
      matHomeOutline,
      matDirectionsCarOutline,
      matTrendingUpOutline,
      matHouseSharp,
      solarMedicalKit,
      matBookmarkManagerOutline,
      solarStream,
      solarTShirt,
      solarDevices,
      matTrendingDownOutline,
      matCategoryOutline,
      matCalendarMonthOutline,
      matArrowForwardOutline,
      matEditOutline,
      matMoreVertOutline,
      matPlusOutline,
      matRestaurantOutline,
      matAccountBalanceFillOutline,
      matDashboardOutline,
      matReceiptLongOutline,
      matAccountBalanceWalletOutline,
      matLogoutOutline,
      matAddOutline,
      matHelpOutline,
      matSearchOutline,
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHotToastConfig({ theme: 'toast', position: 'top-center', duration: 2200 }),
    provideEnvironmentNgxMask(),
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ],
};
