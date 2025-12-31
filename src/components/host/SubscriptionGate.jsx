import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCrown, FaLock, FaClock, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const SubscriptionGate = ({ children }) => {
    const [accessStatus, setAccessStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const hostId = JSON.parse(localStorage.getItem('hostLoginData'))?.hostId;

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = async () => {
        try {
            const response = await axios.get(`https://geoshops-production.up.railway.app/api/host/${hostId}/access-status`);
            setAccessStatus(response.data);
        } catch (error) {
            console.error('Error checking access:', error);
            setAccessStatus({
                hasAccess: false,
                reason: 'error',
                message: 'Unable to verify subscription status. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = () => {
        if (accessStatus?.reason === 'no_subscription') {
            navigate('/host/subscription');
        } else if (accessStatus?.reason === 'trial_expired_payment_pending') {
            navigate('/host/subscription-payment', {
                state: {
                    fromGate: true
                }
            });
        } else if (accessStatus?.reason === 'trial_expired_awaiting_approval') {
            // Just show the message, no action needed
            return;
        } else {
            navigate('/host/subscription');
        }
    };

    const getActionButtonText = () => {
        switch (accessStatus?.reason) {
            case 'no_subscription':
                return 'Select a Plan';
            case 'trial_expired_payment_pending':
                return 'Submit Payment';
            case 'trial_expired_awaiting_approval':
                return 'Awaiting Approval';
            case 'trial_expired':
                return 'Subscribe Now';
            default:
                return 'View Subscription';
        }
    };

    const getIcon = () => {
        switch (accessStatus?.reason) {
            case 'trial_expired_awaiting_approval':
                return <FaClock size={80} className="text-warning mb-4" />;
            case 'no_subscription':
                return <FaCrown size={80} className="text-primary mb-4" />;
            default:
                return <FaLock size={80} className="text-danger mb-4" />;
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #002C22 0%, #004d3d 100%)'
            }}>
                <div className="text-center text-white">
                    <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-3">Checking subscription status...</p>
                </div>
            </div>
        );
    }

    if (!accessStatus?.hasAccess) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #002C22 0%, #004d3d 100%)',
                padding: '2rem'
            }}>
                <Card
                    style={{
                        maxWidth: '600px',
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: 'none',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}
                >
                    <Card.Body className="p-5 text-center">
                        {getIcon()}

                        <h2 className="mb-3" style={{ fontWeight: '700', color: '#2d3748' }}>
                            Subscribe to Explore
                        </h2>

                        <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
                            {accessStatus?.message}
                        </p>

                        {accessStatus?.trialEndDate && (
                            <Alert variant="info" className="mb-4">
                                <FaClock className="me-2" />
                                Trial Expiry: {new Date(accessStatus.trialEndDate).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Alert>
                        )}

                        {accessStatus?.reason !== 'trial_expired_awaiting_approval' && (
                            <Button
                                size="lg"
                                onClick={handleActionClick}
                                style={{
                                    background: 'linear-gradient(135deg, #002C22 0%, #004d3d 100%)',
                                    border: 'none',
                                    padding: '12px 40px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    borderRadius: '50px',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                {getActionButtonText()}
                            </Button>
                        )}

                        {accessStatus?.reason === 'trial_expired_awaiting_approval' && (
                            <div className="mt-3">
                                <FaCheckCircle size={24} className="text-success me-2" />
                                <span className="text-muted">
                                    Payment submitted successfully. Please wait for admin approval.
                                </span>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-top">
                            <small className="text-muted">
                                Need help? Contact support at support@greenbooking.com
                            </small>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    // Access granted - render children
    return <>{children}</>;
};

export default SubscriptionGate;
