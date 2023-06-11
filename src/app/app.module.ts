import { InjectionToken, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { DataModule } from './data/data.module'
import { ControllerModule } from './controller/controller.module'
import { environment } from 'src/environments/environments'
import { AccessTokens } from './data/interfaces'

export const ACCESS_TOKENS = new InjectionToken<AccessTokens>('access tokens')

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule, DataModule.forRoot(), ControllerModule],
  providers: [
    {
      provide: ACCESS_TOKENS,
      useValue: { mapbox: environment.mapboxgl.accessToken }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
