import { InjectionToken, LOCALE_ID, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { DataModule } from './data/data.module'
import { ControllerModule } from './controller/controller.module'
import { environment } from 'src/environments/environments'
import { AccessTokens } from './data/interfaces'
import { registerLocaleData } from '@angular/common'
import localeRu from '@angular/common/locales/ru'

export const ACCESS_TOKENS = new InjectionToken<AccessTokens>('access tokens')

registerLocaleData(localeRu)

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule, DataModule.forRoot(), ControllerModule],
  providers: [
    {
      provide: ACCESS_TOKENS,
      useValue: { mapbox: environment.mapboxgl.accessToken }
    },
    { provide: LOCALE_ID, useValue: 'ru' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
