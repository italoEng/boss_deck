import { useState } from 'react'
import { supabase } from '../supabaseClient'
import logo from '../assets/logo2.png'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setError('Verifique seu email para confirmar o cadastro!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Boss Deck" className="h-16 w-16 rounded" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isRegister ? 'Criar conta' : 'Entrar'}
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-xl p-3 mb-3 focus:outline-none focus:border-purple-500"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded-xl p-3 mb-4 focus:outline-none focus:border-purple-500"
        />

        {error && (
          <p className="text-sm text-red-500 mb-3">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-50">
          {loading ? 'Carregando...' : isRegister ? 'Cadastrar' : 'Entrar'}
        </button>

        <button
          onClick={() => { setIsRegister(!isRegister); setError('') }}
          className="w-full text-center text-sm text-gray-500 mt-4 hover:text-purple-600">
          {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastrar'}
        </button>

      </div>
    </div>
  )
}

export default Login