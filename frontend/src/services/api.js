
const API_BASE_URL =
  import.meta.env.VITE_DJANGO_API_URL ||
  "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";

    if (data?.detail) {
      message = data.detail;
    } else if (data && typeof data === "object") {
      message = Object.entries(data)
        .map(([field, errors]) => {
          const text = Array.isArray(errors)
            ? errors.join(", ")
            : String(errors);

          return `${field}: ${text}`;
        })
        .join("\n");
    }

    throw new Error(message);
  }

  return data;
}

export function registerUser(userData) {
  return request("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function loginUser(credentials) {
  return request("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getProfile(accessToken) {
  return request("/api/auth/profile/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}


export function getCards(accessToken) {
  return request("/api/cards/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function addCard(accessToken, cardData) {
  return request("/api/cards/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(cardData),
  });
}

export function deleteCard(accessToken, cardId) {
  return request(`/api/cards/${cardId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}


const PAYMENT_API_URL =
  import.meta.env.VITE_PAYMENT_API_URL ||
  "http://127.0.0.1:8001";

export async function makePayment(accessToken, paymentData) {
  const response = await fetch(`${PAYMENT_API_URL}/payments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(paymentData),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail || "Payment could not be processed.";

    throw new Error(
      typeof message === "string"
        ? message
        : JSON.stringify(message)
    );
  }

  return data;
}


export function getTransactions(accessToken, filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.amount) {
    params.set("amount", filters.amount);
  }

  if (filters.date) {
    params.set("date", filters.date);
  }

  const query = params.toString();
  const path = query
    ? `/api/transactions/?${query}`
    : "/api/transactions/";

  return request(path, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}


export async function logoutUser(accessToken, refreshToken) {
  return request("/api/auth/logout/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      refresh: refreshToken,
    }),
  });
}

