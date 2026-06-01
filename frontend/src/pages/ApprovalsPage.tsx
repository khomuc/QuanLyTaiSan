import { Check } from 'lucide-react';
import { EmptyState } from '../components/ui';
import type { ApprovalItem } from '../lib/types';

export default function ApprovalsPage({
  approvals,
  onSign,
}: {
  approvals: ApprovalItem[];
  onSign: (item: ApprovalItem, status: 'DA_KY' | 'TU_CHOI') => void;
}) {
  return (
    <section className="panel full">
      <div className="panel-header">
        <h2>Cong viec cho ky</h2>
      </div>
      <div className="work-list">
        {approvals.map((approval) => (
          <div className="work-item" key={`${approval.loaiPhieu}-${approval.maPhieu}`}>
            <div>
              <span className="type-chip">{approval.loaiPhieu}</span>
              <h3>{approval.maPhieu}</h3>
              <p>
                {approval.nguoiLap} - vong {approval.vongKy} -{' '}
                {approval.ngay ?? 'chua co ngay'}
              </p>
            </div>
            <div className="button-row">
              <button
                className="secondary-button danger-text"
                onClick={() => onSign(approval, 'TU_CHOI')}
                type="button"
              >
                Tu choi
              </button>
              <button
                className="primary-button"
                onClick={() => onSign(approval, 'DA_KY')}
                type="button"
              >
                <Check size={18} />
                Ky duyet
              </button>
            </div>
          </div>
        ))}
        {!approvals.length && <EmptyState text="Khong co phieu dang cho ky" />}
      </div>
    </section>
  );
}
