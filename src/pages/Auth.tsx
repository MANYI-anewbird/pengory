import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Snowflake, ArrowLeft } from 'lucide-react';
import penguinLogo from '@/assets/penguin-logo.png';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().trim().email({ message: "请输入有效的邮箱地址" }),
  password: z.string().min(6, { message: "密码至少需要6个字符" }),
  username: z.string().trim().min(2, { message: "用户名至少需要2个字符" }).max(20, { message: "用户名最多20个字符" }),
});

const signInSchema = z.object({
  email: z.string().trim().email({ message: "请输入有效的邮箱地址" }),
  password: z.string().min(1, { message: "请输入密码" }),
});

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signUpSchema.safeParse({ email, password, username });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          display_name: username,
        },
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('该邮箱已被注册，请直接登录');
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success('注册成功！正在跳转...');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signInSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('邮箱或密码错误');
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success('登录成功！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Snowflake className="absolute top-10 left-10 h-8 w-8 text-sky-200 animate-pulse" />
        <Snowflake className="absolute top-20 right-20 h-6 w-6 text-cyan-200 animate-pulse delay-100" />
        <Snowflake className="absolute bottom-20 left-1/4 h-10 w-10 text-blue-200 animate-pulse delay-200" />
        <Snowflake className="absolute top-1/3 right-10 h-5 w-5 text-sky-300 animate-pulse delay-300" />
        <Snowflake className="absolute bottom-10 right-1/3 h-7 w-7 text-cyan-300 animate-pulse delay-500" />
      </div>

      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </button>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/50">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <img 
              src={penguinLogo} 
              alt="Penguin Logo" 
              className="h-20 w-20 mx-auto mb-4 drop-shadow-md"
            />
            <h1 className="text-2xl font-bold text-slate-800">
              {isLogin ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              {isLogin ? '登录以继续使用' : '注册后即可使用全部功能'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700">用户名</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="给自己取个名字"
                  className="bg-white/50 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-white/50 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? '输入密码' : '至少6个字符'}
                  className="bg-white/50 border-slate-200 focus:border-sky-400 focus:ring-sky-400 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-medium py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              {isLogin ? '还没有账号？' : '已有账号？'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-sky-600 hover:text-sky-700 font-medium"
              >
                {isLogin ? '立即注册' : '去登录'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-slate-400 text-xs mt-6">
          注册后系统会自动生成你的专属10位ID
        </p>
      </div>
    </div>
  );
}
