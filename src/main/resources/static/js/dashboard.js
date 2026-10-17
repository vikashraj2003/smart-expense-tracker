const loadButton = document.getElementById("loadTransactions");
const transactionList = document.getElementById("transactionList");
const transactionForm = document.getElementById("transactionForm");
const formMessage = document.getElementById("formMessage");
const listMessage = document.getElementById("listMessage");

const searchInput = document.getElementById("searchTransactions");
const filterType = document.getElementById("filterType");
const sortOrder = document.getElementById("sortOrder");

const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const formTitle = document.getElementById("formTitle");
const dateInput = document.getElementById("transactionDate");

let allTransactions = [];

loadButton.addEventListener("click", loadAndDisplayTransactions);
transactionForm.addEventListener("submit", handleFormSubmit);
cancelEditButton.addEventListener("click", cancelEditing);

searchInput.addEventListener("input", displayFilteredTransactions);
filterType.addEventListener("change", displayFilteredTransactions);
sortOrder.addEventListener("change", displayFilteredTransactions);

function setTodayAsDefaultDate() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  dateInput.value = localDate;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

async function loadAndDisplayTransactions() {
  loadButton.disabled = true;
  loadButton.textContent = "Loading...";
  listMessage.textContent = "";

  try {
    allTransactions = await getTransactions();

    updateSummary(allTransactions);
    displayFilteredTransactions();
  } catch (error) {
    console.error(error);
    listMessage.textContent =
      "Could not load transactions. Check that the backend is running.";
    transactionList.replaceChildren();

    const item = document.createElement("li");
    item.className = "empty-state";
    item.textContent = "Transactions could not be loaded.";
    transactionList.appendChild(item);
  } finally {
    loadButton.disabled = false;
    loadButton.textContent = "Refresh Transactions";
  }
}

function updateSummary(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount);

    if (!Number.isFinite(amount)) {
      return;
    }

    if (transaction.type === "INCOME") {
      totalIncome += amount;
    } else if (transaction.type === "EXPENSE") {
      totalExpenses += amount;
    }
  });

  document.getElementById("totalIncome").textContent =
    formatCurrency(totalIncome);

  document.getElementById("totalExpenses").textContent =
    formatCurrency(totalExpenses);

  document.getElementById("balance").textContent = formatCurrency(
    totalIncome - totalExpenses,
  );
}

function displayFilteredTransactions() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedType = filterType.value;
  const selectedSort = sortOrder.value;

  const filteredTransactions = allTransactions.filter((transaction) => {
    const description = (transaction.description || "").toLowerCase();

    const matchesSearch = description.includes(searchTerm);
    const matchesType =
      selectedType === "ALL" || transaction.type === selectedType;

    return matchesSearch && matchesType;
  });

  filteredTransactions.sort((a, b) => {
    if (selectedSort === "NEWEST") {
      return String(b.transactionDate).localeCompare(String(a.transactionDate));
    }

    if (selectedSort === "OLDEST") {
      return String(a.transactionDate).localeCompare(String(b.transactionDate));
    }

    if (selectedSort === "AMOUNT_HIGH") {
      return Number(b.amount) - Number(a.amount);
    }

    if (selectedSort === "AMOUNT_LOW") {
      return Number(a.amount) - Number(b.amount);
    }

    return 0;
  });

  displayTransactions(filteredTransactions);
}

function displayTransactions(transactions) {
  transactionList.replaceChildren();

  if (transactions.length === 0) {
    const item = document.createElement("li");
    item.className = "empty-state";
    item.textContent =
      allTransactions.length === 0
        ? "No transactions yet. Add one using the form above."
        : "No transactions match your search or filter.";
    transactionList.appendChild(item);
    return;
  }

  transactions.forEach((transaction) => {
    const item = document.createElement("li");
    item.className = "transaction-item";

    const details = document.createElement("span");
    details.className = "transaction-details";
    details.textContent =
      `${transaction.transactionDate} | ` +
      `${transaction.type} | ` +
      `${transaction.currency || "INR"} ` +
      `${Number(transaction.amount).toFixed(2)} | ` +
      `${transaction.description || "No description"}`;

    const actions = document.createElement("div");
    actions.className = "transaction-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => startEditing(transaction));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () =>
      removeTransaction(transaction),
    );

    actions.append(editButton, deleteButton);
    item.append(details, actions);
    transactionList.appendChild(item);
  });
}

