import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Users, Search, Heart, MessageCircle, Swords, 
  UserPlus, Check, X, Send, Trophy, Target,
  ChevronRight, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface Friend {
  id: string;
  display_name: string | null;
  username: string;
  avatar_url: string | null;
  unique_code: string;
}

interface FriendWithProgress extends Friend {
  tasksCompleted: number;
  totalTasks: number;
  likesReceived: number;
  hasLikedToday: boolean;
}

interface PendingRequest {
  id: string;
  profile: Friend;
  isIncoming: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  from_profile: Friend;
}

export default function Friends() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendWithProgress[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<FriendWithProgress | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    if (profile) {
      loadFriends();
      loadPendingRequests();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedFriend && profile) {
      loadComments(selectedFriend.id);
    }
  }, [selectedFriend, profile]);

  const loadFriends = async () => {
    if (!profile) return;
    
    try {
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`);

      if (error) throw error;

      const friendIds = friendships?.map(f => 
        f.requester_id === profile.id ? f.addressee_id : f.requester_id
      ) || [];

      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);

      if (profileError) throw profileError;

      const today = new Date().toISOString().split('T')[0];
      
      const friendsWithProgress: FriendWithProgress[] = await Promise.all(
        (profiles || []).map(async (p) => {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('completed')
            .eq('profile_id', p.id)
            .eq('due_date', today)
            .eq('is_shared', true);

          const { count: likesCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('to_profile_id', p.id)
            .eq('target_date', today);

          const { data: myLike } = await supabase
            .from('likes')
            .select('id')
            .eq('from_profile_id', profile.id)
            .eq('to_profile_id', p.id)
            .eq('target_date', today)
            .maybeSingle();

          return {
            ...p,
            tasksCompleted: tasks?.filter(t => t.completed).length || 0,
            totalTasks: tasks?.length || 0,
            likesReceived: likesCount || 0,
            hasLikedToday: !!myLike
          };
        })
      );

      setFriends(friendsWithProgress);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    if (!profile) return;

    try {
      const { data: requests, error } = await supabase
        .from('friendships')
        .select('id, requester_id, addressee_id')
        .eq('status', 'pending')
        .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`);

      if (error) throw error;

      const profileIds = requests?.map(r => 
        r.requester_id === profile.id ? r.addressee_id : r.requester_id
      ) || [];

      if (profileIds.length === 0) {
        setPendingRequests([]);
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds);

      if (profileError) throw profileError;

      const pending = requests?.map(r => {
        const isIncoming = r.addressee_id === profile.id;
        const friendProfile = profiles?.find(p => 
          p.id === (isIncoming ? r.requester_id : r.addressee_id)
        );
        return {
          id: r.id,
          profile: friendProfile as Friend,
          isIncoming
        };
      }).filter(r => r.profile) || [];

      setPendingRequests(pending);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const loadComments = async (friendId: string) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, content, created_at, from_profile_id')
        .or(`and(from_profile_id.eq.${profile.id},to_profile_id.eq.${friendId}),and(from_profile_id.eq.${friendId},to_profile_id.eq.${profile.id})`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const profileIds = [...new Set(data?.map(c => c.from_profile_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds);

      const commentsWithProfile = data?.map(c => ({
        ...c,
        from_profile: profiles?.find(p => p.id === c.from_profile_id) as Friend
      })) || [];

      setComments(commentsWithProfile);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchCode.trim() || !profile) return;
    
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('unique_code', searchCode.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('未找到用户');
        return;
      }

      if (data.id === profile.id) {
        toast.error('不能添加自己');
        return;
      }

      const { data: existing } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(requester_id.eq.${profile.id},addressee_id.eq.${data.id}),and(requester_id.eq.${data.id},addressee_id.eq.${profile.id})`)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'accepted') {
          toast.info('已经是好友了');
        } else {
          toast.info('请求已存在');
        }
        return;
      }

      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          requester_id: profile.id,
          addressee_id: data.id
        });

      if (insertError) throw insertError;

      toast.success(`已向 ${data.display_name || data.username} 发送好友请求`);
      setSearchCode('');
      loadPendingRequests();
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('搜索失败');
    } finally {
      setSearching(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('已接受好友请求');
      loadFriends();
      loadPendingRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('操作失败');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success('已拒绝请求');
      loadPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('操作失败');
    }
  };

  const handleLike = async (friendId: string) => {
    if (!profile) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const friend = friends.find(f => f.id === friendId);
      
      if (friend?.hasLikedToday) {
        await supabase
          .from('likes')
          .delete()
          .eq('from_profile_id', profile.id)
          .eq('to_profile_id', friendId)
          .eq('target_date', today);
      } else {
        await supabase
          .from('likes')
          .insert({
            from_profile_id: profile.id,
            to_profile_id: friendId,
            target_date: today
          });
      }
      
      loadFriends();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('操作失败');
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedFriend || !profile) return;
    
    setSendingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          from_profile_id: profile.id,
          to_profile_id: selectedFriend.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      loadComments(selectedFriend.id);
      toast.success('留言发送成功');
    } catch (error) {
      console.error('Error sending comment:', error);
      toast.error('发送失败');
    } finally {
      setSendingComment(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">请先登录</p>
          <Button onClick={() => navigate('/auth')}>登录</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">好友互动</h1>
          <p className="text-slate-500">与好友分享进度，互相鼓励成长</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-sm font-medium text-slate-600 mb-4 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            添加好友
          </h2>
          <div className="flex gap-3">
            <Input
              placeholder="输入好友的唯一ID..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 mb-6">
            <h2 className="text-sm font-medium text-amber-800 mb-4">待处理请求</h2>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between bg-white rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium overflow-hidden">
                      {req.profile.avatar_url ? (
                        <img src={req.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        req.profile.display_name?.[0] || req.profile.username[0]
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{req.profile.display_name || req.profile.username}</p>
                      <p className="text-xs text-slate-400">@{req.profile.username}</p>
                    </div>
                  </div>
                  {req.isIncoming ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptRequest(req.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectRequest(req.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">等待确认</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Friends List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-medium text-slate-600 mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              好友列表
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400">还没有好友</p>
                <p className="text-xs text-slate-300 mt-1">使用唯一ID添加好友</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div 
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedFriend?.id === friend.id 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-transparent bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium overflow-hidden">
                        {friend.avatar_url ? (
                          <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          friend.display_name?.[0] || friend.username[0]
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {friend.display_name || friend.username}
                        </p>
                        <p className="text-xs text-slate-400">@{friend.username}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                    
                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">今日任务</span>
                        <span className="font-medium text-slate-700">
                          {friend.tasksCompleted}/{friend.totalTasks}
                        </span>
                      </div>
                      <Progress 
                        value={friend.totalTasks > 0 ? (friend.tasksCompleted / friend.totalTasks) * 100 : 0} 
                        className="h-2"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLike(friend.id); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                          friend.hasLikedToday
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${friend.hasLikedToday ? 'fill-current' : ''}`} />
                        {friend.likesReceived}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedFriend(friend); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-500 transition-all"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        留言
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat / Detail Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            {selectedFriend ? (
              <>
                {/* Friend Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-medium overflow-hidden">
                    {selectedFriend.avatar_url ? (
                      <img src={selectedFriend.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      selectedFriend.display_name?.[0] || selectedFriend.username[0]
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">
                      {selectedFriend.display_name || selectedFriend.username}
                    </h3>
                    <p className="text-sm text-slate-400">@{selectedFriend.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={selectedFriend.hasLikedToday ? "default" : "outline"}
                      onClick={() => handleLike(selectedFriend.id)}
                      className={selectedFriend.hasLikedToday ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                      <Heart className={`h-4 w-4 ${selectedFriend.hasLikedToday ? 'fill-white' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">今日任务</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedFriend.tasksCompleted}/{selectedFriend.totalTasks}
                    </div>
                    <Progress 
                      value={selectedFriend.totalTasks > 0 ? (selectedFriend.tasksCompleted / selectedFriend.totalTasks) * 100 : 0}
                      className="h-1.5 mt-2"
                    />
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-xs font-medium text-red-800">今日鼓励</span>
                    </div>
                    <div className="text-2xl font-bold text-red-500">
                      {selectedFriend.likesReceived}
                    </div>
                    <p className="text-xs text-red-400 mt-2">收到的点赞</p>
                  </div>
                </div>

                {/* Comments */}
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">留言板</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {comments.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm py-8">暂无留言</p>
                    ) : (
                      comments.map((comment) => (
                        <div 
                          key={comment.id}
                          className={`p-3 rounded-xl ${
                            comment.from_profile?.id === profile.id
                              ? 'bg-blue-50 ml-6'
                              : 'bg-slate-50 mr-6'
                          }`}
                        >
                          <p className="text-sm text-slate-700">{comment.content}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(comment.created_at).toLocaleString('zh-CN', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="写点鼓励的话..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendComment} disabled={sendingComment || !newComment.trim()}>
                      {sendingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 mb-1">选择一位好友</p>
                <p className="text-xs text-slate-400">查看进度并互动</p>
              </div>
            )}
          </div>
        </div>

        {/* PK Section - Coming Soon */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-800">PK挑战</h3>
              <p className="text-xs text-purple-600">即将上线</p>
            </div>
          </div>
          <p className="text-sm text-purple-700 ml-13">
            发起任务完成率PK，与好友一起竞争成长！
          </p>
        </div>
      </div>
    </div>
  );
}