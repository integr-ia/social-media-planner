import { Link } from 'react-router-dom'
import {
  Sparkles,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  Linkedin,
  Instagram
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { AppLayout } from '../../components/layout'

interface StatCard {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: typeof TrendingUp
  color: string
}

interface QuickAction {
  title: string
  description: string
  href: string
  icon: typeof Sparkles
  gradient: string
  disabled?: boolean
}

const stats: StatCard[] = [
  {
    title: 'Posts ce mois',
    value: 0,
    change: 'Commencez à créer',
    changeType: 'neutral',
    icon: FileText,
    color: 'bg-blue-500'
  },
  {
    title: 'Posts planifiés',
    value: 0,
    change: 'À planifier',
    changeType: 'neutral',
    icon: Calendar,
    color: 'bg-purple-500'
  },
  {
    title: 'Génération IA restante',
    value: '100/100',
    change: 'Quota mensuel',
    changeType: 'positive',
    icon: Sparkles,
    color: 'bg-pink-500'
  },
  {
    title: 'Taux d\'engagement',
    value: '--%',
    change: 'Bientôt disponible',
    changeType: 'neutral',
    icon: TrendingUp,
    color: 'bg-green-500'
  }
]

const quickActions: QuickAction[] = [
  {
    title: 'Générer des idées',
    description: 'Utilisez l\'IA pour créer des idées de contenu personnalisées',
    href: '/generate',
    icon: Sparkles,
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    title: 'Créer un post',
    description: 'Rédigez et planifiez un nouveau post manuellement',
    href: '/posts/new',
    icon: FileText,
    gradient: 'from-indigo-600 to-purple-600',
    disabled: true
  },
  {
    title: 'Voir le calendrier',
    description: 'Consultez et organisez votre planning de publication',
    href: '/calendar',
    icon: Calendar,
    gradient: 'from-blue-600 to-indigo-600',
    disabled: true
  }
]

const recentActivity = [
  { action: 'Bienvenue sur Social Media Planner!', time: 'Maintenant', icon: Sparkles }
]

export function DashboardPage() {
  const { user } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const getUserName = () => {
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'Utilisateur'
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}, {getUserName()} !
          </h1>
          <p className="text-gray-600 mt-1">
            Voici un aperçu de votre activité sur les réseaux sociaux
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.title}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.color} p-2.5 rounded-xl shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p
                  className={`text-xs mt-2 font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : stat.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {stat.change}
                </p>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              const content = (
                <div
                  className={`
                    relative overflow-hidden rounded-2xl p-6 transition-all duration-200
                    ${
                      action.disabled
                        ? 'bg-gray-100 cursor-not-allowed opacity-60'
                        : `bg-gradient-to-br ${action.gradient} text-white shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer`
                    }
                  `}
                >
                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-xl mb-4 ${action.disabled ? 'bg-gray-200' : 'bg-white/20'}`}>
                      <Icon className={`w-6 h-6 ${action.disabled ? 'text-gray-400' : 'text-white'}`} />
                    </div>
                    <h3 className={`font-bold text-lg mb-1 ${action.disabled ? 'text-gray-600' : ''}`}>
                      {action.title}
                    </h3>
                    <p className={`text-sm ${action.disabled ? 'text-gray-500' : 'text-white/80'}`}>
                      {action.description}
                    </p>
                    {action.disabled && (
                      <span className="inline-block mt-3 text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                        Bientôt disponible
                      </span>
                    )}
                    {!action.disabled && (
                      <div className="flex items-center mt-4 text-white/90 text-sm font-medium">
                        <span>Commencer</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    )}
                  </div>
                  {/* Decorative circles */}
                  {!action.disabled && (
                    <>
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
                      <div className="absolute -right-2 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
                    </>
                  )}
                </div>
              )

              if (action.disabled) {
                return <div key={action.title}>{content}</div>
              }

              return (
                <Link key={action.title} to={action.href}>
                  {content}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connected Platforms */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Plateformes connectées</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-700 rounded-xl">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">LinkedIn</p>
                    <p className="text-sm text-gray-500">Non connecté</p>
                  </div>
                </div>
                <button
                  disabled
                  className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed"
                >
                  Bientôt
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Instagram</p>
                    <p className="text-sm text-gray-500">Non connecté</p>
                  </div>
                </div>
                <button
                  disabled
                  className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed"
                >
                  Bientôt
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              La connexion aux plateformes sera disponible dans une prochaine mise à jour.
            </p>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Activité récente</h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                        <Icon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Aucune activité récente</p>
                <p className="text-gray-400 text-xs mt-1">
                  Commencez par générer des idées de contenu
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="mt-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold mb-2">Prêt à commencer ?</h2>
              <p className="text-white/80 text-sm max-w-lg">
                Social Media Planner vous aide à générer, planifier et publier du contenu de qualité
                pour LinkedIn et Instagram grâce à l'IA.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/generate"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Générer des idées
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
