function Signup({ setView }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [profilePhoto, setProfilePhoto] = React.useState(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleSignup = async () => {
    if (!firstName.trim() || !lastName.trim() || !address.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      let photoUrl = '';
      if (profilePhoto) {
        photoUrl = URL.createObjectURL(profilePhoto); // Temporary URL
      }
      await db.collection('users').doc(user.uid).set({
        firstName,
        lastName,
        address,
        email,
        photoUrl: photoUrl || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => setView('dashboard'), 2000);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            {success}
          </div>
        )}
        <div className="mb-4">
          <input
            type="text"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <textarea
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows="3"
          />
        </div>
        <div className="mb-4">
          <input
            type="email"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            className="w-full px-4 py-3 border rounded-lg"
            onChange={(e) => setProfilePhoto(e.target.files[0])}
          />
          {profilePhoto && (
            <div className="mt-2">
              <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-32 h-32 object-cover rounded-full" />
            </div>
          )}
        </div>
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 mb-4"
          onClick={handleSignup}
        >
          Sign Up
        </button>
        <div className="text-center">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setView('login')}
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
}