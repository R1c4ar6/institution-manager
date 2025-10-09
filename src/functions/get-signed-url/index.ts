import { createClient } from '@supabase/supabase-js';

// Simple CORS helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

declare const Deno: any;

// Main function handler
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = req.method === 'GET' ? Object.fromEntries(new URL(req.url).searchParams) : await req.json();
    const { doc_id, expiry_seconds = 60 } = body;

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders });
    }
    const token = authHeader.replace('Bearer ', '');

    // auth-aware client (respects your DB RLS by using the user's JWT)
    const supabaseAuth = createClient(
      Deno.env.get('VITE_SUPABASE_URL') ?? '',
      Deno.env.get('VITE_SUPABASE_PUBLISHABLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Fetch the document row (RLS will apply if you set it up; otherwise this fetches with the user's identity)
    const { data: doc, error: docErr } = await supabaseAuth
      .from('documents')
      .select('id, file_path, uploaded_by, student_id')
      .eq('id', doc_id)
      .maybeSingle();

    if (docErr) throw docErr;
    if (!doc) return new Response(JSON.stringify({ error: 'Document not found' }), { status: 404, headers: corsHeaders });

    // Server-side authorization check (example: allow uploader or admin)
    const { data: userData } = await supabaseAuth.auth.getUser(token);
    const user = userData?.user;
    const isUploader = user?.id === doc.uploaded_by;
    const isAdmin = user?.app_metadata?.role === 'admin'; // adapt to your app

    if (!isUploader && !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }

    // Now create signed URL with a service-role client (bypass RLS for storage ops)
    const supabaseService = createClient(
      Deno.env.get('VITE_SUPABASE_URL') ?? '',
      Deno.env.get('VITE_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const bucket = 'documents';
    const { data: signedData, error: signErr } = await supabaseService.storage
      .from(bucket)
      .createSignedUrl(doc.file_path, Number(expiry_seconds));

    if (signErr) throw signErr;

    return new Response(JSON.stringify({ signedUrl: signedData.signedUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error)?.message ?? String(err) }), { status: 500, headers: corsHeaders });
  }
});
