import './login.css';
import { animateOnFocus } from './loginUI';

function Login({ setView }) {
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('+9s19336386072');
  const [password, setPassword] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [confirmationResult, setConfirmationResult] = React.useState(null);
  const [error, setError] = React.useState('');
  const [isPhoneAuth, setIsPhoneAuth] = React.useState(false);
  const [captchaVerified, setCaptchaVerified] = React.useState(false);
  const [showPhoneInput, setShowPhoneInput] = React.useState(false);
  const [captchaLoaded, setCaptchaLoaded] = React.useState(false);
  const [captchaFailed, setCaptchaFailed] = React.useState(false);
  const recaptchaContainerRef = React.useRef(null);

  React.useEffect(() => {
    if (!firebase.auth) {
      setError('Firebase Authentication is not initialized.');
      return;
    }

    if (!recaptchaContainerRef.current) {
      setError('reCAPTCHA container not found.');
      setCaptchaFailed(true);
      return;
    }

    try {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainerRef.current, {
        size: 'normal',
        callback: (response) => {
          console.log("reCAPTCHA solved:", response);
          setCaptchaVerified(true);
          recaptchaContainerRef.current.style.display = 'none';
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
          setCaptchaVerified(false);
          recaptchaContainerRef.current.style.display = 'block';
        }
      });

      window.recaptchaVerifier.render().then(widgetId => {
        console.log("reCAPTCHA rendered with widget ID:", widgetId);
        setCaptchaLoaded(true);
      }).catch(err => {
        console.error("reCAPTCHA render error:", err);
        setError('Failed to render reCAPTCHA: ' + err.message);
        setCaptchaLoaded(false);
        setCaptchaFailed(true);
      });

      const timer = setTimeout(() => {
        if (!captchaLoaded) {
          setCaptchaFailed(true);
          setError('reCAPTCHA failed to load. You can proceed without it for now.');
        }
      }, 10000);

      return () => {
        clearTimeout(timer);
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      };
    } catch (err) {
      console.error("reCAPTCHA initialization error:", err);
      setError('Failed to initialize reCAPTCHA: ' + err.message);
      setCaptchaLoaded(false);
      setCaptchaFailed(true);
    }
  }, []);

  const handleEmailLogin = async () => {
    if (!captchaVerified && !captchaFailed) {
      setError('Please verify the reCAPTCHA first.');
      return;
    }
    console.log("Attempting email login with:", email);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      setView('dashboard');
    } catch (err) {
      console.error("Email login error:", err);
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    if (!captchaVerified && !captchaFailed) {
      setError('Please verify the reCAPTCHA first.');
      return;
    }
    console.log("Attempting Google login");
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
      setView('dashboard');
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message);
    }
  };

  const handleSendOTP = async () => {
    if (!captchaVerified && !captchaFailed) {
      setError('Please verify the reCAPTCHA first.');
      return;
    }
    console.log("Sending OTP to:", phone);
    try {
      if (!window.recaptchaVerifier && !captchaFailed) {
        throw new Error('reCAPTCHA not initialized. Please try again.');
      }
      const result = await auth.signInWithPhoneNumber(phone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setIsPhoneAuth(true);
      setError('');
      console.log("OTP sent to:", phone);
    } catch (err) {
      console.error("Phone OTP error:", err);
      setError(err.message);
    }
  };

  const handleVerifyCode = async () => {
    console.log("Verifying OTP:", verificationCode);
    try {
      if (!confirmationResult) {
        throw new Error('No verification in progress.');
      }
      await confirmationResult.confirm(verificationCode);
      setView('dashboard');
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message);
    }
  };

  const handleBypassCaptcha = () => {
    setCaptchaVerified(true);
    recaptchaContainerRef.current.style.display = 'none';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>
        {!captchaVerified && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            {captchaLoaded
              ? "Please complete the reCAPTCHA below to enable login."
              : captchaFailed
              ? "reCAPTCHA failed to load. You can proceed without it for now."
              : "Loading reCAPTCHA... If it doesn't appear, please refresh the page."}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}
        {captchaFailed && !captchaVerified && (
          <button
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition duration-300 mb-4"
            onClick={handleBypassCaptcha}
          >
            Proceed Without reCAPTCHA
          </button>
        )}
        {!isPhoneAuth ? (
          <>
            <div className="mb-4">
              <input
                type="email"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={(!captchaVerified && !captchaFailed)}
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={(!captchaVerified && !captchaFailed)}
              />
            </div>
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 mb-4 disabled:opacity-50"
              onClick={handleEmailLogin}
              disabled={(!captchaVerified && !captchaFailed)}
            >
              Login with Email
            </button>
            <button
              className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition duration-300 mb-4 disabled:opacity-50"
              onClick={handleGoogleLogin}
              disabled={(!captchaVerified && !captchaFailed)}
            >
              Login with Google
            </button>
            {!showPhoneInput ? (
              <button
                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300 mb-4 disabled:opacity-50"
                onClick={() => setShowPhoneInput(true)}
                disabled={(!captchaVerified && !captchaFailed)}
              >
                Login with Phone
              </button>
            ) : (
              <>
                <div className="mb-6">
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone Number (e.g., +1234567890)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={(!captchaVerified && !captchaFailed)}
                  />
                </div>
                <button
                  className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition duration-300 mb-4 disabled:opacity-50"
                  onClick={handleSendOTP}
                  disabled={(!captchaVerified && !captchaFailed)}
                >
                  Send OTP
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <div className="mb-6">
              <input
                type="text"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 mb-4"
              onClick={handleVerifyCode}
            >
              Verify OTP
            </button>
          </>
        )}
        <div className="flex justify-between">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setView('reset')}
          >
            Forgot Password?
          </button>
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setView('signup')}
          >
            Create Account
          </button>
        </div>
        <div ref={recaptchaContainerRef} className="flex justify-center mt-4"></div>
      </div>
    </div>
  );
}