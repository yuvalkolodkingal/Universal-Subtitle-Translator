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

const DELIMITER = " [###] ";

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
  onProgress: (index: number, translated: string[]) => void
): Promise<void> {
  if (texts.length === 0) return;
  
  if (texts.length === 1) {
    const item = texts[0];
    const res = await translateText(item.text, source, target, delay);
    onProgress(item.index, res.split('\n'));
    return;
  }

  // Bundle translation strings
  const combined = texts.map(t => t.text).join(DELIMITER);
  try {
    const res = await translateText(combined, source, target, delay);
    
    // Improved robust delimiter matching
    // Some translation engines replace " [###] " with " [ ### ] " or eat whitespace
    const splitRegex = /\s*\[\s*###\s*\]\s*/gi;
    const parts = res.split(splitRegex).map(p => p.trim());
    
    if (parts.length === texts.length) {
      for (let i = 0; i < texts.length; i++) {
        onProgress(texts[i].index, parts[i].split('\n'));
      }
    } else {
      // Delimiter alignment failure fallback to block-by-block
      console.warn(`Delimiter mismatch: expected ${texts.length} parts, got ${parts.length}. Falling back to block-by-block.`);
      for (const item of texts) {
        try {
          const fallbackRes = await translateText(item.text, source, target, delay);
          onProgress(item.index, fallbackRes.split('\n'));
          // Wait slightly to respect rate limits
          if (texts.indexOf(item) < texts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
          }
        } catch {
          // Keep original text as absolute fallback instead of losing it
          onProgress(item.index, item.text.split('\n'));
        }
      }
    }
  } catch (err) {
    // Robust batch failure fallback to block-by-block
    for (const item of texts) {
      try {
        const fallbackRes = await translateText(item.text, source, target, delay);
        onProgress(item.index, fallbackRes.split('\n'));
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
      } catch {
        // Safe fall-through on unresolvable translation block
        onProgress(item.index, item.text.split('\n'));
      }
    }
  }
}
