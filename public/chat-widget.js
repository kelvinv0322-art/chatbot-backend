(function () {
  const bubble = document.createElement("div");
  bubble.innerText = "Chat";
  bubble.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #005b4f;
    padding: 12px 16px;
    color: white;
    border-radius: 20px;
    cursor: pointer;
    z-index: 999999;
  `;

  const panel = document.createElement("div");
  panel.style.cssText = `
    position: fixed;
    bottom: 70px;
    right: 20px;
    width: 300px;
    height: 400px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 10px;
    display: none;
    flex-direction: column;
    padding: 10px;
    z-index: 999999;
  `;

  const messagesDiv = document.createElement("div");
  messagesDiv.style.cssText = "flex: 1; overflow-y: auto;";

  const input = document.createElement("input");
  input.placeholder = "Type your message...";
  input.style.cssText = `
    padding: 8px;
    width: 100%;
    border-radius: 8px;
    border: 1px solid #ccc;
  `;

  bubble.onclick = () => {
    panel.style.display = panel.style.display === "none" ? "flex" : "none";
  };

  panel.appendChild(messagesDiv);
  panel.appendChild(input);
  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const text = input.value;
      input.value = "";

      const userMsg = document.createElement("div");
      userMsg.innerText = "You: " + text;
      messagesDiv.appendChild(userMsg);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
      });

      const data = await res.json();
      const botMsg = document.createElement("div");
      botMsg.innerText = "Bot: " + data.reply.content;
      messagesDiv.appendChild(botMsg);

      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  });
})();
