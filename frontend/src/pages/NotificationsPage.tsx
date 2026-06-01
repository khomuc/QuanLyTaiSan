import { Bell } from 'lucide-react';
import { EmptyState, StatusPill } from '../components/ui';
import type { NotificationItem } from '../lib/types';

export default function NotificationsPage({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  return (
    <section className="panel full">
      <div className="panel-header">
        <h2>Thong bao</h2>
      </div>
      <div className="compact-list">
        {notifications.map((notification) => (
          <div className="compact-item notification" key={notification.id}>
            <Bell size={18} />
            <div>
              <strong>{notification.documentId}</strong>
              <span>{notification.message}</span>
            </div>
            <StatusPill value={notification.status} />
          </div>
        ))}
        {!notifications.length && <EmptyState text="Hop thong bao dang trong" />}
      </div>
    </section>
  );
}
