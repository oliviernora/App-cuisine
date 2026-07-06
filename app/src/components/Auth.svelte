<script>
  import { supabase } from '../lib/supabase.js'

  let mode = $state('login')
  let email = $state('')
  let password = $state('')
  let message = $state('')
  let busy = $state(false)

  function frError(error) {
    if (error.message.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect.'
    if (error.message.includes('at least 6 characters')) return 'Le mot de passe doit faire au moins 6 caractères.'
    if (error.message.includes('already registered')) return 'Un compte existe déjà avec cet email.'
    return error.message
  }

  async function submit(e) {
    e.preventDefault()
    busy = true
    message = ''
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) message = frError(error)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) message = frError(error)
      else if (!data.session) message = 'Compte créé. Ouvrez le lien de confirmation reçu par email, puis revenez ici vous connecter.'
    }
    busy = false
  }
</script>

<div class="centered">
  <form class="panel" onsubmit={submit}>
    <h1>Garde-manger</h1>
    <p class="muted">{mode === 'login' ? 'Connectez-vous pour retrouver le foyer.' : 'Créez votre compte personnel.'}</p>
    <input type="email" bind:value={email} placeholder="Email" required autocomplete="email">
    <input type="password" bind:value={password} placeholder="Mot de passe" required
      autocomplete={mode === 'login' ? 'current-password' : 'new-password'}>
    <button class="submit" disabled={busy}>{mode === 'login' ? 'Se connecter' : 'Créer le compte'}</button>
    {#if message}<p class="message">{message}</p>{/if}
    <button type="button" class="linklike"
      onclick={() => { mode = mode === 'login' ? 'signup' : 'login'; message = '' }}>
      {mode === 'login' ? 'Pas encore de compte ? Créez-le.' : 'Déjà un compte ? Connectez-vous.'}
    </button>
  </form>
</div>
