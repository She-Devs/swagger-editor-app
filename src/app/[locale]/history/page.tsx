import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HistoryList } from '@/components/HistoryList/HistoryList';

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  if (!user) redirect('/');
  const { data: history, error } = await supabase
    .from('requests_history')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <div className="history-page">
      {history.length === 0 ? (
        <div>You haven&apos;t executed any requests yet</div>
      ) : (
        <HistoryList history={history} />
      )}
    </div>
  );
}
