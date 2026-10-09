
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { loginUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tokens = await loginUser(form);

      if (!tokens.access || !tokens.refresh) {
        throw new Error("The server did not return both JWT tokens.");
      }

      localStorage.setItem("accessToken", tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message === "Request failed"
          ? "Unable to sign in. Check your credentials and try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your CardPay account."
      footerText="Don't have an account?"
      footerLink="/register"
      footerLabel="Create account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="Enter username"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            placeholder="Enter password"
          />
        </div>

        {error && (
          <p role="alert" className="whitespace-pre-line text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-slate-500">
        Demo project: do not enter real banking credentials or real card details.
      </p>
    </AuthLayout>
  );
}
