import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Input, Button, Alert } from '../../components/ui'

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!email) {
      errors.email = 'L\'email est requis'
    } else if (!validateEmail(email)) {
      errors.email = 'Format d\'email invalide'
    }

    if (!password) {
      errors.password = 'Le mot de passe est requis'
    } else if (password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer le mot de passe'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error: signUpError } = await signUp(email, password)

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message.includes('already registered')) {
          setError('Cette adresse email est déjà utilisée. Essayez de vous connecter.')
        } else if (signUpError.message.includes('invalid email')) {
          setError('L\'adresse email n\'est pas valide.')
        } else if (signUpError.message.includes('weak password')) {
          setError('Le mot de passe est trop faible. Utilisez au moins 8 caractères.')
        } else {
          setError(signUpError.message || 'Une erreur est survenue lors de l\'inscription.')
        }
        return
      }

      // Success
      setSuccess(true)
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.' }
        })
      }, 2000)

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
            Créer un compte
          </h1>
          <p className="text-gray-600 mt-2">
            Rejoignez Social Media Planner
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-6">
              Inscription réussie ! Redirection vers la page de connexion...
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
              disabled={loading || success}
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Mot de passe"
              type="password"
              name="password"
              placeholder="Minimum 8 caractères"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (formErrors.password) {
                  setFormErrors({ ...formErrors, password: undefined })
                }
              }}
              error={formErrors.password}
              disabled={loading || success}
              autoComplete="new-password"
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              placeholder="Répétez le mot de passe"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (formErrors.confirmPassword) {
                  setFormErrors({ ...formErrors, confirmPassword: undefined })
                }
              }}
              error={formErrors.confirmPassword}
              disabled={loading || success}
              autoComplete="new-password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={success}
              >
                {loading ? 'Inscription en cours...' : 'Créer mon compte'}
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

          {/* Login Link */}
          <p className="text-center text-gray-600">
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          En créant un compte, vous acceptez nos{' '}
          <a href="#" className="text-indigo-600 hover:underline">
            Conditions d'utilisation
          </a>
        </p>
      </div>
    </div>
  )
}
