import React, { useState, useEffect } from 'react';
import { Lock, LogOut, Plus, MessageSquare, Eye, Music, Instagram, Youtube, Mail, CheckCircle, Clock, AlertCircle, EyeOff } from 'lucide-react';

interface Video {
  id: number;
  title: string;
  status: string;
  template: string;
  notes: string;
  driveLink: string;
  addedBy: string;
  comments: Comment[];
}

interface Comment {
  id: number;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

interface User {
  username: string;
  role: string;
  name: string;
}

const EstherPlatform = () => {
  const [currentView, setCurrentView] = useState('public');
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const initialVideos: Video[] = [
    { id: 1, title: "Oba Eri (Audio) Visualizer Video", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 2, title: "Oni Bu Ore (1)", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 3, title: "Agbara Olorun po - Fi Agabara Han", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 4, title: "Oh Glorious God", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 5, title: "Ogo Re Po", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 6, title: "Oba Eri (Video)", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 7, title: "He's ALIVE", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 8, title: "Igba Iranwo", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 9, title: "Excerpt from Group Worship x 2", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 10, title: "BTS COMPILATION", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 11, title: "Intro Video", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 12, title: "Olorun Agabaye", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 13, title: "Ta lo da bi re (Tope Alabi) Freestyle Audio", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 14, title: "Generation (Dunsi) Freestyle Audio", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 15, title: "Pius Elizabeth Cover parting", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 16, title: "Ka se re bere (Video with Black Dress Gown) with TG", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 17, title: "You are Wonderful / E si mi lo ju emi (Video with Black Dress Gown) with TG", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 18, title: "Bi o tin sise re ko s'eni to ye (Video with Black Dress Gown) with TG", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 19, title: "Oni bu ore part II", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 20, title: "low light (Olorun Agabaye)", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 21, title: "A'lamo ire Cover", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 22, title: "Chants (Audio)", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 23, title: "The other part TG merged - God is able to do, and kabiesi olorun ayo", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 24, title: "Breathe Cover With Dunsin", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 25, title: "Imole Kọ tàn (1) Iri by Ṣọla Allyson", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 26, title: "Imole Kọ tàn (2) Iri by Ṣọla Allyson", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] },
    { id: 27, title: "Aigbagbọ Bila (Audio) #Mimo medley live... Ṣọla Allyson", status: "not-started", template: "", notes: "", driveLink: "", addedBy: "admin", comments: [] }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const videosData = localStorage.getItem('esther-videos-v2');
      if (videosData) {
        setVideos(JSON.parse(videosData));
      } else {
        setVideos(initialVideos);
        localStorage.setItem('esther-videos-v2', JSON.stringify(initialVideos));
      }
    } catch (error) {
      setVideos(initialVideos);
    }
    setLoading(false);
  };

  const saveVideos = async (updatedVideos: Video[]) => {
    try {
      localStorage.setItem('esther-videos-v2', JSON.stringify(updatedVideos));
      setVideos(updatedVideos);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    const users: Record<string, { password: string; role: string; name: string }> = {
      admin: { password: 'admin2024', role: 'admin', name: 'Video Editor' },
      esther: { password: 'esther2024', role: 'artist', name: 'Esther Reign' }
    };

    if (users[username] && users[username].password === password) {
      const userData = { username, role: users[username].role, name: users[username].name };
      setUser(userData);
      setCurrentView('dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  const PublicPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full overflow-hidden border-4 border-purple-500 shadow-2xl shadow-purple-500/50">
              <img
                src="/IMG-20250915-WA0035.jpg"
                alt="Esther Reign"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-white mb-4">
            OfficialEstherReign
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-purple-300 mb-8">
            Gospel Music • Worship Leader • Content Creator
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a href="#videos" className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition">
              Watch Videos
            </a>
            <button
              onClick={() => setCurrentView('login')}
              className="bg-gray-800 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <Lock size={20} />
              Creator Login
            </button>
          </div>
          <div className="flex gap-6 justify-center">
            <a href="#" className="text-purple-400 hover:text-purple-300 transition">
              <Instagram size={32} />
            </a>
            <a href="#" className="text-purple-400 hover:text-purple-300 transition">
              <Youtube size={32} />
            </a>
            <a href="#" className="text-purple-400 hover:text-purple-300 transition">
              <Mail size={32} />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">About Esther</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-4">
                A passionate worship leader and gospel artist dedicated to spreading the message of faith through music.
              </p>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                With a powerful voice and heartfelt lyrics, Esther creates worship experiences that touch souls and inspire faith.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="/IMG-20250915-WA0023.jpg"
                alt="Esther Reign performing"
                className="w-full rounded-2xl shadow-2xl shadow-purple-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div id="videos" className="bg-gradient-to-br from-gray-900 to-black py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Latest Videos</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.filter(v => v.status === 'complete' && v.driveLink).slice(0, 6).map(video => (
              <div key={video.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition">
                <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Music size={64} className="text-white" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">{video.title}</h3>
                  {video.driveLink && (
                    <a
                      href={video.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      Watch Now →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-black text-gray-400 py-8 text-center">
        <p>&copy; 2024 OfficialEstherReign. All rights reserved.</p>
      </div>
    </div>
  );

  const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const success = await handleLogin(username, password);
      if (!success) {
        setError('Invalid credentials. Please try again.');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <button
          onClick={() => setCurrentView('public')}
          className="absolute top-8 left-4 md:left-8 text-purple-400 hover:text-purple-300 transition flex items-center gap-2"
        >
          ← Back to Home
        </button>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Creator Login</h2>
            <p className="text-gray-400">Access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    const [newVideo, setNewVideo] = useState({ title: '', notes: '' });
    const [commentText, setCommentText] = useState('');
    const [commentingId, setCommentingId] = useState<number | null>(null);
    const [editingTitleId, setEditingTitleId] = useState<number | null>(null);
    const [editTitleText, setEditTitleText] = useState('');
    const [localVideos, setLocalVideos] = useState<Video[]>(videos);

    useEffect(() => {
      setLocalVideos(videos);
    }, [videos]);

    const stats = {
      total: videos.length,
      notStarted: videos.filter(v => v.status === 'not-started').length,
      inProgress: videos.filter(v => v.status === 'in-progress').length,
      underReview: videos.filter(v => v.status === 'under-review').length,
      complete: videos.filter(v => v.status === 'complete').length
    };

    const progress = stats.total > 0 ? ((stats.complete / stats.total) * 100).toFixed(0) : '0';

    const updateVideoLocally = (id: number, field: string, value: string) => {
      const updated = localVideos.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      );
      setLocalVideos(updated);
    };

    const saveVideoChanges = async (id: number, field: string, value: string) => {
      const updated = videos.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      );
      await saveVideos(updated);
    };

    const addVideo = async () => {
      if (!newVideo.title.trim()) return;

      const video: Video = {
        id: Date.now(),
        title: newVideo.title,
        status: 'not-started',
        template: '',
        notes: newVideo.notes,
        driveLink: '',
        addedBy: user!.role,
        comments: []
      };

      await saveVideos([...videos, video]);
      setNewVideo({ title: '', notes: '' });
      setShowAddModal(false);
    };

    const addComment = async (videoId: number) => {
      if (!commentText.trim()) return;

      const updated = videos.map(v => {
        if (v.id === videoId) {
          return {
            ...v,
            comments: [...(v.comments || []), {
              id: Date.now(),
              author: user!.name,
              role: user!.role,
              text: commentText,
              timestamp: new Date().toISOString()
            }]
          };
        }
        return v;
      });

      await saveVideos(updated);
      setCommentText('');
      setCommentingId(null);
    };

    const requestReview = async (videoId: number) => {
      await saveVideoChanges(videoId, 'status', 'under-review');
    };

    const getStatusColor = (status: string) => {
      const colors: Record<string, string> = {
        'not-started': 'bg-gray-700 text-gray-300',
        'in-progress': 'bg-yellow-900/50 text-yellow-300',
        'under-review': 'bg-blue-900/50 text-blue-300',
        'complete': 'bg-green-900/50 text-green-300'
      };
      return colors[status];
    };

    const getStatusIcon = (status: string) => {
      const icons: Record<string, React.ComponentType<any>> = {
        'not-started': AlertCircle,
        'in-progress': Clock,
        'under-review': Eye,
        'complete': CheckCircle
      };
      const Icon = icons[status];
      return <Icon size={16} />;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="bg-gray-800 border-b border-gray-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">OfficialEstherReign</h1>
              <p className="text-sm text-gray-400">Welcome, {user?.name}</p>
            </div>
            <div className="flex gap-2 sm:gap-3 items-center w-full sm:w-auto">
              <button
                onClick={() => setCurrentView('public')}
                className="text-purple-400 hover:text-purple-300 transition flex items-center gap-2 text-sm py-2 px-3 sm:px-0"
              >
                <Eye size={18} />
                <span className="hidden sm:inline">View Public</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 text-sm touch-manipulation"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-300">Overall Progress</span>
                <span className="text-xl md:text-2xl font-bold text-purple-400">{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 md:h-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 md:h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              <div className="text-center p-3 bg-gray-900 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-gray-300">{stats.notStarted}</div>
                <div className="text-xs text-gray-400">Not Started</div>
              </div>
              <div className="text-center p-3 bg-yellow-900/30 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-yellow-300">{stats.inProgress}</div>
                <div className="text-xs text-yellow-300">In Progress</div>
              </div>
              <div className="text-center p-3 bg-blue-900/30 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-blue-300">{stats.underReview}</div>
                <div className="text-xs text-blue-300">Review</div>
              </div>
              <div className="text-center p-3 bg-green-900/30 rounded-lg col-span-2 md:col-span-1">
                <div className="text-xl md:text-2xl font-bold text-green-300">{stats.complete}</div>
                <div className="text-xs text-green-300">Complete</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition flex items-center gap-2 font-semibold w-full sm:w-auto justify-center touch-manipulation shadow-lg"
            >
              <Plus size={20} />
              Add New Video
            </button>
          </div>

          <div className="grid gap-4 md:gap-6 xl:grid-cols-2">
            {localVideos.map(video => (
              <div key={video.id} className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg hover:shadow-purple-500/20 transition p-4 md:p-5">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-purple-400 font-semibold mb-1">Video #{video.id}</div>
                    {editingTitleId === video.id ? (
                      <div className="flex gap-2 items-center mb-2">
                        <input
                          type="text"
                          value={editTitleText}
                          onChange={(e) => setEditTitleText(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            saveVideoChanges(video.id, 'title', editTitleText);
                            setEditingTitleId(null);
                          }}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTitleId(null)}
                          className="bg-gray-700 text-gray-300 px-3 py-1 rounded text-xs hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <h3
                        className="font-bold text-base md:text-lg text-white mb-2 break-words cursor-pointer hover:text-purple-400 transition"
                        onClick={() => {
                          setEditingTitleId(video.id);
                          setEditTitleText(video.title);
                        }}
                        title="Click to edit title"
                      >
                        {video.title}
                      </h3>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ${getStatusColor(video.status)}`}>
                    {getStatusIcon(video.status)}
                    <span className="hidden sm:inline">{video.status.replace('-', ' ')}</span>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Status</label>
                      <select
                        value={video.status}
                        onChange={(e) => saveVideoChanges(video.id, 'status', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="under-review">Under Review</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Edit Template</label>
                      <input
                        type="text"
                        value={video.template}
                        onChange={(e) => updateVideoLocally(video.id, 'template', e.target.value)}
                        onBlur={(e) => saveVideoChanges(video.id, 'template', e.target.value)}
                        placeholder="e.g., Animated Lyrics + Emojis"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Google Drive Link</label>
                      <input
                        type="url"
                        value={video.driveLink}
                        onChange={(e) => updateVideoLocally(video.id, 'driveLink', e.target.value)}
                        onBlur={(e) => saveVideoChanges(video.id, 'driveLink', e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Edit Notes</label>
                      <textarea
                        value={video.notes}
                        onChange={(e) => updateVideoLocally(video.id, 'notes', e.target.value)}
                        onBlur={(e) => saveVideoChanges(video.id, 'notes', e.target.value)}
                        placeholder="Creative ideas, special effects..."
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  </div>
                )}

                {user?.role === 'artist' && (
                  <div className="space-y-2 mb-4">
                    {video.template && (
                      <div className="text-sm">
                        <span className="font-semibold text-gray-300">Style:</span>
                        <span className="text-gray-400 ml-2">{video.template}</span>
                      </div>
                    )}
                    {video.notes && (
                      <div className="text-sm">
                        <span className="font-semibold text-gray-300">Notes:</span>
                        <p className="text-gray-400 mt-1">{video.notes}</p>
                      </div>
                    )}
                    {video.driveLink && (
                      <a
                        href={video.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-purple-900/50 text-purple-300 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-900 active:bg-purple-800 transition touch-manipulation"
                      >
                        View Video →
                      </a>
                    )}
                    {video.status === 'in-progress' && (
                      <button
                        onClick={() => requestReview(video.id)}
                        className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition touch-manipulation"
                      >
                        Request Review
                      </button>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={16} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-300">
                      Comments ({(video.comments || []).length})
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 mb-3 scrollbar-thin">
                    {(video.comments || []).map(comment => (
                      <div key={comment.id} className="bg-gray-900 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <span className="text-xs font-semibold text-purple-400">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 break-words">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  {commentingId === video.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add your comment..."
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => addComment(video.id)}
                          className="flex-1 sm:flex-none bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-purple-700 active:bg-purple-800 transition touch-manipulation font-semibold"
                        >
                          Post
                        </button>
                        <button
                          onClick={() => {
                            setCommentingId(null);
                            setCommentText('');
                          }}
                          className="flex-1 sm:flex-none bg-gray-700 text-gray-300 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-600 active:bg-gray-500 transition touch-manipulation"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCommentingId(video.id)}
                      className="text-purple-400 text-sm font-semibold hover:text-purple-300 active:text-purple-200 transition py-2 touch-manipulation"
                    >
                      + Add Comment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-5 sm:p-6 md:p-8 max-w-md w-full my-8">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Add New Video</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Video Title</label>
                  <input
                    type="text"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                    placeholder="Enter video title"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Initial Notes (Optional)</label>
                  <textarea
                    value={newVideo.notes}
                    onChange={(e) => setNewVideo({...newVideo, notes: e.target.value})}
                    placeholder="Add any initial notes or ideas..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={addVideo}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 active:bg-purple-800 transition touch-manipulation"
                  >
                    Add Video
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewVideo({ title: '', notes: '' });
                    }}
                    className="flex-1 bg-gray-700 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-600 active:bg-gray-500 transition touch-manipulation"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'public' && <PublicPage />}
      {currentView === 'login' && <LoginPage />}
      {currentView === 'dashboard' && user && <Dashboard />}
    </>
  );
};

export default EstherPlatform;
