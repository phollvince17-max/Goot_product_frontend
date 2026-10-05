import { useState } from 'react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Account created. You can now log in.');
        setMode('login');
      } else {
        onLogin(await login(form.username, form.password));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <a className="brand auth-brand" href="#" aria-label="Stockroom home">
          <span className="brand-mark"><i /><i /><i /><i /></span>
          <span>stockroom<span className="brand-period">.</span></span>
        </a>
        <div className="auth-message">
          <p className="eyebrow">A BETTER VIEW OF WHAT YOU HAVE</p>
          <h2>Keep the<br />good stuff<br /><span>moving.</span></h2>
          <p>One calm place for products, quantities, and the details that keep a business in motion.</p>
        </div>
        <div className="shelf-art" aria-hidden="true">
          <div className="shelf-note"><span>STOCK / 01</span><span>LIVE</span></div>
          <div className="shelf-row"><i className="shelf-box box-tall" /><i className="shelf-box box-wide" /><i className="shelf-box box-short" /></div>
          <div className="shelf-line" />
          <div className="shelf-row shelf-row-bottom"><i className="shelf-box box-short" /><i className="shelf-box box-tall" /><i className="shelf-box box-wide" /></div>
          <div className="shelf-line" />
          <div className="shelf-foot"><span>ORGANIZED BY DESIGN</span><span>PH / 2026</span></div>
        </div>
        <div className="auth-aside-foot"><span>INVENTORY, IN GOOD ORDER.</span><span>01 — 03</span></div>
      </aside>

      <main className="auth-main">
        <div className="auth-topline"><span>TEAM INVENTORY</span><span><i /> SECURE WORKSPACE</span></div>
        <section className="auth-panel">
          <p className="eyebrow">{mode === 'login' ? 'YOUR WORKSPACE AWAITS' : 'JOIN THE WORKSPACE'}</p>
          <h1>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h1>
          <p className="auth-intro">{mode === 'login' ? 'Sign in to see what’s on the shelf.' : 'Set up your account to view the catalog.'}</p>
          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status">{notice}</div>}

          <form onSubmit={submit}>
            <label>Username
              <input value={form.username} onChange={set('username')} required autoFocus autoComplete="username" placeholder="Your username" />
            </label>
            {mode === 'register' && (
              <label>Email address
                <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" placeholder="you@example.com" />
              </label>
            )}
            <label>Password
              <input type="password" value={form.password} onChange={set('password')} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" />
            </label>
            <button className="button-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <span aria-hidden="true">↗</span></button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? 'New to Stockroom?' : 'Already have an account?'}
            <button type="button" onClick={() => { setError(''); setNotice(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </section>
        <footer className="auth-main-foot"><span>STOCKROOM / INVENTORY SYSTEM</span><span>MADE FOR THE EVERYDAY</span></footer>
      </main>
    </div>
  );
}
