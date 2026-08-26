import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { useToast, showError, showSuccess } from '../../components/ui/Toast';

export function Login() {
  const navigate = useNavigate();
  const { login, demoLogin } = useApp();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    
    if (success) {
      toast(showSuccess('Welcome back!', 'Redirecting to command center...'));
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Use demo@floodlens.io / demo123 or click Demo Login.');
      toast(showError('Login failed', 'Invalid credentials'));
    }
    setLoading(false);
  };

  const handleDemoLogin = () => {
    demoLogin();
    toast(showSuccess('Demo mode activated', 'Full access to command center'));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-flood-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-flood-primary flex items-center justify-center">
              <Zap className="w-7 h-7 text-flood-bg" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-flood-text">Municipal Command Center</h1>
          <p className="text-flood-muted mt-2">Sign in to access FloodLens</p>
        </div>

        <Card variant="strong" className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="demo@floodlens.io"
              required
              autoComplete="email"
              leftIcon={<Mail className="w-5 h-5" />}
            />
            
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-flood-muted hover:text-flood-text"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-flood-danger/10 border border-flood-danger/30 text-flood-danger text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-flood-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-flood-card text-flood-muted">Or continue with</span>
            </div>
          </div>

          <Button variant="secondary" className="w-full" onClick={handleDemoLogin} loading={loading}>
            <CheckCircle className="w-5 h-5" />
            Demo Login
          </Button>

          <p className="text-center text-xs text-flood-muted mt-4">
            Demo credentials: <code className="text-flood-text bg-flood-bg px-1.5 py-0.5 rounded">demo@floodlens.io</code> / <code className="text-flood-text bg-flood-bg px-1.5 py-0.5 rounded">demo123</code>
          </p>
        </Card>

        <div className="mt-6 text-center text-sm text-flood-muted">
          <Link to="/" className="hover:text-flood-text transition-colors">← Back to FloodLens</Link>
        </div>
      </div>
    </div>
  );
}