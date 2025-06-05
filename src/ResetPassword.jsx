function ResetPassword({ setView }) {
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const handleReset = async () => {
    try {
      await auth.sendPasswordResetEmail(email);
      setMessage('Password reset email sent!');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card form-container p-4">
      <h2 className="text-center mb-4">Reset Password</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button className="btn btn-primary w-100 mb-2" onClick={handleReset}>Send Reset Email</button>
      <button className="btn btn-link" onClick={() => setView('login')}>Back to Login</button>
    </div>
  );
}