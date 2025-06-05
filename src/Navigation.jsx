function Navigation({ user, setView }) {
  return (
    <nav className="bg-white shadow p-4 mb-6 rounded-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        {user && (
          <div className="space-x-4">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setView('categories')}
            >
              Categories
            </button>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setView('products')}
            >
              Products
            </button>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setView('cart')}
            >
              Cart
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              onClick={async () => {
                try {
                  await auth.signOut();
                  setView('login');
                } catch (err) {
                  console.error("Logout error:", err);
                }
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}