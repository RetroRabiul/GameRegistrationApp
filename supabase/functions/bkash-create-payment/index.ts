import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BKASH_API_URL = Deno.env.get('BKASH_API_URL') || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
const BKASH_APP_KEY = Deno.env.get('BKASH_APP_KEY')
const BKASH_APP_SECRET = Deno.env.get('BKASH_APP_SECRET')
const BKASH_USERNAME = Deno.env.get('BKASH_USERNAME')
const BKASH_PASSWORD = Deno.env.get('BKASH_PASSWORD')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getBkashToken() {
  const response = await fetch(`${BKASH_API_URL}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'username': BKASH_USERNAME!,
      'password': BKASH_PASSWORD!,
    },
    body: JSON.stringify({
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
    }),
  })
  
  const data = await response.json()
  return data.id_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { amount, registrationId } = await req.json()

    if (!amount || !registrationId) {
      throw new Error('Missing amount or registrationId')
    }

    const token = await getBkashToken()

    const response = await fetch(`${BKASH_API_URL}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token,
        'X-APP-Key': BKASH_APP_KEY!,
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: registrationId,
        callbackURL: 'https://your-app.com/payment/callback',
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'payment',
        merchantInvoiceNumber: `INV-${Date.now()}`,
      }),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
