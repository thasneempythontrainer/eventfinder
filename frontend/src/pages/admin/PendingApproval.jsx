import { useAuth } from '../../context/AuthContext';
import { Clock, Mail, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const PendingApproval = () => {
  const { user, logout } = useAuth();
  const status = user?.organizer_profile?.approval_status || 'PENDING';

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', background: '#f5f1ea'
    }}>
      <div style={{
        maxWidth: '480px', width: '100%', background: 'white', borderRadius: '16px',
        padding: '48px 40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        {status === 'REJECTED' ? (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', background: '#f8d7da',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
            }}>
              <Shield size={36} color="#721c24" />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#721c24', margin: '0 0 12px' }}>
              Application Rejected
            </h1>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              Unfortunately, your organizer application has been rejected.
              Please contact our support team for more information.
            </p>
          </>
        ) : (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', background: '#fff3cd',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
            }}>
              <Clock size={36} color="#856404" />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 12px' }}>
              Waiting for Approval
            </h1>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '12px' }}>
              Your organizer account is currently being reviewed by our admin team.
              You'll receive access once your application is approved.
            </p>
            <div style={{
              background: '#f8f9fa', borderRadius: '8px', padding: '16px',
              marginBottom: '24px', fontSize: '14px', color: '#555', textAlign: 'left'
            }}>
              <p style={{ margin: '4px 0' }}><strong>Username:</strong> {user?.username}</p>
              <p style={{ margin: '4px 0' }}><strong>Email:</strong> {user?.email}</p>
              <p style={{ margin: '4px 0' }}>
                <strong>Organization:</strong> {user?.organizer_profile?.organization_name || 'N/A'}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Status:</strong>{' '}
                <span style={{ color: '#856404', fontWeight: '600' }}>{status}</span>
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <p style={{ fontSize: '13px', color: '#999', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> We'll notify you via email once approved
              </p>
              <button
                onClick={logout}
                style={{
                  padding: '12px 24px', background: 'transparent', border: '1px solid #ddd',
                  borderRadius: '8px', color: '#666', cursor: 'pointer', fontSize: '14px',
                  fontWeight: '600', transition: 'all 0.2s'
                }}
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PendingApproval;
