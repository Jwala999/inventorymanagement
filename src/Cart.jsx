function Cart({ setView, cart, setCart }) {
  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    alert('Checkout successful! Thank you for your purchase.');
    setCart([]);
    setView('dashboard');
  };

  const totalPrice = cart.reduce((total, item) => total + (item.price || 0), 0);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Your Cart</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 btn-custom"
          onClick={() => setView('products')}
        >
          Continue Shopping
        </button>
      </div>
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {cart.map(item => (
              <li key={item.id} className="flex justify-between items-center p-4 border rounded-lg bg-white shadow cart-item">
                <div className="flex items-center space-x-4">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg cart-image" />
                  )}
                  <div>
                    <h4 className="text-lg font-semibold">{item.name}</h4>
                    <p className="text-gray-600">Category: {item.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold">₹{(item.price || 0).toFixed(2)}</span>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 btn-custom"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Total:</h3>
              <span className="text-xl font-bold">₹{totalPrice.toFixed(2)}</span>
            </div>
            <button
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 btn-custom"
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}