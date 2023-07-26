import { InjectionToken, LOCALE_ID, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ControllerModule } from './controller/controller.module'
import { environment } from 'src/environments/environments'
import { AccessTokens, PublicUrls, Users } from './data/interfaces'
import { registerLocaleData } from '@angular/common'
import localeRu from '@angular/common/locales/ru'

export const ACCESS_TOKENS = new InjectionToken<AccessTokens>('access tokens')
export const URLS = new InjectionToken<PublicUrls>('public urls')
export const USERS = new InjectionToken<Users>('users')

registerLocaleData(localeRu)

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, ControllerModule],
  providers: [
    {
      provide: ACCESS_TOKENS,
      useValue: {
        supabase: environment.supabase.accessToken,
        mapbox: environment.mapboxgl.accessToken
      }
    },
    {
      provide: URLS,
      useValue: {
        mapbox: environment.mapboxgl.geocoding_url,
        supabase: environment.supabase.PUBLIC_URL
      }
    },
    {
      provide: USERS,
      useValue: {
        supabase: environment.supabase.user
      }
    },
    { provide: LOCALE_ID, useValue: 'ru' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
