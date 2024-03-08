/* Copyright 2018 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const CHARACTERS_TO_NORMALIZE = {
  "\u2010": "-", // Hyphen
  "\u2018": "'", // Left single quotation mark
  "\u2019": "'", // Right single quotation mark
  "\u201A": "'", // Single low-9 quotation mark
  "\u201B": "'", // Single high-reversed-9 quotation mark
  "\u201C": '"', // Left double quotation mark
  "\u201D": '"', // Right double quotation mark
  "\u201E": '"', // Double low-9 quotation mark
  "\u201F": '"', // Double high-reversed-9 quotation mark
  "\u00BC": "1/4", // Vulgar fraction one quarter
  "\u00BD": "1/2", // Vulgar fraction one half
  "\u00BE": "3/4", // Vulgar fraction three quarters
};

// These diacritics aren't considered as combining diacritics
// when searching in a document:
//   https://searchfox.org/mozilla-central/source/intl/unicharutil/util/is_combining_diacritic.py.
// The combining class definitions can be found:
//   https://www.unicode.org/reports/tr44/#Canonical_Combining_Class_Values
// Category 0 corresponds to [^\p{Mn}].
const DIACRITICS_EXCEPTION = new Set([
  // UNICODE_COMBINING_CLASS_KANA_VOICING
  // https://www.compart.com/fr/unicode/combining/8
  0x3099, 0x309a,
  // UNICODE_COMBINING_CLASS_VIRAMA (under 0xFFFF)
  // https://www.compart.com/fr/unicode/combining/9
  0x094d, 0x09cd, 0x0a4d, 0x0acd, 0x0b4d, 0x0bcd, 0x0c4d, 0x0ccd, 0x0d3b,
  0x0d3c, 0x0d4d, 0x0dca, 0x0e3a, 0x0eba, 0x0f84, 0x1039, 0x103a, 0x1714,
  0x1734, 0x17d2, 0x1a60, 0x1b44, 0x1baa, 0x1bab, 0x1bf2, 0x1bf3, 0x2d7f,
  0xa806, 0xa82c, 0xa8c4, 0xa953, 0xa9c0, 0xaaf6, 0xabed,
  // 91
  // https://www.compart.com/fr/unicode/combining/91
  0x0c56,
  // 129
  // https://www.compart.com/fr/unicode/combining/129
  0x0f71,
  // 130
  // https://www.compart.com/fr/unicode/combining/130
  0x0f72, 0x0f7a, 0x0f7b, 0x0f7c, 0x0f7d, 0x0f80,
  // 132
  // https://www.compart.com/fr/unicode/combining/132
  0x0f74,
]);
let DIACRITICS_EXCEPTION_STR; // Lazily initialized, see below.

const DIACRITICS_REG_EXP = /\p{M}+/gu;
const SPECIAL_CHARS_REG_EXP =
  /([.*+?^${}()|[\]\\])|(\p{P})|(\s+)|(\p{M})|(\p{L})/gu;
const NOT_DIACRITIC_FROM_END_REG_EXP = /([^\p{M}])\p{M}*$/u;
const NOT_DIACRITIC_FROM_START_REG_EXP = /^\p{M}*([^\p{M}])/u;

// The range [AC00-D7AF] corresponds to the Hangul syllables.
// The few other chars are some CJK Compatibility Ideographs.
const SYLLABLES_REG_EXP = /[\uAC00-\uD7AF\uFA6C\uFACF-\uFAD1\uFAD5-\uFAD7]+/g;
const SYLLABLES_LENGTHS = new Map();
// When decomposed (in using NFD) the above syllables will start
// with one of the chars in this regexp.
const FIRST_CHAR_SYLLABLES_REG_EXP =
  "[\\u1100-\\u1112\\ud7a4-\\ud7af\\ud84a\\ud84c\\ud850\\ud854\\ud857\\ud85f]";

const NFKC_CHARS_TO_NORMALIZE = new Map();

let noSyllablesRegExp = null;
let withSyllablesRegExp = null;

const CharacterType = {
    SPACE: 0,
    ALPHA_LETTER: 1,
    PUNCT: 2,
    HAN_LETTER: 3,
    KATAKANA_LETTER: 4,
    HIRAGANA_LETTER: 5,
    HALFWIDTH_KATAKANA_LETTER: 6,
    THAI_LETTER: 7,
  };
  
  function isAlphabeticalScript(charCode) {
    return charCode < 0x2e80;
  }
  
  function isAscii(charCode) {
    return (charCode & 0xff80) === 0;
  }
  
  function isAsciiAlpha(charCode) {
    return (
      (charCode >= /* a = */ 0x61 && charCode <= /* z = */ 0x7a) ||
      (charCode >= /* A = */ 0x41 && charCode <= /* Z = */ 0x5a)
    );
  }
  
  function isAsciiDigit(charCode) {
    return charCode >= /* 0 = */ 0x30 && charCode <= /* 9 = */ 0x39;
  }
  
  function isAsciiSpace(charCode) {
    return (
      charCode === /* SPACE = */ 0x20 ||
      charCode === /* TAB = */ 0x09 ||
      charCode === /* CR = */ 0x0d ||
      charCode === /* LF = */ 0x0a
    );
  }
  
  function isHan(charCode) {
    return (
      (charCode >= 0x3400 && charCode <= 0x9fff) ||
      (charCode >= 0xf900 && charCode <= 0xfaff)
    );
  }
  
  function isKatakana(charCode) {
    return charCode >= 0x30a0 && charCode <= 0x30ff;
  }
  
  function isHiragana(charCode) {
    return charCode >= 0x3040 && charCode <= 0x309f;
  }
  
  function isHalfwidthKatakana(charCode) {
    return charCode >= 0xff60 && charCode <= 0xff9f;
  }
  
  function isThai(charCode) {
    return (charCode & 0xff80) === 0x0e00;
  }
  
  /**
   * This function is based on the word-break detection implemented in:
   * https://hg.mozilla.org/mozilla-central/file/tip/intl/lwbrk/WordBreaker.cpp
   */
  function getCharacterType(charCode) {
    if (isAlphabeticalScript(charCode)) {
      if (isAscii(charCode)) {
        if (isAsciiSpace(charCode)) {
          return CharacterType.SPACE;
        } else if (
          isAsciiAlpha(charCode) ||
          isAsciiDigit(charCode) ||
          charCode === /* UNDERSCORE = */ 0x5f
        ) {
          return CharacterType.ALPHA_LETTER;
        }
        return CharacterType.PUNCT;
      } else if (isThai(charCode)) {
        return CharacterType.THAI_LETTER;
      } else if (charCode === /* NBSP = */ 0xa0) {
        return CharacterType.SPACE;
      }
      return CharacterType.ALPHA_LETTER;
    }
  
    if (isHan(charCode)) {
      return CharacterType.HAN_LETTER;
    } else if (isKatakana(charCode)) {
      return CharacterType.KATAKANA_LETTER;
    } else if (isHiragana(charCode)) {
      return CharacterType.HIRAGANA_LETTER;
    } else if (isHalfwidthKatakana(charCode)) {
      return CharacterType.HALFWIDTH_KATAKANA_LETTER;
    }
    return CharacterType.ALPHA_LETTER;
  }
  
  let NormalizeWithNFKC;
  function getNormalizeWithNFKC() {
    /* eslint-disable no-irregular-whitespace */
    NormalizeWithNFKC ||= ` ¨ª¯²-µ¸-º¼-¾Ĳ-ĳĿ-ŀŉſǄ-ǌǱ-ǳʰ-ʸ˘-˝ˠ-ˤʹͺ;΄-΅·ϐ-ϖϰ-ϲϴ-ϵϹևٵ-ٸक़-य़ড়-ঢ়য়ਲ਼ਸ਼ਖ਼-ਜ਼ਫ਼ଡ଼-ଢ଼ำຳໜ-ໝ༌གྷཌྷདྷབྷཛྷཀྵჼᴬ-ᴮᴰ-ᴺᴼ-ᵍᵏ-ᵪᵸᶛ-ᶿẚ-ẛάέήίόύώΆ᾽-῁ΈΉ῍-῏ΐΊ῝-῟ΰΎ῭-`ΌΏ´-῾ - ‑‗․-… ″-‴‶-‷‼‾⁇-⁉⁗ ⁰-ⁱ⁴-₎ₐ-ₜ₨℀-℃℅-ℇ℉-ℓℕ-№ℙ-ℝ℠-™ℤΩℨK-ℭℯ-ℱℳ-ℹ℻-⅀ⅅ-ⅉ⅐-ⅿ↉∬-∭∯-∰〈-〉①-⓪⨌⩴-⩶⫝̸ⱼ-ⱽⵯ⺟⻳⼀-⿕　〶〸-〺゛-゜ゟヿㄱ-ㆎ㆒-㆟㈀-㈞㈠-㉇㉐-㉾㊀-㏿ꚜ-ꚝꝰꟲ-ꟴꟸ-ꟹꭜ-ꭟꭩ豈-嗀塚晴凞-羽蘒諸逸-都飯-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-זּטּ-לּמּנּ-סּףּ-פּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-﷼︐-︙︰-﹄﹇-﹒﹔-﹦﹨-﹫ﹰ-ﹲﹴﹶ-ﻼ！-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ￠-￦`;
  
    if (typeof PDFJSDev === "undefined" || PDFJSDev.test("TESTING")) {
      const ranges = [];
      const range = [];
      const diacriticsRegex = /^\p{M}$/u;
      // Some chars must be replaced by their NFKC counterpart during a search.
      for (let i = 0; i < 65536; i++) {
        const c = String.fromCharCode(i);
        if (c.normalize("NFKC") !== c && !diacriticsRegex.test(c)) {
          if (range.length !== 2) {
            range[0] = range[1] = i;
            continue;
          }
          if (range[1] + 1 !== i) {
            if (range[0] === range[1]) {
              ranges.push(String.fromCharCode(range[0]));
            } else {
              ranges.push(
                `${String.fromCharCode(range[0])}-${String.fromCharCode(
                  range[1]
                )}`
              );
            }
            range[0] = range[1] = i;
          } else {
            range[1] = i;
          }
        }
      }
      if (ranges.join("") !== NormalizeWithNFKC) {
        throw new Error(
          "getNormalizeWithNFKC - update the `NormalizeWithNFKC` string."
        );
      }
    }
    return NormalizeWithNFKC;
  }
  
  

  function normalize(text) {
    // The diacritics in the text or in the query can be composed or not.
    // So we use a decomposed text using NFD (and the same for the query)
    // in order to be sure that diacritics are in the same order.
  
    // Collect syllables length and positions.
    const syllablePositions = [];
    let m;
    while ((m = SYLLABLES_REG_EXP.exec(text)) !== null) {
      let { index } = m;
      for (const char of m[0]) {
        let len = SYLLABLES_LENGTHS.get(char);
        if (!len) {
          len = char.normalize("NFD").length;
          SYLLABLES_LENGTHS.set(char, len);
        }
        syllablePositions.push([len, index++]);
      }
    }
  
    let normalizationRegex;
    if (syllablePositions.length === 0 && noSyllablesRegExp) {
      normalizationRegex = noSyllablesRegExp;
    } else if (syllablePositions.length > 0 && withSyllablesRegExp) {
      normalizationRegex = withSyllablesRegExp;
    } else {
      // Compile the regular expression for text normalization once.
      const replace = Object.keys(CHARACTERS_TO_NORMALIZE).join("");
      const toNormalizeWithNFKC = getNormalizeWithNFKC();
  
      // 3040-309F: Hiragana
      // 30A0-30FF: Katakana
      const CJK = "(?:\\p{Ideographic}|[\u3040-\u30FF])";
      const HKDiacritics = "(?:\u3099|\u309A)";
      const regexp = `([${replace}])|([${toNormalizeWithNFKC}])|(${HKDiacritics}\\n)|(\\p{M}+(?:-\\n)?)|(\\S-\\n)|(${CJK}\\n)|(\\n)`;
  
      if (syllablePositions.length === 0) {
        // Most of the syllables belong to Hangul so there are no need
        // to search for them in a non-Hangul document.
        // We use the \0 in order to have the same number of groups.
        normalizationRegex = noSyllablesRegExp = new RegExp(
          regexp + "|(\\u0000)",
          "gum"
        );
      } else {
        normalizationRegex = withSyllablesRegExp = new RegExp(
          regexp + `|(${FIRST_CHAR_SYLLABLES_REG_EXP})`,
          "gum"
        );
      }
    }
  
    // The goal of this function is to normalize the string and
    // be able to get from an index in the new string the
    // corresponding index in the old string.
    // For example if we have: abCd12ef456gh where C is replaced by ccc
    // and numbers replaced by nothing (it's the case for diacritics), then
    // we'll obtain the normalized string: abcccdefgh.
    // So here the reverse map is: [0,1,2,2,2,3,6,7,11,12].
  
    // The goal is to obtain the array: [[0, 0], [3, -1], [4, -2],
    // [6, 0], [8, 3]].
    // which can be used like this:
    //  - let say that i is the index in new string and j the index
    //    the old string.
    //  - if i is in [0; 3[ then j = i + 0
    //  - if i is in [3; 4[ then j = i - 1
    //  - if i is in [4; 6[ then j = i - 2
    //  ...
    // Thanks to a binary search it's easy to know where is i and what's the
    // shift.
    // Let say that the last entry in the array is [x, s] and we have a
    // substitution at index y (old string) which will replace o chars by n chars.
    // Firstly, if o === n, then no need to add a new entry: the shift is
    // the same.
    // Secondly, if o < n, then we push the n - o elements:
    // [y - (s - 1), s - 1], [y - (s - 2), s - 2], ...
    // Thirdly, if o > n, then we push the element: [y - (s - n), o + s - n]
  
    // Collect diacritics length and positions.
    const rawDiacriticsPositions = [];
    while ((m = DIACRITICS_REG_EXP.exec(text)) !== null) {
      rawDiacriticsPositions.push([m[0].length, m.index]);
    }
  
    let normalized = text.normalize("NFD");
    const positions = [[0, 0]];
    let rawDiacriticsIndex = 0;
    let syllableIndex = 0;
    let shift = 0;
    let shiftOrigin = 0;
    let eol = 0;
    let hasDiacritics = false;
  
    normalized = normalized.replace(
      normalizationRegex,
      (match, p1, p2, p3, p4, p5, p6, p7, p8, i) => {
        i -= shiftOrigin;
        if (p1) {
          // Maybe fractions or quotations mark...
          const replacement = CHARACTERS_TO_NORMALIZE[p1];
          const jj = replacement.length;
          for (let j = 1; j < jj; j++) {
            positions.push([i - shift + j, shift - j]);
          }
          shift -= jj - 1;
          return replacement;
        }
  
        if (p2) {
          // Use the NFKC representation to normalize the char.
          let replacement = NFKC_CHARS_TO_NORMALIZE.get(p2);
          if (!replacement) {
            replacement = p2.normalize("NFKC");
            NFKC_CHARS_TO_NORMALIZE.set(p2, replacement);
          }
          const jj = replacement.length;
          for (let j = 1; j < jj; j++) {
            positions.push([i - shift + j, shift - j]);
          }
          shift -= jj - 1;
          return replacement;
        }
  
        if (p3) {
          // We've a Katakana-Hiragana diacritic followed by a \n so don't replace
          // the \n by a whitespace.
          hasDiacritics = true;
  
          // Diacritic.
          if (i + eol === rawDiacriticsPositions[rawDiacriticsIndex]?.[1]) {
            ++rawDiacriticsIndex;
          } else {
            // i is the position of the first diacritic
            // so (i - 1) is the position for the letter before.
            positions.push([i - 1 - shift + 1, shift - 1]);
            shift -= 1;
            shiftOrigin += 1;
          }
  
          // End-of-line.
          positions.push([i - shift + 1, shift]);
          shiftOrigin += 1;
          eol += 1;
  
          return p3.charAt(0);
        }
  
        if (p4) {
          const hasTrailingDashEOL = p4.endsWith("\n");
          const len = hasTrailingDashEOL ? p4.length - 2 : p4.length;
  
          // Diacritics.
          hasDiacritics = true;
          let jj = len;
          if (i + eol === rawDiacriticsPositions[rawDiacriticsIndex]?.[1]) {
            jj -= rawDiacriticsPositions[rawDiacriticsIndex][0];
            ++rawDiacriticsIndex;
          }
  
          for (let j = 1; j <= jj; j++) {
            // i is the position of the first diacritic
            // so (i - 1) is the position for the letter before.
            positions.push([i - 1 - shift + j, shift - j]);
          }
          shift -= jj;
          shiftOrigin += jj;
  
          if (hasTrailingDashEOL) {
            // Diacritics are followed by a -\n.
            // See comments in `if (p5)` block.
            i += len - 1;
            positions.push([i - shift + 1, 1 + shift]);
            shift += 1;
            shiftOrigin += 1;
            eol += 1;
            return p4.slice(0, len);
          }
  
          return p4;
        }
  
        if (p5) {
          // "X-\n" is removed because an hyphen at the end of a line
          // with not a space before is likely here to mark a break
          // in a word.
          // If X is encoded with UTF-32 then it can have a length greater than 1.
          // The \n isn't in the original text so here y = i, n = X.len - 2 and
          // o = X.len - 1.
          const len = p5.length - 2;
          positions.push([i - shift + len, 1 + shift]);
          shift += 1;
          shiftOrigin += 1;
          eol += 1;
          return p5.slice(0, -2);
        }
  
        if (p6) {
          // An ideographic at the end of a line doesn't imply adding an extra
          // white space.
          // A CJK can be encoded in UTF-32, hence their length isn't always 1.
          const len = p6.length - 1;
          positions.push([i - shift + len, shift]);
          shiftOrigin += 1;
          eol += 1;
          return p6.slice(0, -1);
        }
  
        if (p7) {
          // eol is replaced by space: "foo\nbar" is likely equivalent to
          // "foo bar".
          positions.push([i - shift + 1, shift - 1]);
          shift -= 1;
          shiftOrigin += 1;
          eol += 1;
          return " ";
        }
  
        // p8
        if (i + eol === syllablePositions[syllableIndex]?.[1]) {
          // A syllable (1 char) is replaced with several chars (n) so
          // newCharsLen = n - 1.
          const newCharLen = syllablePositions[syllableIndex][0] - 1;
          ++syllableIndex;
          for (let j = 1; j <= newCharLen; j++) {
            positions.push([i - (shift - j), shift - j]);
          }
          shift -= newCharLen;
          shiftOrigin += newCharLen;
        }
        return p8;
      }
    );
  
    positions.push([normalized.length, shift]);
  
    return [normalized, positions, hasDiacritics];
  }


  export { normalize, CharacterType, getCharacterType, getNormalizeWithNFKC };
  

