import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Input, Button, Alert } from '../../components/ui'

interface FormErrors {
  email?: string
  password?: string
}

interface LocationState {
  message?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()

  const locationState = location.state as LocationState | null
  const successMessage = locationState?.message

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!email) {
      errors.email = 'L\'email est requis'
    }

    if (!password) {
      errors.password = 'Le mot de passe est requis'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect.')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Veuillez confirmer votre email avant de vous connecter.')
        } else {
          setError(signInError.message || 'Une erreur est survenue lors de la connexion.')
        }
        return
      }

      // Success - redirect to dashboard
      navigate('/dashboard')

    } catch {
      setError('Une erreur inattendue est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Connexion
          </h1>
          <p className="text-gray-600 mt-2">
            Accédez à votre espace Social Media Planner
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          {successMessage && (
            <Alert variant="success" className="mb-6">
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Adresse email"
              type="email"
              name="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (formErrors.email) {
                  setFormErrors({ ...formErrors, email: undefined })
                }
              }}
              error={formErrors.email}
              disabled={loading}
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Mot de passe"
              type="password"
              name="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (formErrors.password) {
                  setFormErrors({ ...formErrors, password: undefined })
                }
              }}
              error={formErrors.password}
              disabled={loading}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                loading={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-600">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
