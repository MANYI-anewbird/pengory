import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { User, Copy, Check, LogOut, Edit2, Save, X, Camera, Loader2, Mail, Calendar, AtSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import penguinCharacter from '@/assets/penguin-character.png';

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');

  const handleCopyCode = async () => {
    if (profile?.unique_code) {
      await navigator.clipboard.writeText(profile.unique_code);
      setCopied(true);
      toast.success('ID copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: `${publicUrl}?t=${Date.now()}` })
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success('Avatar updated');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
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
      toast.error('Failed to save');
      return;
    }

    await refreshProfile();
    setIsEditing(false);
    toast.success('Saved successfully');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user || !profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Please log in first</p>
          <Button onClick={() => navigate('/auth')}>Log In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-12 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          {/* Header with logout */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-800">Profile</h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Avatar Section */}
          <div className="px-6 py-8 flex flex-col items-center border-b border-slate-100">
            <div className="relative group mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-white text-2xl font-medium shadow-lg overflow-hidden relative transition-all duration-200 hover:shadow-xl hover:scale-[1.02] ring-4 ring-white"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={penguinCharacter}
                    alt="Penguin Avatar"
                    className="w-full h-full object-contain"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </button>
            </div>
            
            <h2 className="text-xl font-semibold text-slate-800 mb-1">
              {profile.display_name || profile.username}
            </h2>
            <p className="text-slate-400 text-sm mb-4">@{profile.username}</p>
            
            {/* Unique ID Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full">
              <span className="text-xs text-slate-400">ID</span>
              <code className="text-xs font-mono text-slate-600">
                {profile.unique_code}
              </code>
              <button
                onClick={handleCopyCode}
                className="p-0.5 hover:bg-slate-200/50 rounded transition-colors"
                title="Copy ID"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="px-6 py-5 space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm text-slate-700 truncate">{user.email}</p>
              </div>
            </div>

            {/* Username */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <AtSign className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Username</p>
                <p className="text-sm text-slate-700">@{profile.username}</p>
              </div>
            </div>

            {/* Joined */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Joined</p>
                <p className="text-sm text-slate-700">
                  {new Date(profile.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="px-6 py-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Bio</p>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDisplayName(profile.display_name || '');
                    setBio(profile.bio || '');
                    setIsEditing(true);
                  }}
                  className="h-7 text-xs text-slate-400 hover:text-slate-600"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName" className="text-xs text-slate-500">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio" className="text-xs text-slate-500">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="mt-1.5 resize-none text-sm"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={handleSave} disabled={loading} className="h-8 text-xs">
                    <Save className="h-3 w-3 mr-1" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-8 text-xs text-slate-500">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                {profile.bio || <span className="text-slate-400 italic">No bio yet</span>}
              </p>
            )}
          </div>
        </div>

        {/* Coming Soon - Subtle footer */}
        <div className="mt-6 px-4 py-3 text-center">
          <p className="text-xs text-slate-400">
            Friends & shared plans coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
