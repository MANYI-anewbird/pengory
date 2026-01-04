import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Search, Check, X, Users, Loader2, UserPlus
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

interface FriendData extends Friend {
  myProgress: number;
  theirProgress: number;
  myTasks: number;
  theirTasks: number;
}

interface PendingRequest {
  id: string;
  profile: Friend;
  isIncoming: boolean;
}

export default function Friends() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadFriends();
      loadPendingRequests();
    }
  }, [profile]);

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
      
      // Get my tasks
      const { data: myTasks } = await supabase
        .from('tasks')
        .select('completed')
        .eq('profile_id', profile.id)
        .eq('due_date', today)
        .eq('is_shared', true);

      const myCompleted = myTasks?.filter(t => t.completed).length || 0;
      const myTotal = myTasks?.length || 0;

      const friendsWithProgress: FriendData[] = await Promise.all(
        (profiles || []).map(async (p) => {
          const { data: theirTasks } = await supabase
            .from('tasks')
            .select('completed')
            .eq('profile_id', p.id)
            .eq('due_date', today)
            .eq('is_shared', true);

          const theirCompleted = theirTasks?.filter(t => t.completed).length || 0;
          const theirTotal = theirTasks?.length || 0;

          return {
            ...p,
            myProgress: myTotal > 0 ? Math.round((myCompleted / myTotal) * 100) : 0,
            theirProgress: theirTotal > 0 ? Math.round((theirCompleted / theirTotal) * 100) : 0,
            myTasks: myTotal,
            theirTasks: theirTotal
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
        toast.error('User not found');
        return;
      }

      if (data.id === profile.id) {
        toast.error('Cannot add yourself');
        return;
      }

      const { data: existing } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(requester_id.eq.${profile.id},addressee_id.eq.${data.id}),and(requester_id.eq.${data.id},addressee_id.eq.${profile.id})`)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'accepted') {
          toast.info('Already friends');
        } else {
          toast.info('Request already sent');
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

      toast.success(`Request sent to ${data.display_name || data.username}`);
      setSearchCode('');
      loadPendingRequests();
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error('Search failed');
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

      toast.success('Friend request accepted');
      loadFriends();
      loadPendingRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Request declined');
      loadPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed');
    }
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
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Friends</h1>
          <p className="text-slate-500 text-sm mt-1">Track progress together</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex gap-3">
            <Input
              placeholder="Enter friend's unique ID..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              <span className="ml-2">Add</span>
            </Button>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 mb-6">
            <h2 className="text-sm font-medium text-amber-800 mb-4">Pending Requests</h2>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between bg-white rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                      {req.profile.avatar_url ? (
                        <img src={req.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (req.profile.display_name?.[0] || req.profile.username[0]).toUpperCase()
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
                    <span className="text-xs text-amber-600 bg-amber-100 px-3 py-1 rounded-full">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List with Progress Comparison */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : friends.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Users className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 mb-1">No friends yet</p>
            <p className="text-xs text-slate-400">Add friends using their unique ID</p>
          </div>
        ) : (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div key={friend.id} className="bg-white rounded-xl border border-slate-200 p-6">
                {/* Friend Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-medium overflow-hidden">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (friend.display_name?.[0] || friend.username[0]).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{friend.display_name || friend.username}</h3>
                    <p className="text-sm text-slate-400">@{friend.username}</p>
                  </div>
                </div>

                {/* Progress Comparison */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Today's Progress</span>
                    <span className={friend.myProgress > friend.theirProgress ? 'text-green-600 font-medium' : friend.theirProgress > friend.myProgress ? 'text-orange-500' : ''}>
                      {friend.myProgress > friend.theirProgress ? 'You lead!' : friend.theirProgress > friend.myProgress ? 'Catch up!' : 'Tied'}
                    </span>
                  </div>
                  
                  {/* Dual Progress Bar */}
                  <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden">
                    {/* Their progress (left side) */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-400 to-purple-500 transition-all duration-500"
                      style={{ width: `${friend.theirProgress / 2}%` }}
                    />
                    {/* My progress (right side, from center) */}
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-blue-400 to-blue-500 transition-all duration-500"
                      style={{ width: `${friend.myProgress / 2}%` }}
                    />
                    {/* Center divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white z-10" />
                    {/* Labels */}
                    <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-medium text-white">
                      <span className="drop-shadow">{friend.theirProgress}%</span>
                      <span className="drop-shadow">{friend.myProgress}%</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Columns */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Their Dashboard (what they share with me) */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                        {(friend.display_name?.[0] || friend.username[0]).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-purple-800">
                        {friend.display_name || friend.username}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {friend.theirProgress}%
                    </div>
                    <p className="text-xs text-purple-500">
                      {friend.theirTasks} tasks today
                    </p>
                  </div>

                  {/* My Dashboard (what I share with them) */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        {(profile.display_name?.[0] || profile.username[0]).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-blue-800">You</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {friend.myProgress}%
                    </div>
                    <p className="text-xs text-blue-500">
                      {friend.myTasks} tasks today
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}