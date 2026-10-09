
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getProfile, logoutUser } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const data = await getProfile(accessToken);

        if (active) {
          setProfile(data);
        }
      } catch {
        if (active) {
          setError("Your session may have expired. Please sign in again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);


async function handleLogout() {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    if (accessToken && refreshToken) {
      await logoutUser(accessToken, refreshToken);
    }
  } catch (err) {
    console.error("Server logout failed:", err.message);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    navigate("/login", { replace: true });
  }
}


  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="text-xl font-bold">CardPay</span>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="text-2xl font-bold">
          Welcome{profile?.username ? `, ${profile.username}` : ""}
        </h1>
        <div className="mt-6">
  <Link
    to="/cards"
    className="inline-flex rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
  >
    Manage saved cards
  </Link>

  <Link
  to="/payment"
  className="ml-3 inline-flex rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
>
  Make a payment
</Link>

<Link
  to="/transactions"
  className="ml-3 inline-flex rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-900 hover:bg-slate-100"
>
  Transaction history
</Link>

</div>

        <p className="mt-2 text-slate-600">
          You are signed in to your Credit Card Payment System.
        </p>

        {error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
            <button
              onClick={handleLogout}
              className="ml-2 font-semibold underline"
            >
              Sign in again
            </button>
          </div>
        ) : profile ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Account information</h2>

            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm text-slate-500">Username</dt>
                <dd className="mt-1 font-medium">{profile.username}</dd>
              </div>

              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="mt-1 font-medium">{profile.email}</dd>
              </div>

              <div>
                <dt className="text-sm text-slate-500">Account ID</dt>
                <dd className="mt-1 font-medium">{profile.id}</dd>
              </div>
            </dl>

            <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              Next, we will connect your saved cards, payment form, and
              transaction history to this dashboard.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
