import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { User, Copy, Check, LogOut, Edit2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');

  const handleCopyCode = async () => {
    if (profile?.unique_code) {
      await navigator.clipboard.writeText(profile.unique_code);
      setCopied(true);
      toast.success('ID已复制');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      })
      .eq('id', profile.id);

    setLoading(false);

    if (error) {
      toast.error('保存失败');
      return;
    }

    await refreshProfile();
    setIsEditing(false);
    toast.success('保存成功');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user || !profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">请先登录</p>
          <Button onClick={() => navigate('/auth')}>去登录</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800">个人资料</h1>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="text-red-500 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {profile.display_name?.[0]?.toUpperCase() || profile.username[0]?.toUpperCase() || <User className="h-8 w-8" />}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800">
                {profile.display_name || profile.username}
              </h2>
              <p className="text-slate-500">@{profile.username}</p>
              
              {/* Unique Code */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-400">专属ID:</span>
                <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono text-slate-700">
                  {profile.unique_code}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                  title="复制ID"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDisplayName(profile.display_name || '');
                  setBio(profile.bio || '');
                  setIsEditing(true);
                }}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                编辑
              </Button>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <Label className="text-slate-500 text-sm">邮箱</Label>
            <p className="text-slate-700">{user.email}</p>
          </div>

          {/* Editable Fields */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="text-slate-700">显示名称</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="输入显示名称"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-slate-700">个人简介</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="介绍一下自己..."
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-1" />
                  {loading ? '保存中...' : '保存'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-1" />
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Label className="text-slate-500 text-sm">个人简介</Label>
              <p className="text-slate-700">
                {profile.bio || <span className="text-slate-400 italic">暂无简介</span>}
              </p>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">账号信息</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">注册时间</span>
              <p className="text-slate-700">
                {new Date(profile.created_at).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <div>
              <span className="text-slate-400">用户名</span>
              <p className="text-slate-700">@{profile.username}</p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-6 p-4 bg-sky-50 rounded-xl border border-sky-100">
          <h4 className="font-medium text-sky-800 mb-2">🚀 即将推出</h4>
          <ul className="text-sm text-sky-700 space-y-1">
            <li>• 添加好友功能</li>
            <li>• 共享计划 Dashboard</li>
            <li>• 进度追踪与好友互动</li>
            <li>• 评论与鼓励系统</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
