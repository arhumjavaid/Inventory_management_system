// Supabase Client Configuration
// Initializes and exports the Supabase client for the application

import { createClient } from '@supabase/supabase-js'

// Supabase credentials
const supabaseUrl = 'https://vouppviavbpaidpzpzqz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdXBwdmlhdmJwYWlkcHpwenF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjIzNjIsImV4cCI6MjA3NTA5ODM2Mn0.6jDZItnZLN6g9TlXTxl0ruCgOMfQONxC9UN1bbm81Pg'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper functions for common operations
export const auth = {
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  },

  getCurrentSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },
}

// Edge Function helpers
export const edgeFunctions = {
  recordSale: async (saleData) => {
    const { data, error } = await supabase.functions.invoke('record-sale', {
      body: saleData,
    })
    return { data, error }
  },

  recordPurchase: async (purchaseData) => {
    const { data, error } = await supabase.functions.invoke('record-purchase', {
      body: purchaseData,
    })
    return { data, error }
  },

  generateReport: async (reportRequest) => {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: reportRequest,
    })
    return { data, error }
  },

  manageUser: async (userManagement) => {
    const { data, error } = await supabase.functions.invoke('manage-user', {
      body: userManagement,
    })
    return { data, error }
  },
}

// Realtime subscription helpers
export const realtime = {
  subscribeToProducts: (callback) => {
    return supabase
      .channel('products-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
      .subscribe()
  },

  subscribeToSales: (callback) => {
    return supabase
      .channel('sales-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, callback)
      .subscribe()
  },

  subscribeToAlerts: (callback) => {
    return supabase
      .channel('alerts-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, callback)
      .subscribe()
  },

  unsubscribe: (subscription) => {
    return supabase.removeChannel(subscription)
  },
}

export default supabase
