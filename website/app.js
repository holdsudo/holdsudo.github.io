(function () {
  const config = window.CAF_CONFIG || {};
  const forms = document.querySelectorAll("[data-caf-form]");

  function setStatus(form, type, message) {
    const box = form.querySelector("[data-form-status]");
    if (!box) return;
    box.className = "status show " + type;
    box.textContent = message;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const endpoint = form.dataset.endpoint || config.formEndpoint;
    const submit = form.querySelector("[type='submit']");
    const formType = form.dataset.cafForm;

    if (!endpoint) {
      setStatus(form, "error", "Form endpoint is not configured yet.");
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    payload.formType = formType;
    payload.page = window.location.pathname;
    payload.userAgent = navigator.userAgent;

    if (payload.companyEmail && payload.email) {
      payload.email = payload.email.trim();
      payload.companyEmail = payload.companyEmail.trim();
    }

    if (
      payload.companyEmail &&
      payload.email &&
      payload.companyEmail.toLowerCase() !== payload.email.toLowerCase()
    ) {
      setStatus(form, "error", "Email and confirmation email must match.");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending...";
    setStatus(form, "success", "Submitting your request...");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Request failed.");
      }

      form.reset();
      setStatus(form, "success", data.message || "Thanks. Your request has been sent.");
    } catch (error) {
      setStatus(form, "error", error.message || "Unable to submit the form.");
    } finally {
      submit.disabled = false;
      submit.textContent = "Submit";
    }
  }

  forms.forEach((form) => {
    form.addEventListener("submit", handleSubmit);
  });
})();
