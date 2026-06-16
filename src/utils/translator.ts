export const SUPPORTED_LANGUAGES: { [key: string]: string } = {
  "auto": "Auto Detect",
  "af": "Afrikaans",
  "sq": "Albanian",
  "am": "Amharic",
  "ar": "Arabic",
  "hy": "Armenian",
  "as": "Assamese",
  "ay": "Aymara",
  "az": "Azerbaijani",
  "bm": "Bambara",
  "eu": "Basque",
  "be": "Belarusian",
  "bn": "Bengali",
  "bho": "Bhojpuri",
  "bs": "Bosnian",
  "bg": "Bulgarian",
  "ca": "Catalan",
  "ceb": "Cebuano",
  "ny": "Chichewa",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  "co": "Corsican",
  "hr": "Croatian",
  "cs": "Czech",
  "da": "Danish",
  "dv": "Dhivehi",
  "doi": "Dogri",
  "nl": "Dutch",
  "en": "English",
  "eo": "Esperanto",
  "et": "Estonian",
  "ee": "Ewe",
  "tl": "Filipino",
  "fi": "Finnish",
  "fr": "French",
  "fy": "Frisian",
  "gl": "Galician",
  "ka": "Georgian",
  "de": "German",
  "el": "Greek",
  "gn": "Guarani",
  "gu": "Gujarati",
  "ht": "Haitian Creole",
  "ha": "Hausa",
  "haw": "Hawaiian",
  "iw": "Hebrew",
  "hi": "Hindi",
  "hmn": "Hmong",
  "hu": "Hungarian",
  "is": "Icelandic",
  "ig": "Igbo",
  "ilo": "Ilocano",
  "id": "Indonesian",
  "ga": "Irish",
  "it": "Italian",
  "ja": "Japanese",
  "jw": "Javanese",
  "kn": "Kannada",
  "kk": "Kazakh",
  "km": "Khmer",
  "rw": "Kinyarwanda",
  "gom": "Konkani",
  "ko": "Korean",
  "kri": "Krio",
  "ku": "Kurdish (Kurmanji)",
  "ckb": "Kurdish (Sorani)",
  "ky": "Kyrgyz",
  "lo": "Lao",
  "la": "Latin",
  "lv": "Latvian",
  "ln": "Lingala",
  "lt": "Lithuanian",
  "lg": "Luganda",
  "lb": "Luxembourgish",
  "mk": "Macedonian",
  "mai": "Maithili",
  "mg": "Malagasy",
  "ms": "Malay",
  "ml": "Malayalam",
  "mt": "Maltese",
  "mi": "Maori",
  "mr": "Marathi",
  "mni-Mtei": "Meiteilon (Manipuri)",
  "lus": "Mizo",
  "mn": "Mongolian",
  "my": "Myanmar (Burmese)",
  "ne": "Nepali",
  "no": "Norwegian",
  "or": "Odia (Oriya)",
  "om": "Oromo",
  "ps": "Pashto",
  "fa": "Persian",
  "pl": "Polish",
  "pt": "Portuguese",
  "pa": "Punjabi",
  "qu": "Quechua",
  "ro": "Romanian",
  "ru": "Russian",
  "sm": "Samoan",
  "sa": "Sanskrit",
  "gd": "Scots Gaelic",
  "nso": "Sepedi",
  "sr": "Serbian",
  "st": "Sesotho",
  "sn": "Shona",
  "sd": "Sindhi",
  "si": "Sinhala",
  "sk": "Slovak",
  "sl": "Slovenian",
  "so": "Somali",
  "es": "Spanish",
  "su": "Sundanese",
  "sw": "Swahili",
  "sv": "Swedish",
  "tg": "Tajik",
  "ta": "Tamil",
  "tt": "Tatar",
  "te": "Telugu",
  "th": "Thai",
  "ti": "Tigrinya",
  "ts": "Tsonga",
  "tr": "Turkish",
  "tk": "Turkmen",
  "ak": "Twi",
  "uk": "Ukrainian",
  "ur": "Urdu",
  "ug": "Uyghur",
  "uz": "Uzbek",
  "vi": "Vietnamese",
  "cy": "Welsh",
  "xh": "Xhosa",
  "yi": "Yiddish",
  "yo": "Yoruba",
  "zu": "Zulu"
};

