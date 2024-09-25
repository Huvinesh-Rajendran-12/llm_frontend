// app/javascript/controllers/chat_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    this.messageContainer = document.getElementById("messages");
    this.currentLLMMessage = null;
  }

  sendMessage(event) {
    event.preventDefault();
    const input = document.getElementById("message-input");
    const message = input.value.trim();
    if (message) {
      this.appendMessage(message, "user");
      input.value = "";

      fetch("/send_message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector(
            'meta[name="csrf-token"]',
          ).content,
        },
        body: JSON.stringify({ message: message }),
      });
    }
  }

  appendMessage(content, sender) {
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add(
      "flex",
      sender === "user" ? "justify-end" : "justify-start",
    );

    const messageElement = document.createElement("div");
    messageElement.classList.add(
      "max-w-3/4",
      "rounded-lg",
      "p-4",
      "text-white",
    );

    if (sender === "user") {
      messageElement.classList.add(
        "bg-blue-600",
        "bg-opacity-50",
      );
    } else {
      messageElement.classList.add("bg-white", "bg-opacity-20");
      const titleElement = document.createElement("div");
      titleElement.classList.add("font-bold", "mb-2");
      titleElement.textContent = "ByteGenie AI:";
      messageElement.appendChild(titleElement);
    }

    const contentElement = document.createElement("div");
    contentElement.innerHTML = this.formatMessage(content);
    messageElement.appendChild(contentElement);

    messageWrapper.appendChild(messageElement);
    this.messageContainer.appendChild(messageWrapper);
    this.messageContainer.scrollTop =
      this.messageContainer.scrollHeight;
  }

  formatMessage(content) {
    return content.replace(/\n/g, "<br>");
  }

  receiveMessage({ detail: { message, sender, is_last } }) {
    if (sender === "llm") {
      if (!this.currentLLMMessage) {
        this.currentLLMMessage = document.createElement("div");
        this.appendMessage("", "llm");
        this.messageContainer.appendChild(
          this.currentLLMMessage,
        );
      }
      this.currentLLMMessage.querySelector(
        "div:last-child",
      ).innerHTML += this.formatMessage(message);

      if (is_last) {
        this.currentLLMMessage = null;
      }
    } else {
      this.appendMessage(message, sender);
    }
    this.messageContainer.scrollTop =
      this.messageContainer.scrollHeight;
  }
}
