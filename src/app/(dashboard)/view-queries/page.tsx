import { getSession } from '@/lib/auth';
import ViewQueriesClient from "./ViewQueriesClient"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic';

export default async function ViewQueriesPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login')
  }

  return <ViewQueriesClient currentUser={session} />
}
