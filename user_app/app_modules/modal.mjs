export function showModal({ title, message, input = false, confirmText = "Confirm" }) {
  return new Promise(resolve => {
    const modal = document.getElementById("ui-modal");
    const titleEl = document.getElementById("modal-title");
    const messageEl = document.getElementById("modal-message");
    const inputEl = document.getElementById("modal-input");
    const cancelBtn = document.getElementById("modal-cancel-btn");
    const confirmBtn = document.getElementById("modal-confirm-btn");

    titleEl.textContent = title;
    messageEl.textContent = message;
    confirmBtn.textContent = confirmText;

    inputEl.hidden = !input;
    if (input) {
      inputEl.value = "";
      inputEl.focus();
    }

    modal.classList.remove("hidden");

    function cleanup(result) {
      modal.classList.add("hidden");
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
      resolve(result);
    }

    function onConfirm() {
      cleanup(input ? inputEl.value.trim() : true);
    }

    function onCancel() {
      cleanup(false);
    }

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
  });
}