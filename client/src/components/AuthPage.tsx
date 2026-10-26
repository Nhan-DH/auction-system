import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Gavel, Eye, EyeOff, Sparkles, Lock, User as UserIcon } from 'lucide-react';

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
];

export const AuthPage: React.FC = () => {
  const { login, register, usersList, switchUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAvatar, setRegAvatar] = useState(AVATARS[0]);
  const [regBalance, setRegBalance] = useState('200000000');
  const [regError, setRegError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setLoginError('Vui lòng nhập tên đăng nhập!');
      return;
    }
    if (!password) {
      setLoginError('Vui lòng nhập mật khẩu!');
      return;
    }
    setLoading(true);
    setLoginError('');
    const res = await login(username.trim(), password);
    setLoading(false);
    if (!res.success) {
      setLoginError(res.message || 'Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regDisplayName.trim()) {
      setRegError('Vui lòng nhập tên đăng nhập và tên hiển thị!');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Mật khẩu phải có tối thiểu 6 ký tự!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không khớp với mật khẩu đã nhập!');
      return;
    }

    setLoading(true);
    setRegError('');
    const res = await register({
      username: regUsername.trim(),
      password: regPassword,
      displayName: regDisplayName.trim(),
      email: regEmail.trim(),
      avatar: regAvatar,
      initialBalance: Number(regBalance) || 100000000,
    });
    setLoading(false);
    if (!res.success) {
      setRegError(res.message || 'Tên đăng nhập này đã được sử dụng!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50/50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-orange-200 shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-orange-500/30 mb-3">
            <Gavel className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Sàn Đấu Giá Trực Tuyến
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đăng nhập hoặc đăng ký tài khoản để bắt đầu tham gia đấu giá
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-orange-500 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegError('');
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-orange-500 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Form Body */}
        {mode === 'login' ? (
          <div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ví dụ: hoangnhan, minhquan..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm text-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Mật khẩu
                  </label>
                  <span className="text-[10px] text-slate-400">
                    (Mặc định tài khoản mẫu: 123456)
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm text-slate-800 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition cursor-pointer"
              >
                {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
              </button>
            </form>

            {/* Quick 1-Click Test Accounts */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Hoặc đăng nhập nhanh bằng tài khoản có sẵn (pass: 123456):</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {usersList.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUsername(u.username);
                      setPassword('123456');
                      switchUser(u.id);
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 bg-white text-left transition cursor-pointer"
                  >
                    <img
                      src={u.avatar}
                      alt={u.displayName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-orange-200"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">{u.displayName}</p>
                      <p className="text-[10px] text-orange-600 font-medium">
                        {(u.balance / 1000000).toFixed(0)} Triệu đ
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên đăng nhập (Username) *
              </label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="ví dụ: tranphuc"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu *
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xs text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Xác nhận lại mật khẩu *
              </label>
              <input
                type="password"
                required
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu vừa đặt"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và Tên hiển thị *
              </label>
              <input
                type="text"
                required
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
                placeholder="ví dụ: Trần Văn Phúc"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="phuc@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ví khởi tạo
                </label>
                <select
                  value={regBalance}
                  onChange={(e) => setRegBalance(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none text-xs text-slate-800"
                >
                  <option value="50000000">50 Triệu đ</option>
                  <option value="100000000">100 Triệu đ</option>
                  <option value="200000000">200 Triệu đ</option>
                  <option value="500000000">500 Triệu đ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn ảnh đại diện:
              </label>
              <div className="flex items-center gap-3">
                {AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRegAvatar(av)}
                    className={`relative rounded-full p-0.5 transition cursor-pointer ${
                      regAvatar === av ? 'ring-2 ring-orange-500 scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={av}
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    {regAvatar === av && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {regError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                {regError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition cursor-pointer mt-1"
            >
              {loading ? 'Đang tạo...' : 'Hoàn Tất Đăng Ký'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
