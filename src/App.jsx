function App() {
  const [user, setUser] = React.useState(null);
  const [view, setView] = React.useState('login');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [cart, setCart] = React.useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  React.useEffect(() => {
    if (!auth) {
      setError("Firebase authentication failed to initialize. Please check your configuration.");
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        console.log("Auth state changed. User:", user);
        setUser(user);
        if (user) {
          setView('dashboard');
          console.log("View set to dashboard");
        }
        setLoading(false);
      }, (err) => {
        console.error("Auth state change error:", err);
        setError("Failed to check authentication state. Please try again.");
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up auth listener:", err);
      setError("An unexpected error occurred. Please refresh the page.");
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    console.log("Current view:", view);
  }, [view]);

  if (loading) {
    return <div className="container mt-4">Loading...</div>;
  }

  if (error) {
    console.log("Error displayed:", error);
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <Navigation user={user} setView={setView} />
      {view === 'login' && <Login setView={setView} />}
      {view === 'signup' && <Signup setView={setView} />}
      {view === 'reset' && <ResetPassword setView={setView} />}
      {view === 'dashboard' && <Dashboard user={user} setView={setView} />}
      {view === 'categories' && <Categories setView={setView} />}
      {view === 'products' && <Products setView={setView} addToCart={addToCart} />}
      {view === 'cart' && <Cart setView={setView} cart={cart} setCart={setCart} />}
    </div>
  );
}