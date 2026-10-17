const API_BASE_URL = "/api/v1";

async function getTransactions() {
  const response = await fetch(`${API_BASE_URL}/transactions`);

  if (!response.ok) {
    throw new Error(`Failed to load transactions: ${response.status}`);
  }

  return response.json();
}

async function createTransaction(transaction) {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to create transaction (${response.status}): ${message}`,
    );
  }

  // Some APIs return 201 with no response body.
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : null;
}

async function updateTransaction(id, transaction) {
  const response = await fetch(
    `${API_BASE_URL}/transactions/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to update transaction (${response.status}): ${message}`,
    );
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : null;
}

async function deleteTransaction(id) {
  const response = await fetch(
    `${API_BASE_URL}/transactions/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to delete transaction (${response.status}): ${message}`,
    );
  }
}
// const API_BASE_URL = "/api/v1";

// async function getTransactions() {
//   const response = await fetch(`${API_BASE_URL}/transactions`);

//   if (!response.ok) {
//     throw new Error(`Failed to load transactions: ${response.status}`);
//   }

//   return await response.json();
// }

// async function createTransaction(transaction) {
//   const response = await fetch(`${API_BASE_URL}/transactions`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(transaction),
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(
//       `Failed to save transaction (${response.status}): ${errorText}`,
//     );
//   }

//   return await response.json();
// }

// async function deleteTransaction(id) {
//   const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
//     method: "DELETE",
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to delete transaction: ${response.status}`);
//   }
// }

// async function updateTransaction(id, transaction) {
//   const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(transaction),
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(
//       `Failed to update transaction (${response.status}): ${errorText}`,
//     );
//   }

//   return await response.json();
// }
