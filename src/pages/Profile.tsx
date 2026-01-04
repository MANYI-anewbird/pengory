import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { User, Copy, Check, LogOut, Edit2, Save, X, Camera, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
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
    <div className="h-full overflow-y-auto p-4 md:p-8 flex items-start justify-center">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Profile</h1>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="text-red-500 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 mb-4 md:mb-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 mb-6">
            {/* Avatar with upload */}
            <div className="relative group">
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
                className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-blue-800 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg overflow-hidden relative transition-transform hover:scale-105"
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
                  profile.display_name?.[0]?.toUpperCase() || 
                  profile.username[0]?.toUpperCase() || 
                  <User className="h-10 w-10" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </button>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-slate-800">
                {profile.display_name || profile.username}
              </h2>
              <p className="text-slate-500">@{profile.username}</p>
              
              {/* Unique Code */}
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs text-slate-400">Unique ID:</span>
                <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono text-slate-700">
                  {profile.unique_code}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                  title="Copy ID"
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
                className="shrink-0"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <Label className="text-slate-500 text-sm">Email</Label>
            <p className="text-slate-700">{user.email}</p>
          </div>

          {/* Editable Fields */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="text-slate-700">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-slate-700">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-1" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Label className="text-slate-500 text-sm">Bio</Label>
              <p className="text-slate-700">
                {profile.bio || <span className="text-slate-400 italic">No bio yet</span>}
              </p>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Account Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Joined</span>
              <p className="text-slate-700">
                {new Date(profile.created_at).toLocaleDateString('en-US')}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Username</span>
              <p className="text-slate-700">@{profile.username}</p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-4 md:mt-6 p-4 bg-sky-50 rounded-xl border border-sky-100">
          <h4 className="font-medium text-sky-800 mb-2">🚀 Coming Soon</h4>
          <ul className="text-sm text-sky-700 space-y-1">
            <li>• Add Friends</li>
            <li>• Shared Plan Dashboard</li>
            <li>• Progress Tracking & Friend Interactions</li>
            <li>• Comments & Encouragement System</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