// A structurally resilient and immutable-like delimiter for machine translation engines.
// Alphanumeric code token pattern that is highly resistant to being removed, merged or translated.
const DELIMITER = " [xyz999] ";

/**
 * Single translation with retry + back-off
 */
async function translateText(text: string, source: string, target: string, delay: number): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  
  let attempt = 0;
  const maxRetries = 4;
  
  while (attempt < maxRetries) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        // High rate limit hit — exponential wait extension
        const wait = 4000 * Math.pow(2, attempt);
        console.warn(`HTTP 429 Rate Limit Hit. Waiting ${wait}ms to retry...`);
        await new Promise(resolve => setTimeout(resolve, wait));
        attempt++;
        continue;
      }
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      const data = await res.json();
      
      // Google single translate response parser
      if (Array.isArray(data) && data[0]) {
        return data[0].map((x: any) => x[0]).join('');
      }
      throw new Error("Invalid response format");
    } catch (e) {
      attempt++;
      if (attempt >= maxRetries) throw e;
      const wait = delay * Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, wait));
    }
  }
  throw new Error("Failed to translate after retries");
}

/**
 * Processes chunk translation in high-speed bundle mode
 */
export async function translateBatch(
  texts: { index: number; text: string }[],
  source: string,
  target: string,
  delay: number,
  onProgress: (index: number, translated: string[]) => void,
  isAborted: () => boolean
): Promise<void> {
  if (texts.length === 0) return;
  
  if (isAborted()) return;

  if (texts.length === 1) {
    const item = texts[0];
    const res = await translateText(item.text, source, target, delay);
    if (isAborted()) return;
    onProgress(item.index, res.split('\n'));
    return;
  }

  // Bundle translation strings
  const combined = texts.map(t => t.text).join(DELIMITER);
  try {
    const res = await translateText(combined, source, target, delay);
    if (isAborted()) return;
    
    // Improved robust delimiter matching that tolerates spaces, casing shifts, brackets
    const splitRegex = /\s*\[\s*xyz999\s*\]\s*/gi;
    const parts = res.split(splitRegex).map(p => p.trim());
    
    if (parts.length === texts.length) {
      for (let i = 0; i < texts.length; i++) {
        if (isAborted()) return;
        onProgress(texts[i].index, parts[i].split('\n'));
      }
    } else {
      // Delimiter alignment failure fallback to sub-batching / binary split
      console.warn(`Delimiter mismatch: expected ${texts.length} parts, got ${parts.length}. Falling back to binary sub-batching.`);
      await translateSubBatches(texts, source, target, delay, onProgress, isAborted);
    }
  } catch (err) {
    if (isAborted()) return;
    // Batch failure fallback to sub-batching / binary split
    console.warn(`Batch failed, falling back to binary sub-batching:`, err);
    await translateSubBatches(texts, source, target, delay, onProgress, isAborted);
  }
}

/**
 * Fallback mechanism: Sub-batching using binary splitting.
 * If a batch fails or is mismatched, split it into two smaller halves.
 * If we reach 1 text, we translate it block-by-block.
 */
async function translateSubBatches(
  texts: { index: number; text: string }[],
  source: string,
  target: string,
  delay: number,
  onProgress: (index: number, translated: string[]) => void,
  isAborted: () => boolean
): Promise<void> {
  if (texts.length === 0) return;
  if (isAborted()) return;

  if (texts.length === 1) {
    const item = texts[0];
    try {
      const res = await translateText(item.text, source, target, delay);
      if (isAborted()) return;
      onProgress(item.index, res.split('\n'));
    } catch {
      if (isAborted()) return;
      onProgress(item.index, item.text.split('\n'));
    }
    return;
  }

  // Binary split
  const mid = Math.ceil(texts.length / 2);
  const left = texts.slice(0, mid);
  const right = texts.slice(mid);

  // Translate left half
  await translateBatch(left, source, target, delay, onProgress, isAborted);
  
  // Wait delay margin between sub-batches to respect rate-limiting
  if (!isAborted()) {
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
  }

  // Translate right half
  await translateBatch(right, source, target, delay, onProgress, isAborted);
}
