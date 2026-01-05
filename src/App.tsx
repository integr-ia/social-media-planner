import { useState } from 'react'
import { Calendar, Plus, Instagram, Facebook, Linkedin, Twitter, Youtube, ChevronLeft, ChevronRight, X, Trash2, Edit2 } from 'lucide-react'
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Post {
  id: string
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'youtube'
  content: string
  scheduledDate: Date
  scheduledTime: string
  status: 'draft' | 'scheduled' | 'published'
}

const samplePosts: Post[] = [
  {
    id: '1',
    platform: 'instagram',
    content: 'Nouveau produit disponible ! Découvrez notre dernière collection 🎉',
    scheduledDate: new Date(),
    scheduledTime: '14:00',
    status: 'scheduled'
  },
  {
    id: '2',
    platform: 'facebook',
    content: 'Rejoignez-nous pour un événement spécial ce weekend !',
    scheduledDate: addDays(new Date(), 2),
    scheduledTime: '10:30',
    status: 'scheduled'
  },
  {
    id: '3',
    platform: 'linkedin',
    content: 'Nous recrutons ! Consultez nos offres d\'emploi sur notre site web.',
    scheduledDate: addDays(new Date(), 1),
    scheduledTime: '09:00',
    status: 'scheduled'
  }
]

function App() {
  const [posts, setPosts] = useState<Post[]>(samplePosts)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState({
    platform: 'instagram' as Post['platform'],
    content: '',
    scheduledDate: format(new Date(), 'yyyy-MM-dd'),
    scheduledTime: '12:00',
    status: 'scheduled' as Post['status']
  })

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const platformIcons = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube,
  }

  const platformColors = {
    instagram: 'bg-gradient-to-r from-instagram-start to-instagram-end',
    facebook: 'bg-facebook',
    linkedin: 'bg-linkedin',
    twitter: 'bg-twitter',
    youtube: 'bg-youtube',
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newPost: Post = {
      id: editingPost?.id || Date.now().toString(),
      platform: formData.platform,
      content: formData.content,
      scheduledDate: new Date(formData.scheduledDate),
      scheduledTime: formData.scheduledTime,
      status: formData.status
    }

    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? newPost : p))
    } else {
      setPosts([...posts, newPost])
    }

    setShowNewPostForm(false)
    setEditingPost(null)
    setFormData({
      platform: 'instagram',
      content: '',
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      scheduledTime: '12:00',
      status: 'scheduled'
    })
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setFormData({
      platform: post.platform,
      content: post.content,
      scheduledDate: format(post.scheduledDate, 'yyyy-MM-dd'),
      scheduledTime: post.scheduledTime,
      status: post.status
    })
    setShowNewPostForm(true)
  }

  const handleDelete = (postId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      setPosts(posts.filter(p => p.id !== postId))
    }
  }

  const handleCloseForm = () => {
    setShowNewPostForm(false)
    setEditingPost(null)
    setFormData({
      platform: 'instagram',
      content: '',
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      scheduledTime: '12:00',
      status: 'scheduled'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Social Media Planner
                </h1>
                <p className="text-sm text-gray-500">Gérez vos publications sur tous vos réseaux</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewPostForm(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau Post</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar View */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-white to-indigo-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Calendrier de la semaine</h2>
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  {format(weekStart, 'dd MMMM yyyy', { locale: fr })} - {format(addDays(weekStart, 6), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
                  className="p-2.5 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110 border border-gray-200"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all duration-200 border border-indigo-200"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
                  className="p-2.5 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110 border border-gray-200"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Week Grid */}
          <div className="grid grid-cols-7 divide-x divide-gray-200/50">
            {weekDays.map((day) => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              return (
              <div key={day.toString()} className="min-h-[250px] hover:bg-indigo-50/30 transition-colors duration-200">
                <div className={`p-4 border-b border-gray-200/50 ${isToday ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-white' : 'text-gray-500'}`}>
                    {format(day, 'EEE', { locale: fr })}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${isToday ? 'text-white' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </p>
                  {isToday && (
                    <div className="mt-1">
                      <span className="text-xs font-medium text-white/90">Aujourd'hui</span>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2.5">
                  {posts
                    .filter((post) => format(post.scheduledDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                    .map((post) => {
                      const Icon = platformIcons[post.platform]
                      return (
                        <div
                          key={post.id}
                          className={`${platformColors[post.platform]} p-3.5 rounded-xl text-white text-xs shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 group relative cursor-pointer border border-white/20`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="p-1 bg-white/20 rounded-lg">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-bold capitalize text-sm">{post.platform}</span>
                            </div>
                            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-lg">{post.scheduledTime}</span>
                          </div>
                          <p className="line-clamp-2 mb-3 font-medium leading-relaxed">{post.content}</p>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <button
                              onClick={() => handleEdit(post)}
                              className="flex-1 p-2 bg-white/25 hover:bg-white/40 rounded-lg transition-all duration-200 backdrop-blur-sm font-medium"
                              title="Modifier"
                            >
                              <Edit2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="flex-1 p-2 bg-white/25 hover:bg-white/40 rounded-lg transition-all duration-200 backdrop-blur-sm font-medium"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
              )
            })}
          </div>
        </div>

        {/* Platform Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-5">
          {Object.entries(platformIcons).map(([platform, Icon]) => {
            const count = posts.filter((p) => p.platform === platform).length
            const platformKey = platform as Post['platform']
            return (
            <div key={platform} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-5 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer group">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`${platformColors[platformKey]} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold capitalize text-gray-900 text-lg">{platform}</span>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {count}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  {count === 0 ? 'Aucun post' : count === 1 ? 'post planifié' : 'posts planifiés'}
                </p>
              </div>
            </div>
            )
          })}
        </div>
      </main>

      {/* New Post Form Modal */}
      {showNewPostForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {editingPost ? 'Modifier le post' : 'Nouveau Post'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Planifiez votre publication sur les réseaux sociaux</p>
              </div>
              <button
                onClick={handleCloseForm}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Plateforme
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(platformIcons).map(([platform, Icon]) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform: platform as Post['platform'] })}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.platform === platform
                          ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-indigo-200 hover:shadow-md hover:scale-102'
                      }`}
                    >
                      <div className={`${formData.platform === platform ? platformColors[platform as Post['platform']] : 'bg-gray-100'} p-2 rounded-lg mb-2 transition-all duration-200`}>
                        <Icon className="w-6 h-6 mx-auto text-white" />
                      </div>
                      <span className={`text-xs font-semibold block capitalize ${
                        formData.platform === platform ? 'text-indigo-600' : 'text-gray-600'
                      }`}>{platform}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-bold text-gray-900 mb-3">
                  Contenu du post
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200 text-gray-800 font-medium"
                  placeholder="Écrivez votre contenu ici..."
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">{formData.content.length} caractères</p>
                  <p className="text-xs font-medium text-indigo-600">
                    {formData.content.length > 280 ? 'Long' : formData.content.length > 100 ? 'Moyen' : 'Court'}
                  </p>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="date" className="block text-sm font-bold text-gray-900 mb-3">
                    Date de publication
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-bold text-gray-900 mb-3">
                    Heure
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Statut de publication
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.status === 'draft'
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-200 hover:shadow-sm'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Post['status'] })}
                      className="sr-only"
                    />
                    <span className={`text-sm font-semibold ${
                      formData.status === 'draft' ? 'text-indigo-600' : 'text-gray-700'
                    }`}>📝 Brouillon</span>
                  </label>
                  <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.status === 'scheduled'
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-200 hover:shadow-sm'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="scheduled"
                      checked={formData.status === 'scheduled'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Post['status'] })}
                      className="sr-only"
                    />
                    <span className={`text-sm font-semibold ${
                      formData.status === 'scheduled' ? 'text-indigo-600' : 'text-gray-700'
                    }`}>⏰ Planifié</span>
                  </label>
                  <label className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.status === 'published'
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-200 hover:shadow-sm'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Post['status'] })}
                      className="sr-only"
                    />
                    <span className={`text-sm font-semibold ${
                      formData.status === 'published' ? 'text-indigo-600' : 'text-gray-700'
                    }`}>✅ Publié</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold hover:scale-105"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold hover:scale-105"
                >
                  {editingPost ? '✨ Mettre à jour' : '🚀 Créer le post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
