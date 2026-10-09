
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getCards, makePayment } from "../services/api";

export default function Payment() {
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [cardId, setCardId] = useState("");
  const [amount, setAmount] = useState("");
  const [simulateSuccess, setSimulateSuccess] = useState("true");

  const [loadingCards, setLoadingCards] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadCards() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const data = await getCards(token);

        if (!active) return;

        setCards(data);

        if (data.length > 0) {
          setCardId(String(data[0].id));
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load saved cards.");
        }
      } finally {
        if (active) {
          setLoadingCards(false);
        }
      }
    }

    loadCards();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setResult(null);

    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !Number.isInteger(numericAmount * 100)
    ) {
      setError("Enter a valid positive amount with up to 2 decimal places.");
      return;
    }

    if (!cardId) {
      setError("Please select a saved card.");
      return;
    }

    setPaying(true);

    try {
      const data = await makePayment(token, {
        card_id: Number(cardId),
        amount: numericAmount,
        simulate_success: simulateSuccess === "true",
      });

      setResult(data);
      setAmount("");
    } catch (err) {
      setError(err.message || "Payment request failed.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link to="/dashboard" className="text-xl font-bold">
            CardPay
          </Link>

          <Link
            to="/cards"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
          >
            Manage cards
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-2xl space-y-6 px-5 py-10">
        <div>
          <h1 className="text-2xl font-bold">Make a payment</h1>
          <p className="mt-2 text-slate-600">
            Simulate a payment using one of your saved cards.
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Demo mode only. This form simulates payment outcomes and does not
          charge a real card or contact a bank.
        </div>

        {error && (
          <p
            role="alert"
            className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {result && (
          <section
            role="status"
            className={`rounded-xl border p-5 ${
              result.status === "SUCCESS"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <h2 className="text-lg font-bold">
              {result.status === "SUCCESS"
                ? "Payment successful"
                : result.status === "FAILED"
                  ? "Payment failed"
                  : `Payment status: ${result.status}`}
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-600">Transaction reference</dt>
                <dd className="mt-1 break-all font-mono font-medium">
                  {result.transaction_reference}
                </dd>
              </div>

              <div>
                <dt className="text-slate-600">Amount</dt>
                <dd className="mt-1 font-semibold">
                  ₹{Number(result.amount).toFixed(2)}
                </dd>
              </div>

              <div>
                <dt className="text-slate-600">Status</dt>
                <dd className="mt-1 font-semibold">{result.status}</dd>
              </div>

              <div>
                <dt className="text-slate-600">Message</dt>
                <dd className="mt-1">{result.message}</dd>
              </div>
            </dl>

            <Link
              to="/transactions"
              className="mt-5 inline-flex font-semibold underline underline-offset-4"
            >
              View transaction history
            </Link>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="card"
                className="mb-2 block text-sm font-medium"
              >
                Select saved card
              </label>

              {loadingCards ? (
                <p className="text-sm text-slate-500">Loading cards...</p>
              ) : cards.length === 0 ? (
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  No saved cards found.{" "}
                  <Link to="/cards" className="font-semibold underline">
                    Add a card first
                  </Link>
                </div>
              ) : (
                <select
                  id="card"
                  value={cardId}
                  onChange={(event) => setCardId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                >
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.card_type} — {card.masked_card_number}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium"
              >
                Amount (₹)
              </label>

              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                max="99999999.99"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-3"
                placeholder="500.00"
              />
            </div>

            <div>
              <label
                htmlFor="simulation"
                className="mb-2 block text-sm font-medium"
              >
                Simulated result
              </label>

              <select
                id="simulation"
                value={simulateSuccess}
                onChange={(event) => setSimulateSuccess(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
              >
                <option value="true">Success</option>
                <option value="false">Failure</option>
              </select>

              <p className="mt-2 text-xs text-slate-500">
                This option is for testing only. Real payment outcomes must
                be determined by a trusted payment provider.
              </p>
            </div>

            <button
              type="submit"
              disabled={paying || loadingCards || cards.length === 0}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying ? "Processing..." : "Submit payment"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
