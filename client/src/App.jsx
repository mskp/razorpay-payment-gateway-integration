import { useEffect, useState } from "react";
import axios from "axios";
import options from "./razorPayOptions";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function App() {
  const [amount, setAmount] = useState(50);
  const [paymentsHistory, setPaymentsHistory] = useState([]);

  useEffect(() => {
    async function fetchPaymentsHistory() {
      const { data } = await axios.get(`${SERVER_URL}/api/paymentHistory`);
      setPaymentsHistory(data);
    }

    fetchPaymentsHistory();
  }, []);

  const incrementBy50 = () => {
    if (amount >= 1000) return;
    setAmount((prev) => prev + 50);
  };
  const decrementBy50 = () => {
    if (amount <= 50) return;
    setAmount((prev) => prev - 50);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    console.log(window);
    if (amount <= 0) return;
    const response = await axios.post(`${SERVER_URL}/api/checkout`, { amount });
    const { order } = response.data;
    options.amount = order.amount;
    options.order_id = order.id;
    var rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "space-between",
        color: "black",
      }}
    >
      <section>
        <div>
          <h1>Amount you're gonna donate: {amount} </h1>
          <button
            style={{
              padding: "2rem",
              fontSize: "2rem",
              backgroundColor: "red",
            }}
            onClick={decrementBy50}
          >
            -
          </button>
          <button
            style={{
              padding: "2rem",
              fontSize: "2rem",
              backgroundColor: "green",
            }}
            onClick={incrementBy50}
          >
            +
          </button>
        </div>
        <small>You can donate between 50-1000 Rs/-</small>
        <br />
        <br />
        <button onClick={handleCheckout}>Checkout</button>
      </section>
      <section>
        <h1>Previous transactions</h1>
        {paymentsHistory.length > 0 ? (
          <ul>
            {paymentsHistory.map((payment, idx) => (
              <pre key={idx}>{JSON.stringify(payment, null, 2)}</pre>
            ))}
          </ul>
        ) : (
          <p>No records found</p>
        )}
      </section>
    </main>
  );
}

export default App;
