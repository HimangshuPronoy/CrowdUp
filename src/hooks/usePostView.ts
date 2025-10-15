import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function usePostView(postId: string, enabled: boolean = true) {
  const { user } = useAuth();
  const viewTracked = useRef(false);
  const viewStartTime = useRef<number>(0);
  const viewId = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !postId || viewTracked.current) return;

    const trackView = async () => {
      try {
        viewStartTime.current = Date.now();
        
        const { data, error } = await supabase
          .from('post_views')
          .insert({
            post_id: postId,
            user_id: user?.id || null,
            viewed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        
        viewId.current = data.id;
        viewTracked.current = true;
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    // Track view after 1 second (to avoid counting quick scrolls)
    const timer = setTimeout(trackView, 1000);

    return () => {
      clearTimeout(timer);
      
      // Update view duration on unmount
      if (viewId.current && viewStartTime.current) {
        const duration = Math.floor((Date.now() - viewStartTime.current) / 1000);
        
        supabase
          .from('post_views')
          .update({ view_duration: duration })
          .eq('id', viewId.current)
          .then(() => {
            // Recalculate engagement score
            supabase.rpc('calculate_engagement_score', { post_id: postId });
          });
      }
    };
  }, [postId, enabled, user]);

  const trackClick = async () => {
    if (viewId.current) {
      try {
        await supabase
          .from('post_views')
          .update({ clicked: true })
          .eq('id', viewId.current);
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
  };

  return { trackClick };
}
