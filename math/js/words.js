// Number names: 207 -> "two hundred seven", "3.04" -> "three and four hundredths".
(function (G) {
  'use strict';

  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const PLACE = ['', 'tenth', 'hundredth', 'thousandth'];

  function intWords(n) {
    if (!Number.isInteger(n) || n < 0 || n > 999999) throw new Error('intWords range: ' + n);
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
    if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + intWords(n % 100) : '');
    return intWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + intWords(n % 1000) : '');
  }

  /** Name of a place: placeName(2) -> "hundredths", placeName(2, 1) -> "hundredth". */
  function placeName(places, count) {
    return PLACE[places] + (count === 1 ? '' : 's');
  }

  /** Read a decimal (up to 3 places) the way it is written: "0.50" -> "fifty hundredths". */
  function decimalWords(s) {
    const d = G.D.parse(s);
    if (!d || d.places > 3) throw new Error('decimalWords: ' + s);
    const w = Number(d.whole);
    if (d.places === 0) return intWords(w);
    const f = Number(d.frac);
    const fracWords = intWords(f) + ' ' + placeName(d.places, f);
    return w === 0 ? fracWords : intWords(w) + ' and ' + fracWords;
  }

  G.words = { intWords, placeName, decimalWords };
})(typeof window !== 'undefined' ? (window.GML = window.GML || {}) : (globalThis.GML = globalThis.GML || {}));
