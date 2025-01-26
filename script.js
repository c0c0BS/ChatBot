async function postChatMessage() {
    const userMessage = chatField.value;
    if (!userMessage.trim()) return; // Leere Nachrichten ignorieren

    // Zeige die Nutzer-Nachricht
    msgContainer.innerHTML += `<div class="msg-me">${userMessage}</div>`;

    // Zeige einen Ladeindikator
    const loadingElement = document.createElement("div");
    loadingElement.className = "msg";
    loadingElement.innerText = "Lade...";
    msgContainer.appendChild(loadingElement);

    try {
        // Hole die Antwort von der Cohere API
        const responseMessage = await askCohere(userMessage);

        // Ladeindikator entfernen und Antwort anzeigen
        loadingElement.remove();
        msgContainer.innerHTML += `<div class="msg">${responseMessage}</div>`;
    } catch (error) {
        // Fehlerbehandlung
        loadingElement.remove();
        msgContainer.innerHTML += `<div class="msg error">Fehler: ${error.message}</div>`;
        console.error("Fehler beim Abrufen der Antwort:", error);
    } finally {
        chatField.value = ''; // Eingabefeld leeren
    }
}

async function askCohere(question) {
    const apiKey = 'jqpPc60cfCue66MNCYhwLniqrchgXS9e5GujeGja'; // Setze hier deinen Cohere API-Key ein
    const apiUrl = 'https://api.cohere.ai/v1/generate';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'command-xlarge-nightly', // Cohere-Modell (ersetze dies durch das gewünschte Modell)
                prompt: `Bitte beantworte die folgende Frage auf Deutsch: ${question}`,  // Frage auf Deutsch beantworten
                max_tokens: 150,  // Maximale Antwortlänge
                temperature: 0.7,  // Kreativität (zwischen 0 und 1)
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API-Fehlerdetails:", errorData);
            throw new Error(errorData.error?.message || `HTTP-Fehler: ${response.status}`);
        }

        const data = await response.json();
        // Überprüfe, ob der Text in der Antwort enthalten ist
        if (data && data.generations && data.generations.length > 0) {
            return data.generations[0].text.trim();  // Extrahiere den Text aus der Generation
        } else {
            throw new Error('Keine Antwort von Cohere erhalten.');
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Antwort von Cohere:", error);
        throw error;
    }
}
