import { redirect } from 'next/navigation';

export default function LegacyAppRouteRedirect() {
  redirect('/portal');
}
