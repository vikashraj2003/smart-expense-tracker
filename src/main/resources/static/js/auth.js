"use strict";

const authMessage = document.getElementById("authMessage");

function showAuthMessage(text, isError = false) {
  authMessage.textContent = text;
  authMessage.className = isError ? "message error" : "message success";
}

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = registerForm.querySelector('button[type="submit"]');
    button.disabled = true;

    try {
      await ExpenseApi.register({
        name: registerForm.elements.name.value.trim(),
        email: registerForm.elements.email.value.trim(),
        password: registerForm.elements.password.value,
      });

      showAuthMessage("Account created. Redirecting to login.");

      window.setTimeout(() => {
        window.location.assign("/login.html");
      }, 700);
    } catch (error) {
      showAuthMessage(error.message, true);
    } finally {
      button.disabled = false;
    }
  });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = loginForm.querySelector('button[type="submit"]');
    button.disabled = true;

    try {
      await ExpenseApi.login({
        email: loginForm.elements.email.value.trim(),
        password: loginForm.elements.password.value,
      });

      showAuthMessage("Login successful. Opening dashboard.");

      window.setTimeout(() => {
        window.location.assign("/");
      }, 300);
    } catch (error) {
      showAuthMessage(
        error.status === 401 ? "Invalid email or password." : error.message,
        true,
      );
    } finally {
      button.disabled = false;
    }
  });
}
