const translateButton = document.getElementById("translateButton");
const inputText = document.getElementById("inputText");
const translatedText = document.getElementById("translatedText");

const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");

const copyButton = document.getElementById("copyButton");
const speakButton = document.getElementById("speakButton");
const swapButton = document.getElementById("swapButton");
const clearButton = document.getElementById("clearButton");

const characterCount = document.getElementById("characterCount");
const statusMessage = document.getElementById("statusMessage");
const detectedLanguage = document.getElementById("detectedLanguage");


const languageNames = {
    en: "English 🇬🇧",
    hi: "Hindi 🇮🇳",
    fr: "French 🇫🇷",
    es: "Spanish 🇪🇸",
    de: "German 🇩🇪",
    it: "Italian 🇮🇹",
    ru: "Russian 🇷🇺",
    ja: "Japanese 🇯🇵",
    zh: "Chinese 🇨🇳",
    pt: "Portuguese 🇵🇹"
};


// ====================
// TRANSLATE
// ====================

translateButton.addEventListener("click", async function() {

    const text = inputText.value.trim();

    // Check empty input
    if (text === "") {
        translatedText.value = "Please enter some text to translate.";
        return;
    }

    // Check same languages
    if (sourceLanguage.value === targetLanguage.value) {
        translatedText.value =
            "Source and target languages cannot be the same.";
        return;
    }

    translatedText.value = "Translating...";
    statusMessage.textContent = "Translating...";
    translateButton.disabled = true;

    try {

        const response = await fetch(
            "https://language-translation-api-ovb1.onrender.com/translate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    q: text,
                    source: sourceLanguage.value,
                    target: targetLanguage.value,
                    format: "text"
                })
            }
        );

        if (!response.ok) {
            throw new Error("Translation request failed.");
        }

        const data = await response.json();

        translatedText.value = data.translatedText;

        if (sourceLanguage.value === "auto" && data.detectedLanguage) {

            const detectedCode = data.detectedLanguage.language;

            const languageName = languageNames[detectedCode] || detectedCode;

            detectedLanguage.textContent = `Detected: ${languageName}`;

        } else {

            detectedLanguage.textContent = "";

        }

        statusMessage.textContent = "Translation completed";

    } catch (error) {

        translatedText.value =
            "Unable to translate. Please make sure the translation server is running.";

        statusMessage.textContent = "Translation failed";
        console.error(error);

    } finally {

        translateButton.disabled = false;

    }

});


// ====================
// COPY
// ====================

copyButton.addEventListener("click", async function() {

    const text = translatedText.value.trim();

    if (
        text === "" ||
        text === "Translating..." ||
        text === "Please enter some text to translate." ||
        text === "Source and target languages cannot be the same."
    ) {
        return;
    }

    try {

        await navigator.clipboard.writeText(text);

        copyButton.textContent = "Copied!";

        setTimeout(function() {
            copyButton.textContent = "Copy Translation";
        }, 1500);

    } catch (error) {

        console.error("Copy failed:", error);

        // Fallback method
        const temporaryTextArea = document.createElement("textarea");

        temporaryTextArea.value = text;
        document.body.appendChild(temporaryTextArea);

        temporaryTextArea.select();
        document.execCommand("copy");

        document.body.removeChild(temporaryTextArea);

        copyButton.textContent = "Copied!";

        setTimeout(function() {
            copyButton.textContent = "Copy Translation";
        }, 1500);
    }

});


// ====================
// TEXT TO SPEECH
// ====================

speakButton.addEventListener("click", function() {

    const text = translatedText.value.trim();

    if (
        text === "" ||
        text === "Translating..."
    ) {
        return;
    }

    // Stop any speech already in progress
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = targetLanguage.value;

    window.speechSynthesis.speak(speech);

});


// ====================
// SWAP LANGUAGES
// ====================

swapButton.addEventListener("click", function() {

    // Swap languages
    const currentSource = sourceLanguage.value;

    sourceLanguage.value = targetLanguage.value;
    targetLanguage.value = currentSource;


    // Swap input and output text
    const currentInput = inputText.value;

    inputText.value = translatedText.value;
    translatedText.value = currentInput;

});

inputText.addEventListener("input", function() {

    const length = inputText.value.length;

    characterCount.textContent = `${length} / 5000`;

    if (length === 0) {
        statusMessage.textContent = "Ready to translate";
    } else {
        statusMessage.textContent = "Text entered";
    }

});

clearButton.addEventListener("click", function() {

    inputText.value = "";
    translatedText.value = "";

    characterCount.textContent = "0 / 5000";
    statusMessage.textContent = "Ready to translate";
    detectedLanguage.textContent = "";

    window.speechSynthesis.cancel();

});