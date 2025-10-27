import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hyovelskliwyxgzooisu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5b3ZlbHNrbGl3eXhnem9vaXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDQ1NzIsImV4cCI6MjA3NzAyMDU3Mn0.HT1OBMglsqCNe_0MFYmDEXxnxAUiIjurED9mAvDjeug";

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  public readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
}