function startEditing(transaction) {
  transactionForm.dataset.editingId = transaction.id;

  document.getElementById("type").value = transaction.type;
  document.getElementById("amount").value = transaction.amount;
  document.getElementById("description").value = transaction.description || "";
  dateInput.value = transaction.transactionDate;

  formTitle.textContent = "Edit Transaction";
  submitButton.textContent = "Update Transaction";
  cancelEditButton.hidden = false;
  formMessage.textContent = `Editing transaction #${transaction.id}`;

  transactionForm.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function cancelEditing() {
  delete transactionForm.dataset.editingId;
  transactionForm.reset();

  formTitle.textContent = "Add Transaction";
  submitButton.textContent = "Save Transaction";
  cancelEditButton.hidden = true;
  formMessage.textContent = "";

  setTodayAsDefaultDate();
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const amount = Number(document.getElementById("amount").value);
  const description = document.getElementById("description").value.trim();
  const transactionDate = dateInput.value;

  if (!Number.isFinite(amount) || amount <= 0) {
    formMessage.textContent = "Please enter an amount greater than zero.";
    return;
  }

  if (!description || !transactionDate) {
    formMessage.textContent = "Please complete all required fields.";
    return;
  }

  const transaction = {
    type: document.getElementById("type").value,
    amount,
    currency: "INR",
    description,
    transactionDate,
  };

  const editingId = transactionForm.dataset.editingId;

  submitButton.disabled = true;
  cancelEditButton.disabled = true;
  formMessage.textContent = editingId
    ? "Updating transaction..."
    : "Saving transaction...";

  try {
    if (editingId) {
      await updateTransaction(editingId, transaction);
    } else {
      await createTransaction(transaction);
    }

    transactionForm.reset();
    delete transactionForm.dataset.editingId;

    formTitle.textContent = "Add Transaction";
    submitButton.textContent = "Save Transaction";
    cancelEditButton.hidden = true;
    formMessage.textContent = editingId
      ? "Transaction updated successfully!"
      : "Transaction saved successfully!";

    setTodayAsDefaultDate();

    // Reload the data without losing the success message.
    await loadAndDisplayTransactions();
  } catch (error) {
    console.error(error);
    formMessage.textContent = `Operation failed: ${error.message}`;
  } finally {
    submitButton.disabled = false;
    cancelEditButton.disabled = false;
  }
}

async function removeTransaction(transaction) {
  const confirmed = window.confirm(
    `Delete "${transaction.description || "this transaction"}" permanently?`,
  );

  if (!confirmed) {
    return;
  }

  listMessage.textContent = "Deleting transaction...";

  try {
    await deleteTransaction(transaction.id);
    formMessage.textContent = "Transaction deleted successfully!";
    listMessage.textContent = "";
    await loadAndDisplayTransactions();
  } catch (error) {
    console.error(error);
    listMessage.textContent = `Could not delete transaction: ${error.message}`;
  }
}

// Initialize the page.
setTodayAsDefaultDate();
loadAndDisplayTransactions();

// const loadButton = document.getElementById("loadTransactions");
// const transactionList = document.getElementById("transactionList");

// const searchInput = document.getElementById("searchTransactions");
// const filterType = document.getElementById("filterType");

// const sortOrder = document.getElementById("sortOrder");
// sortOrder.addEventListener("change", displayFilteredTransactions);

// let allTransactions = [];

// searchInput.addEventListener("input", displayFilteredTransactions);
// filterType.addEventListener("change", displayFilteredTransactions);

// const transactionForm = document.getElementById("transactionForm");
// const formMessage = document.getElementById("formMessage");

// const dateInput = document.getElementById("transactionDate");

// function setTodayAsDefaultDate() {
//   const today = new Date();
//   const localDate = new Date(
//     today.getTime() - today.getTimezoneOffset() * 60000,
//   )
//     .toISOString()
//     .split("T")[0];

//   dateInput.value = localDate;
// }

// setTodayAsDefaultDate();

// loadButton.addEventListener("click", loadAndDisplayTransactions);
// transactionForm.addEventListener("submit", handleFormSubmit);

// const cancelEditButton = document.getElementById("cancelEditButton");

// cancelEditButton.addEventListener("click", () => {
//   delete transactionForm.dataset.editingId;
//   transactionForm.reset();
//   formMessage.textContent = "";
//   document.getElementById("submitButton").textContent = "Save Transaction";
//   cancelEditButton.hidden = true;
// });
// async function loadAndDisplayTransactions() {
//   loadButton.disabled = true;
//   loadButton.textContent = "Loading...";

//   try {
//     allTransactions = await getTransactions();

//     displayFilteredTransactions();
//     updateSummary(allTransactions);
//   } catch (error) {
//     console.error(error);
//     transactionList.replaceChildren();

//     const item = document.createElement("li");
//     item.textContent = "Could not load transactions.";
//     transactionList.appendChild(item);
//   } finally {
//     loadButton.disabled = false;
//     loadButton.textContent = "Load Transactions";
//   }
// }

// function displayFilteredTransactions() {
//   const searchTerm = searchInput.value.trim().toLowerCase();
//   const selectedType = filterType.value;
//   const selectedSort = sortOrder.value;

//   const filteredTransactions = allTransactions.filter((transaction) => {
//     const description = (transaction.description || "").toLowerCase();

//     const matchesSearch = description.includes(searchTerm);
//     const matchesType =
//       selectedType === "ALL" || transaction.type === selectedType;

//     return matchesSearch && matchesType;
//   });

//   filteredTransactions.sort((a, b) => {
//     if (selectedSort === "NEWEST") {
//       return new Date(b.transactionDate) - new Date(a.transactionDate);
//     }
//     if (selectedSort === "OLDEST") {
//       return new Date(a.transactionDate) - new Date(b.transactionDate);
//     }
//     if (selectedSort === "AMOUNT_HIGH") {
//       return Number(b.amount) - Number(a.amount);
//     }
//     if (selectedSort === "AMOUNT_LOW") {
//       return Number(a.amount) - Number(b.amount);
//     }
//     return 0;
//   });

//   displayTransactions(filteredTransactions);
// }

// function displayTransactions(transactions) {
//   transactionList.replaceChildren();

//   if (transactions.length === 0) {
//     const item = document.createElement("li");
//     item.textContent = "No transactions found yet.";
//     transactionList.appendChild(item);
//     return;
//   }

//   transactions.forEach((transaction) => {
//     const item = document.createElement("li");
//     item.className = "transaction-item";

//     const details = document.createElement("span");
//     details.textContent =
//       `${transaction.transactionDate} | ` +
//       `${transaction.type} | ` +
//       `${transaction.currency} ` +
//       `${Number(transaction.amount).toFixed(2)} | ` +
//       `${transaction.description || "No description"}`;

//     const deleteButton = document.createElement("button");

//     const editButton = document.createElement("button");
//     editButton.textContent = "Edit";
//     editButton.className = "edit-button";

//     editButton.addEventListener("click", () => {
//       document.getElementById("type").value = transaction.type;
//       document.getElementById("amount").value = transaction.amount;
//       document.getElementById("description").value =
//         transaction.description || "";
//       document.getElementById("transactionDate").value =
//         transaction.transactionDate;

//       document.getElementById("formMessage").textContent =
//         `Editing transaction #${transaction.id}`;

//       transactionForm.dataset.editingId = transaction.id;
//       transactionForm.scrollIntoView({ behavior: "smooth" });
//       document.getElementById("submitButton").textContent =
//         "Update Transaction";
//       document.getElementById("cancelEditButton").hidden = false;
//     });

//     deleteButton.textContent = "Delete";
//     deleteButton.className = "delete-button";

//     deleteButton.addEventListener("click", async () => {
//       const confirmed = window.confirm(
//         "Are you sure you want to delete this transaction?",
//       );

//       if (!confirmed) return;

//       deleteButton.disabled = true;

//       try {
//         await deleteTransaction(transaction.id);
//         await loadAndDisplayTransactions();
//         formMessage.textContent = "Transaction deleted successfully!";
//       } catch (error) {
//         console.error(error);
//         formMessage.textContent = "Could not delete transaction.";
//         deleteButton.disabled = false;
//       }
//     });

//     item.append(details, editButton, deleteButton);
//     transactionList.appendChild(item);
//   });
// }

// function updateSummary(transactions) {
//   let totalIncome = 0;
//   let totalExpenses = 0;

//   transactions.forEach((transaction) => {
//     const amount = Number(transaction.amount);

//     if (transaction.type === "INCOME") {
//       totalIncome += amount;
//     } else if (transaction.type === "EXPENSE") {
//       totalExpenses += amount;
//     }
//   });

//   const balance = totalIncome - totalExpenses;

//   document.getElementById("totalIncome").textContent =
//     formatCurrency(totalIncome);

//   document.getElementById("totalExpenses").textContent =
//     formatCurrency(totalExpenses);

//   document.getElementById("balance").textContent = formatCurrency(balance);
// }

// function formatCurrency(amount) {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//   }).format(amount);
// }

// async function handleFormSubmit(event) {
//   event.preventDefault();

//   const transaction = {
//     type: document.getElementById("type").value,
//     amount: Number(document.getElementById("amount").value),
//     currency: "INR",
//     description: document.getElementById("description").value.trim(),
//     transactionDate: document.getElementById("transactionDate").value,
//   };

//   const editingId = transactionForm.dataset.editingId;

//   formMessage.textContent = editingId
//     ? "Updating transaction..."
//     : "Saving transaction...";

//   try {
//     if (editingId) {
//       await updateTransaction(editingId, transaction);
//       formMessage.textContent = "Transaction updated successfully!";

//       delete transactionForm.dataset.editingId;
//     } else {
//       await createTransaction(transaction);
//       formMessage.textContent = "Transaction saved successfully!";
//     }
//     document.getElementById("submitButton").textContent = "Save Transaction";
//     cancelEditButton.hidden = true;
//     transactionForm.reset();
//     delete transactionForm.dataset.editingId;
//     document.getElementById("submitButton").textContent = "Save Transaction";
//     cancelEditButton.hidden = true;
//     setTodayAsDefaultDate();

//     await loadAndDisplayTransactions();
//   } catch (error) {
//     console.error(error);
//     formMessage.textContent =
//       "Could not save changes. Check the browser console and backend logs.";
//   }
// }

// // Load transactions automatically when the page opens.
// loadAndDisplayTransactions();
