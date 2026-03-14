/*!
 * india-validators.js v0.1.0
 * Client-side validation library for common
 * Indian document and identifier formats.
 *
 * Author : gorupa (https://github.com/gorupa)
 * License: MIT
 *
 * DISCLAIMER: This library performs format and
 * checksum validation only. It does NOT verify
 * identity, authenticate with any government
 * API, or store any data. Always comply with
 * applicable Indian laws when handling sensitive
 * identifiers like Aadhaar and PAN.
 *
 * Validators:
 *   IndiaValidators.aadhaar(str)   → { valid, message }
 *   IndiaValidators.pan(str)       → { valid, message }
 *   IndiaValidators.gstin(str)     → { valid, message }
 *   IndiaValidators.ifsc(str)      → { valid, message }
 *   IndiaValidators.pincode(str)   → { valid, message }
 *   IndiaValidators.mobile(str)    → { valid, message }
 *   IndiaValidators.vehicle(str)   → { valid, message }
 *   IndiaValidators.passport(str)  → { valid, message }
 *   IndiaValidators.upi(str)       → { valid, message }
 *   IndiaValidators.validate(obj)  → { field: result }
 */

(function (global) {
  'use strict';

  /* ─────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────── */

  /**
   * Normalise input — trim whitespace and
   * remove common separators like spaces/dashes
   * @param {string} val
   * @param {boolean} [keepSpaces=false]
   * @returns {string}
   */
  function clean(val, keepSpaces) {
    if (typeof val !== 'string') return '';
    const s = val.trim();
    return keepSpaces ? s : s.replace(/[\s\-]/g, '');
  }

  /**
   * Build a result object
   * @param {boolean} valid
   * @param {string}  message
   * @param {*}       [meta]
   */
  function result(valid, message, meta) {
    const r = { valid, message };
    if (meta !== undefined) r.meta = meta;
    return r;
  }

  /* ─────────────────────────────────────────────
     1. AADHAAR
     12-digit number issued by UIDAI.
     Validated using the Verhoeff algorithm.
     This is FORMAT validation only — not
     identity verification.
  ───────────────────────────────────────────── */

  // Verhoeff multiplication table
  const V_D = [
    [0,1,2,3,4,5,6,7,8,9],
    [1,2,3,4,0,6,7,8,9,5],
    [2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7],
    [4,0,1,2,3,9,5,6,7,8],
    [5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],
    [7,6,5,9,8,2,1,0,4,3],
    [8,7,6,5,9,3,2,1,0,4],
    [9,8,7,6,5,4,3,2,1,0],
  ];

  // Verhoeff permutation table
  const V_P = [
    [0,1,2,3,4,5,6,7,8,9],
    [1,5,7,6,2,8,3,0,9,4],
    [5,8,0,3,7,9,6,1,4,2],
    [8,9,1,6,0,4,3,5,2,7],
    [9,4,5,3,1,2,6,8,7,0],
    [4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],
    [7,0,4,6,9,1,3,2,5,8],
  ];

  // Verhoeff inverse table
  const V_INV = [0,4,3,2,1,9,8,7,6,5];

  /**
   * Verhoeff checksum validation
   * @param {string} num - digits only
   * @returns {boolean}
   */
  function verhoeff(num) {
    let c = 0;
    const arr = num.split('').reverse();
    for (let i = 0; i < arr.length; i++) {
      c = V_D[c][V_P[i % 8][parseInt(arr[i], 10)]];
    }
    return c === 0;
  }

  /**
   * Validate an Aadhaar number (format + Verhoeff checksum)
   * @param {string} value
   * @returns {{ valid: boolean, message: string }}
   */
  function aadhaar(value) {
    const n = clean(value);
    if (!n) return result(false, 'Aadhaar number is required.');
    if (!/^\d{12}$/.test(n)) return result(false, 'Aadhaar must be exactly 12 digits.');
    if (/^0/.test(n) || /^1/.test(n)) return result(false, 'Aadhaar cannot start with 0 or 1.');
    if (!verhoeff(n)) return result(false, 'Invalid Aadhaar number (checksum failed).');
    return result(true, 'Valid Aadhaar format.');
  }

  /* ─────────────────────────────────────────────
     2. PAN
     Permanent Account Number — 10 characters
     Format: AAAAA0000A
       [0–4]  5 uppercase letters
       [5]    Entity type letter (P/C/H/F/A/T/B/L/J/G)
       [6–9]  4 digits
       [9]    1 uppercase letter (checksum)
     First letter of surname encoded in [3].
     Fourth letter encodes entity type.
  ───────────────────────────────────────────── */

  const PAN_ENTITIES = {
    P: 'Individual',
    C: 'Company',
    H: 'Hindu Undivided Family',
    F: 'Firm / LLP',
    A: 'Association of Persons',
    T: 'Trust',
    B: 'Body of Individuals',
    L: 'Local Authority',
    J: 'Artificial Juridical Person',
    G: 'Government',
  };

  /**
   * Validate a PAN number
   * @param {string} value
   * @returns {{ valid: boolean, message: string, meta?: object }}
   */
  function pan(value) {
    const n = clean(value).toUpperCase();
    if (!n) return result(false, 'PAN is required.');
    if (n.length !== 10) return result(false, 'PAN must be exactly 10 characters.');
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(n)) {
      return result(false, 'Invalid PAN format. Expected: AAAAA0000A');
    }
    const entityCode  = n[3];
    const entityName  = PAN_ENTITIES[entityCode];
    if (!entityName) {
      return result(false, `Invalid entity type "${entityCode}" in PAN.`);
    }
    return result(true, 'Valid PAN format.', { entity: entityName, entityCode });
  }

  /* ─────────────────────────────────────────────
     3. GSTIN
     Goods & Services Tax Identification Number
     15 characters:
       [0–1]  2-digit state code (01–38)
       [2–11] PAN (10 chars)
       [12]   Entity number (1–9, A–Z)
       [13]   'Z' (default)
       [14]   Checksum (alphanumeric)
  ───────────────────────────────────────────── */

  const GSTIN_STATES = {
    '01':'Jammu & Kashmir','02':'Himachal Pradesh','03':'Punjab',
    '04':'Chandigarh','05':'Uttarakhand','06':'Haryana',
    '07':'Delhi','08':'Rajasthan','09':'Uttar Pradesh',
    '10':'Bihar','11':'Sikkim','12':'Arunachal Pradesh',
    '13':'Nagaland','14':'Manipur','15':'Mizoram',
    '16':'Tripura','17':'Meghalaya','18':'Assam',
    '19':'West Bengal','20':'Jharkhand','21':'Odisha',
    '22':'Chhattisgarh','23':'Madhya Pradesh','24':'Gujarat',
    '26':'Dadra & Nagar Haveli and Daman & Diu',
    '27':'Maharashtra','28':'Andhra Pradesh (old)',
    '29':'Karnataka','30':'Goa','31':'Lakshadweep',
    '32':'Kerala','33':'Tamil Nadu','34':'Puducherry',
    '35':'Andaman & Nicobar Islands','36':'Telangana',
    '37':'Andhra Pradesh','38':'Ladakh',
    '97':'Other Territory','99':'Centre Jurisdiction',
  };

  /**
   * GSTIN checksum using mod-36 algorithm
   * @param {string} gstin - 15 chars uppercase
   * @returns {boolean}
   */
  function gstinChecksum(gstin) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      const val  = chars.indexOf(gstin[i]);
      const prod = val * (i % 2 === 0 ? 1 : 2);
      sum += Math.floor(prod / 36) + (prod % 36);
    }
    const checkChar = chars[(36 - (sum % 36)) % 36];
    return checkChar === gstin[14];
  }

  /**
   * Validate a GSTIN
   * @param {string} value
   * @returns {{ valid: boolean, message: string, meta?: object }}
   */
  function gstin(value) {
    const n = clean(value).toUpperCase();
    if (!n) return result(false, 'GSTIN is required.');
    if (n.length !== 15) return result(false, 'GSTIN must be exactly 15 characters.');
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(n)) {
      return result(false, 'Invalid GSTIN format.');
    }
    const stateCode = n.slice(0, 2);
    const stateName = GSTIN_STATES[stateCode];
    if (!stateName) return result(false, `Unknown state code "${stateCode}" in GSTIN.`);
    if (!gstinChecksum(n)) return result(false, 'Invalid GSTIN (checksum failed).');
    const embeddedPAN = n.slice(2, 12);
    return result(true, 'Valid GSTIN.', { state: stateName, stateCode, pan: embeddedPAN });
  }

  /* ─────────────────────────────────────────────
     4. IFSC
     Indian Financial System Code — 11 characters
       [0–3]  4 uppercase letters (bank code)
       [4]    '0' (reserved)
       [5–10] 6 alphanumeric (branch code)
  ───────────────────────────────────────────── */

  /**
   * Validate an IFSC code
   * @param {string} value
   * @returns {{ valid: boolean, message: string, meta?: object }}
   */
  function ifsc(value) {
    const n = clean(value).toUpperCase();
    if (!n) return result(false, 'IFSC code is required.');
    if (n.length !== 11) return result(false, 'IFSC must be exactly 11 characters.');
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(n)) {
      return result(false, 'Invalid IFSC format. Expected: AAAA0XXXXXX');
    }
    return result(true, 'Valid IFSC format.', {
      bankCode:   n.slice(0, 4),
      branchCode: n.slice(5),
    });
  }

  /* ─────────────────────────────────────────────
     5. PINCODE
     India postal PIN — exactly 6 digits
       First digit: postal zone (1–9)
       Second digit: sub-zone
       Third digit: sorting district
       Last 3: delivery post office
  ───────────────────────────────────────────── */

  const PIN_ZONES = {
    1:'Delhi, Haryana, Punjab, HP, J&K',
    2:'UP, Uttarakhand',
    3:'Rajasthan, Gujarat',
    4:'Maharashtra, Goa, MP, Chhattisgarh',
    5:'AP, Telangana, Karnataka',
    6:'Tamil Nadu, Kerala',
    7:'West Bengal, Odisha, Arunachal Pradesh, NE States',
    8:'Bihar, Jharkhand',
    9:'Army Post Office (APO/FPO)',
  };

  /**
   * Validate an India PIN code
   * @param {string} value
   * @returns {{ valid: boolean, message: string, meta?: object }}
   */
  function pincode(value) {
    const n = clean(value);
    if (!n) return result(false, 'PIN code is required.');
    if (!/^\d{6}$/.test(n)) return result(false, 'PIN code must be exactly 6 digits.');
    if (n[0] === '0') return result(false, 'PIN code cannot start with 0.');
    const zone = PIN_ZONES[n[0]];
    return result(true, 'Valid PIN code format.', { zone, firstDigit: n[0] });
  }

  /* ─────────────────────────────────────────────
     6. MOBILE
     Indian mobile numbers — 10 digits
     Must start with 6, 7, 8, or 9
     Accepts optional +91 or 0 prefix
  ───────────────────────────────────────────── */

  /**
   * Validate an Indian mobile number
   * @param {string} value
   * @returns {{ valid: boolean, message: string, meta?: object }}
   */
  function mobile(value) {
    if (!value) return result(false, 'Mobile number is required.');
    // Strip country code prefix
    let n = clean(String(value));
    n = n.replace(/^\+91/, '').replace(/^91(?=\d{10}$)/, '').replace(/^0/, '');
    if (!/^\d{10}$/.test(n)) return result(false, 'Mobile number must be 10 digits (after removing country code).');
    if (!/^[6-9]/.test(n))  return result(false, 'Indian mobile numbers must start with 6, 7, 8, or 9.');
    const series = n[0];
    const seriesMap = { 6:'Newer series (Jio etc.)', 7:'BSNL / others', 8:'Major operators', 9:'Major operators' };
    return result(true, 'Valid Indian mobile number.', { series: seriesMap[series] });
  }

  /* ─────────────────────────────────────────────
     7. VEHICLE REGISTRATION
     India vehicle registration number
     Format: AA00AA0000 or AA00A0000
     Examples: MH12AB1234, DL4CAF7016
  ───────────────────────────────────────────── */

  /**
   * Validate an India vehicle registration number
   * @param {string} value
   * @returns {{ valid: boolean, message: string }}
   */
  function vehicle(value) {
    const n = clean(value).toUpperCase();
    if (!n) return result(false, 'Vehicle number is required.');
    // Standard format: 2 letters + 2 digits + 1-2 letters + 1-4 digits
    if (!/^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{1,4}$/.test(n)) {
      return result(false, 'Invalid vehicle registration format. Example: MH12AB1234');
    }
    return result(true, 'Valid vehicle registration format.', {
      stateCode: n.slice(0, 2),
      rto:       n.slice(0, 4),
    });
  }

  /* ─────────────────────────────────────────────
     8. PASSPORT
     Indian passport number — 8 characters
       [0]    Letter (A–Z)
       [1–7]  7 digits
  ───────────────────────────────────────────── */

  /**
   * Validate an Indian passport number
   * @param {string} value
   * @returns {{ valid: boolean, message: string }}
   */
  function passport(value) {
    const n = clean(value).toUpperCase();
    if (!n) return result(false, 'Passport number is required.');
    if (!/^[A-Z][0-9]{7}$/.test(n)) {
      return result(false, 'Invalid passport format. Expected: A1234567 (1 letter + 7 digits).');
    }
    return result(true, 'Valid Indian passport format.');
  }

  /* ─────────────────────────────────────────────
     9. UPI ID
     Unified Payments Interface virtual address
     Format: username@bankhandle
     Examples: user@okaxis, 9876543210@paytm
  ───────────────────────────────────────────── */

  const UPI_HANDLES = [
    'okaxis','okhdfcbank','okicici','oksbi','paytm','ybl','ibl',
    'axl','upi','apl','rajgovhdfcbank','barodampay','utbi',
    'mahb','unionbankofindia','idbi','allbank','cnrb','icici',
    'hdfcbank','sbi','kotak','indus','rbl','federal','kvb',
    'tmb','dcb','equitas','ujjivan','airtel','jio','freecharge',
    'phonepe','gpay','bhim','postpaid','ikwik','mobikwik',
  ];

  /**
   * Validate a UPI ID
   * @param {string} value
   * @returns {{ valid: boolean, message: string, meta?: object }}
   */
  function upi(value) {
    const n = clean(value, true).toLowerCase();
    if (!n) return result(false, 'UPI ID is required.');
    if (!n.includes('@')) return result(false, 'UPI ID must contain @. Example: name@okaxis');
    const parts = n.split('@');
    if (parts.length !== 2) return result(false, 'UPI ID must have exactly one @ symbol.');
    const [username, handle] = parts;
    if (!username || username.length < 3) {
      return result(false, 'UPI username must be at least 3 characters.');
    }
    if (!/^[a-z0-9._-]+$/.test(username)) {
      return result(false, 'UPI username can only contain letters, numbers, dots, hyphens and underscores.');
    }
    if (!handle) return result(false, 'UPI handle (after @) is missing.');
    const knownHandle = UPI_HANDLES.includes(handle);
    return result(true, 'Valid UPI ID format.', {
      username,
      handle,
      knownProvider: knownHandle,
    });
  }

  /* ─────────────────────────────────────────────
     BATCH VALIDATOR
     Validate multiple fields at once
  ───────────────────────────────────────────── */

  /**
   * Validate multiple fields in one call.
   * Pass an object of { fieldName: value } pairs
   * where fieldName matches a validator name.
   *
   * @param {object} fields - e.g. { pan: 'ABCDE1234F', mobile: '9876543210' }
   * @returns {object} - { fieldName: { valid, message } }
   *
   * @example
   * IndiaValidators.validate({
   *   pan:    'ABCDE1234F',
   *   mobile: '9876543210',
   *   gstin:  '27AAAPZ0327R1ZV',
   * })
   */
  function validate(fields) {
    const validators = { aadhaar, pan, gstin, ifsc, pincode, mobile, vehicle, passport, upi };
    const out = {};
    for (const [field, value] of Object.entries(fields)) {
      if (validators[field]) {
        out[field] = validators[field](value);
      } else {
        out[field] = result(false, `Unknown validator "${field}".`);
      }
    }
    return out;
  }

  /* ─────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────── */

  const IndiaValidators = {
    version: '0.1.0',

    // Individual validators
    aadhaar,
    pan,
    gstin,
    ifsc,
    pincode,
    mobile,
    vehicle,
    passport,
    upi,

    // Batch validator
    validate,
  };

  // UMD export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndiaValidators;
  } else if (typeof define === 'function' && define.amd) {
    define([], () => IndiaValidators);
  } else {
    global.IndiaValidators = IndiaValidators;
  }

}(typeof globalThis !== 'undefined' ? globalThis
  : typeof window    !== 'undefined' ? window : this));
