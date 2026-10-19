"use strict";

const form = document.getElementById("transactionForm");
const list = document.getElementById("transactionList");
const message = document.getElementById("message");
const loading = document.getElementById("loading");
const emptyMessage = document.getElementById("emptyMessage");

const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");
const netBalance = document.getElementById("netBalance");

let transactions = [];

function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function getLocalDateString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatTotals(totals) {
  const currencies = Object.keys(totals).sort();

  if (currencies.length === 0) return "₹0.00";

  return currencies
    .map((currency) => formatMoney(totals[currency], currency))
    .join(" · ");
}

function updateSummary() {
  const income = {};
  const expenses = {};

  for (const transaction of transactions) {
    const amount = Number(transaction.amount);
    if (!Number.isFinite(amount)) continue;

    const target = transaction.type === "INCOME" ? income : expenses;

    target[transaction.currency] = (target[transaction.currency] || 0) + amount;
  }

  const balances = {};

  for (const currency of new Set([
    ...Object.keys(income),
    ...Object.keys(expenses),
  ])) {
    balances[currency] = (income[currency] || 0) - (expenses[currency] || 0);
  }

  totalIncome.textContent = formatTotals(income);
  totalExpenses.textContent = formatTotals(expenses);
  netBalance.textContent = formatTotals(balances);
}

function makeCell(value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = value ?? "";
  if (className) cell.className = className;
  return cell;
}

function renderTransactions() {
  const search = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  const filter = document.getElementById("typeFilter").value;

  const filtered = transactions.filter(
    (transaction) =>
      (transaction.description || "").toLowerCase().includes(search) &&
      (filter === "ALL" || transaction.type === filter),
  );

  list.replaceChildren();

  for (const transaction of filtered) {
    const row = document.createElement("tr");

    row.append(
      makeCell(transaction.description),
      makeCell(transaction.transactionDate),
      makeCell(
        transaction.type,
        transaction.type === "INCOME" ? "income" : "expense",
      ),
      makeCell(formatMoney(transaction.amount, transaction.currency)),
    );

    const actions = document.createElement("td");

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "small-button";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => editTransaction(transaction));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "small-button delete-button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteTransaction(transaction));

    actions.append(edit, remove);
    row.append(actions);
    list.append(row);
  }

  document.getElementById("transactionCount").textContent =
    `${filtered.length} record${filtered.length === 1 ? "" : "s"}`;

  emptyMessage.hidden = filtered.length !== 0;
  updateSummary();
}

async function loadTransactions() {
  if (!ExpenseApi.accessToken) {
    window.location.replace("/login.html");
    return;
  }

  loading.hidden = false;
  loading.textContent = "Loading transactions...";
  emptyMessage.hidden = true;

  try {
    transactions = await ExpenseApi.getTransactions();
    renderTransactions();
    loading.hidden = true;
  } catch (error) {
    if (error.status === 401) {
      window.location.replace("/login.html");
      return;
    }

    loading.textContent = "Could not load transactions.";
    showMessage(error.message, "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;

  const transaction = {
    type: form.elements.type.value,
    amount: Number(form.elements.amount.value),
    currency: form.elements.currency.value,
    description: form.elements.description.value.trim(),
    transactionDate: form.elements.transactionDate.value,
  };

  try {
    await ExpenseApi.createTransaction(transaction);
    form.reset();
    document.getElementById("transactionDate").value = getLocalDateString();

    showMessage("Transaction saved successfully.");
    await loadTransactions();
  } catch (error) {
    showMessage(`Could not save transaction: ${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

async function editTransaction(transaction) {
  const description = prompt(
    "Transaction description:",
    transaction.description,
  );
  if (description === null) return;

  const amountText = prompt("Amount:", String(transaction.amount));
  if (amountText === null) return;

  const amount = Number(amountText);

  if (!description.trim() || !Number.isFinite(amount) || amount <= 0) {
    showMessage("Enter a description and a valid positive amount.", "error");
    return;
  }

  const updated = {
    type: transaction.type,
    amount,
    currency: transaction.currency,
    description: description.trim(),
    transactionDate: transaction.transactionDate,
  };

  try {
    await ExpenseApi.updateTransaction(transaction.id, updated);
    showMessage("Transaction updated successfully.");
    await loadTransactions();
  } catch (error) {
    showMessage(`Could not update transaction: ${error.message}`, "error");
  }
}

async function deleteTransaction(transaction) {
  if (!confirm(`Delete "${transaction.description}"?`)) return;

  try {
    await ExpenseApi.deleteTransaction(transaction.id);
    showMessage("Transaction deleted successfully.");
    await loadTransactions();
  } catch (error) {
    showMessage(`Could not delete transaction: ${error.message}`, "error");
  }
}

document
  .getElementById("refreshButton")
  .addEventListener("click", loadTransactions);

document
  .getElementById("searchInput")
  .addEventListener("input", renderTransactions);

document
  .getElementById("typeFilter")
  .addEventListener("change", renderTransactions);

document.getElementById("logoutButton").addEventListener("click", () => {
  ExpenseApi.logout();
  window.location.replace("/login.html");
});

document.getElementById("transactionDate").value = getLocalDateString();

loadTransactions();
