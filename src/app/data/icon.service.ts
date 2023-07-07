import { Injectable } from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon'
import { DomSanitizer } from '@angular/platform-browser'

export interface IconConfig {
  name: string
  path: string
}

const icons: IconConfig[] = [
  {
    name: 'cancel',
    path: 'assets/icons/cancel_black_24dp.svg'
  },
  {
    name: 'plus',
    path: 'assets/icons/add_circle_outline_black_24dp.svg'
  },
  {
    name: 'save',
    path: 'assets/icons/done_black_24dp.svg'
  },
  {
    name: 'close',
    path: 'assets/icons/close_black_24dp.svg'
  },
  {
    name: 'location',
    path: 'assets/icons/my_location_black_24dp.svg'
  },
  {
    name: 'eq',
    path: 'assets/icons/eq.svg'
  }
]

@Injectable()
export class IconService {
  constructor(private readonly matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    icons.forEach(icon => this.add(icon))
  }

  private add(config: IconConfig): void {
    this.matIconRegistry.addSvgIcon(config.name, this.domSanitizer.bypassSecurityTrustResourceUrl(config.path))
  }
}
