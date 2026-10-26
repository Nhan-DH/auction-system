import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, UserPlus, LogIn, Sparkles, Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, usersList, switchUser } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAvatar, setRegAvatar] = useState(AVATAR_OPTIONS[0]);
  const [regBalance, setRegBalance] = useState('200000000');
  const [regError, setRegError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      setLoginError('Vui lòng nhập tên đăng nhập!');
      return;
    }
    if (!loginPassword) {
      setLoginError('Vui lòng nhập mật khẩu!');
      return;
    }
    setLoading(true);
    setLoginError('');
    const res = await login(loginUsername.trim(), loginPassword);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setLoginError(res.message || 'Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regDisplayName.trim()) {
      setRegError('Vui lòng điền đủ Tên đăng nhập và Họ tên!');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Mật khẩu phải có tối thiểu 6 ký tự!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    setRegError('');
    const res = await register({
      username: regUsername.trim(),
      password: regPassword,
      displayName: regDisplayName.trim(),
      email: regEmail.trim() || `${regUsername.trim()}@auction.vn`,
      avatar: regAvatar,
      initialBalance: Number(regBalance) || 100000000,
    });
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setRegError(res.message || 'Tên đăng nhập đã tồn tại hoặc có lỗi xảy ra!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-orange-200 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              {tab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <h3 className="font-bold text-base text-slate-800">
              {tab === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 my-3 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setLoginError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-orange-500 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setRegError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-orange-500 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Form Body */}
        {tab === 'login' ? (
          <div>
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ví dụ: hoangnhan"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
                  <span className="text-[10px] text-slate-400">(Mặc định: 123456)</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Hoặc chọn nhanh tài khoản test:</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {usersList.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      switchUser(u.id);
                      onClose();
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 text-left transition cursor-pointer"
                  >
                    <img
                      src={u.avatar}
                      alt={u.displayName}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-slate-800 truncate">{u.displayName}</p>
                      <p className="text-[10px] text-orange-600 font-mono">
                        {(u.balance / 1000000).toFixed(0)}M đ
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                Tên đăng nhập *
              </label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="ví dụ: tranphuc"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                Mật khẩu *
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-3 pr-9 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-orange-500"
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
              <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                Xác nhận lại mật khẩu *
              </label>
              <input
                type="password"
                required
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                Họ và Tên *
              </label>
              <input
                type="text"
                required
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
                placeholder="ví dụ: Trần Văn Phúc"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="phuc@gmail.com"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                  Ví khởi tạo
                </label>
                <select
                  value={regBalance}
                  onChange={(e) => setRegBalance(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800"
                >
                  <option value="50000000">50 Triệu đ</option>
                  <option value="100000000">100 Triệu đ</option>
                  <option value="200000000">200 Triệu đ</option>
                  <option value="500000000">500 Triệu đ</option>
                </select>
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
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition cursor-pointer mt-1"
            >
              {loading ? 'Đang tạo...' : 'Hoàn Tất Đăng Ký'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
