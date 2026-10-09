
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getCards,
  addCard,
  deleteCard,
} from "../services/api";

const emptyForm = {
  cardholder_name: "",
  card_type: "CREDIT",
  card_number: "",
  expiry_month: "",
  expiry_year: "",
};

export default function Cards() {
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCards = useCallback(async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setError("");
      const data = await getCards(token);
      setCards(data);
    } catch (err) {
      setError(err.message || "Could not load saved cards.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const cardNumber = form.card_number.replace(/\s/g, "");

    if (!/^\d{13,19}$/.test(cardNumber)) {
      setError("Enter a card number containing 13–19 digits.");
      return;
    }

    setSaving(true);

    try {
      await addCard(token, {
        cardholder_name: form.cardholder_name.trim(),
        card_type: form.card_type,
        card_number: cardNumber,
        expiry_month: Number(form.expiry_month),
        expiry_year: Number(form.expiry_year),
      });

      setForm(emptyForm);
      setMessage("Card added successfully.");
      await loadCards();
    } catch (err) {
      setError(err.message || "Could not add card.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(card) {
    const confirmed = window.confirm(
      `Delete the card ending in ${card.last4}?`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteCard(token, card.id);
      setCards((currentCards) =>
        currentCards.filter((item) => item.id !== card.id)
      );
      setMessage("Card deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete card.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/dashboard" className="text-xl font-bold text-slate-900">
            CardPay
          </Link>

          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl space-y-8 px-5 py-10">
        <div>
          <h1 className="text-2xl font-bold">Saved cards</h1>
          <p className="mt-2 text-slate-600">
            Manage the cards associated with your account.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {message}
          </p>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Your saved cards</h2>

          {loading ? (
            <p className="mt-4 text-slate-500">Loading cards...</p>
          ) : cards.length === 0 ? (
            <p className="mt-4 text-slate-500">
              You haven't added any cards yet.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Cardholder</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Card number</th>
                    <th className="px-3 py-3">Expiry</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {cards.map((card) => (
                    <tr key={card.id} className="border-b border-slate-100">
                      <td className="px-3 py-4">{card.cardholder_name}</td>
                      <td className="px-3 py-4">{card.card_type}</td>
                      <td className="px-3 py-4 font-mono">
                        {card.masked_card_number}
                      </td>
                      <td className="px-3 py-4">
                        {String(card.expiry_month).padStart(2, "0")}/
                        {card.expiry_year}
                      </td>
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          onClick={() => handleDelete(card)}
                          className="font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Add a card</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This is a simulated payment project. Use test data only, never
            real card details or a real CVV.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="cardholder_name"
                className="mb-2 block text-sm font-medium"
              >
                Cardholder name
              </label>
              <input
                id="cardholder_name"
                name="cardholder_name"
                value={form.cardholder_name}
                onChange={handleChange}
                maxLength={100}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-slate-900"
                placeholder="Name on card"
              />
            </div>

            <div>
              <label
                htmlFor="card_type"
                className="mb-2 block text-sm font-medium"
              >
                Card type
              </label>
              <select
                id="card_type"
                name="card_type"
                value={form.card_type}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
              >
                <option value="CREDIT">Credit card</option>
                <option value="DEBIT">Debit card</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="card_number"
                className="mb-2 block text-sm font-medium"
              >
                Test card number
              </label>
              <input
                id="card_number"
                name="card_number"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={form.card_number}
                onChange={handleChange}
                maxLength={19}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-slate-900"
                placeholder="13–19 digits"
              />
              <p className="mt-2 text-xs text-slate-500">
                The backend should store only the masked number and last four
                digits. This form does not collect CVV.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expiry_month"
                  className="mb-2 block text-sm font-medium"
                >
                  Expiry month
                </label>
                <select
                  id="expiry_month"
                  name="expiry_month"
                  value={form.expiry_month}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, index) => index + 1).map(
                    (month) => (
                      <option key={month} value={month}>
                        {String(month).padStart(2, "0")}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="expiry_year"
                  className="mb-2 block text-sm font-medium"
                >
                  Expiry year
                </label>
                <input
                  id="expiry_year"
                  name="expiry_year"
                  type="number"
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 20}
                  value={form.expiry_year}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                  placeholder="YYYY"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {saving ? "Adding card..." : "Add card"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
