
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getTransactions } from "../services/api";

const emptyFilters = {
  status: "",
  amount: "",
  date: "",
};

export default function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getTransactions(token, appliedFilters);
      setTransactions(data);
    } catch (err) {
      setError(err.message || "Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [navigate, appliedFilters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  function handleChange(event) {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setAppliedFilters({ ...filters });
  }

  function handleReset() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/dashboard" className="text-xl font-bold text-slate-900">
            CardPay
          </Link>

          <nav className="flex flex-wrap gap-3 text-sm">
            <Link
              to="/cards"
              className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100"
            >
              Saved cards
            </Link>

            <Link
              to="/payment"
              className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-700"
            >
              Make payment
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl space-y-6 px-5 py-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Transaction history
          </h1>
          <p className="mt-2 text-slate-600">
            Review and filter your previous payment attempts.
          </p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Filter transactions</h2>

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
              >
                <option value="">All statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium"
              >
                Exact amount (₹)
              </label>

              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={filters.amount}
                onChange={handleChange}
                placeholder="500.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-sm font-medium"
              >
                Transaction date
              </label>

              <input
                id="date"
                name="date"
                type="date"
                value={filters.date}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-3"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
              >
                Apply
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-slate-300 px-4 py-3 font-medium hover:bg-slate-100"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div
            role="alert"
            className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Your transactions</h2>
            <span className="text-sm text-slate-500">
              {loading ? "Loading..." : `${transactions.length} records`}
            </span>
          </div>

          {loading ? (
            <p className="py-8 text-slate-500">
              Loading transaction history...
            </p>
          ) : transactions.length === 0 ? (
            <p className="py-8 text-slate-500">
              No transactions match these filters.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Reference</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Card ID</th>
                    <th className="px-3 py-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="break-all px-3 py-4 font-mono text-xs">
                        {transaction.transaction_reference}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 font-medium">
                        ₹{Number(transaction.amount).toFixed(2)}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            transaction.status === "SUCCESS"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "FAILED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>

                      <td className="px-3 py-4">{transaction.card_id}</td>

                      <td className="whitespace-nowrap px-3 py-4">
                        {new Date(transaction.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
