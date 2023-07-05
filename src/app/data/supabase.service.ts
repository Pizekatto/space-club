import { Injectable, inject, Injector } from '@angular/core'
import { ACCESS_TOKENS, URLS, USERS } from '@app/app.module'
import { AuthSession, createClient, SupabaseClient } from '@supabase/supabase-js'
import { FestivalDTO } from './interfaces'
import { Observable, defer } from 'rxjs'

@Injectable()
export class SupabaseService {
  supabase: SupabaseClient
  _session: AuthSession | null = null
  loading = false

  constructor(private injector: Injector) {
    this.supabase = createClient(inject(URLS).supabase, inject(ACCESS_TOKENS).supabase)
  }

  get(): Observable<FestivalDTO[]> {
    return defer(() => this.getData())
  }

  async getData(): Promise<FestivalDTO[]> {
    try {
      await this.signIn()
      const { data, error } = await this.supabase.from('festivals').select()
      if (error) throw error
      return data as FestivalDTO[]
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
      return []
    }
  }

  festivals() {
    return this.supabase.from('festivals').select('*')
  }

  async signIn() {
    try {
      const { error } = await this.supabase.auth.signInWithPassword(this.injector.get(USERS).supabase)
      if (error) throw error
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
        throw error
      }
    }
  }
}
