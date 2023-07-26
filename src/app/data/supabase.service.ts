import { Injectable, inject, Injector, Inject } from '@angular/core'
import { ACCESS_TOKENS, URLS, USERS } from '@app/app.module'
import { AuthSession, createClient, SupabaseClient } from '@supabase/supabase-js'
import { AccessTokens, FestivalDTO, PublicUrls, Users } from './interfaces'
import { Observable, defer } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  supabase: SupabaseClient
  user: any
  _session: AuthSession | null = null
  loading = false

  constructor(
    @Inject(URLS) urls: PublicUrls,
    @Inject(ACCESS_TOKENS) accessTokens: AccessTokens,
    @Inject(USERS) users: Users
  ) {
    this.supabase = createClient(urls.supabase, accessTokens.supabase)
    this.user = users.supabase
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
      const { error } = await this.supabase.auth.signInWithPassword(this.user)
      if (error) throw error
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
        throw error
      }
    }
  }
}
