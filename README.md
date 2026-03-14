# india-validators

[![Live Demo](https://img.shields.io/badge/Live%20Demo-india--validators-1a73e8?style=for-the-badge)](https://gorupa.github.io/india-validators/demo/)

[![npm](https://img.shields.io/npm/v/india-validators?style=for-the-badge&color=1a73e8)](https://www.npmjs.com/package/india-validators)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-6d28d9?style=for-the-badge&logo=github)](https://github.com/Gorupa/india-validators)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-green?style=for-the-badge)](https://github.com/Gorupa/india-validators)

> Client-side validation library for common Indian document and identifier formats. Zero dependencies. Works in browser and Node.js.

**DISCLAIMER:** This library performs format and checksum validation only. It does NOT verify identity, authenticate with any government API, or store any data. Always comply with applicable Indian laws when handling sensitive identifiers.

---

## Validators

| Validator | What it checks |
|---|---|
| `aadhaar` | 12-digit format + Verhoeff checksum |
| `pan` | 10-char format + entity type |
| `gstin` | 15-char format + state code + mod-36 checksum |
| `ifsc` | 11-char bank code format |
| `pincode` | 6-digit PIN + postal zone |
| `mobile` | 10-digit Indian mobile + series check |
| `vehicle` | India vehicle registration format |
| `passport` | Indian passport number format |
| `upi` | UPI virtual payment address format |

---

## Install

```bash
npm install india-validators
```

Or via CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/Gorupa/india-validators/india-validators.js"></script>
```

---

## Usage

### Individual validators

Every validator returns `{ valid: boolean, message: string, meta?: object }`.

```js
const IV = require('india-validators');

// Aadhaar — Verhoeff checksum validation
IV.aadhaar('2345 6789 0123');
// → { valid: true, message: 'Valid Aadhaar format.' }

// PAN — format + entity type
IV.pan('ABCDE1234F');
// → { valid: true, message: 'Valid PAN format.', meta: { entity: 'Individual', entityCode: 'P' } }

// GSTIN — format + state + checksum
IV.gstin('27AAAPZ0327R1ZV');
// → { valid: true, message: 'Valid GSTIN.', meta: { state: 'Maharashtra', pan: 'AAAPZ0327R' } }

// IFSC — bank code format
IV.ifsc('SBIN0001234');
// → { valid: true, message: 'Valid IFSC format.', meta: { bankCode: 'SBIN', branchCode: '001234' } }

// PIN code — 6-digit format + zone
IV.pincode('400001');
// → { valid: true, message: 'Valid PIN code format.', meta: { zone: 'Maharashtra, Goa, MP, Chhattisgarh' } }

// Mobile — 10-digit Indian mobile
IV.mobile('+91 9876543210');
// → { valid: true, message: 'Valid Indian mobile number.' }

// Vehicle registration
IV.vehicle('MH12AB1234');
// → { valid: true, message: 'Valid vehicle registration format.', meta: { stateCode: 'MH', rto: 'MH12' } }

// Passport
IV.passport('A1234567');
// → { valid: true, message: 'Valid Indian passport format.' }

// UPI ID
IV.upi('gaurav@okaxis');
// → { valid: true, message: 'Valid UPI ID format.', meta: { username: 'gaurav', handle: 'okaxis', knownProvider: true } }
```

### Batch validation

Validate multiple fields at once:

```js
const results = IV.validate({
    pan:    'ABCDE1234F',
    mobile: '9876543210',
    gstin:  '27AAAPZ0327R1ZV',
    ifsc:   'SBIN0001234',
});

// results.pan.valid    → true
// results.mobile.valid → true
// results.gstin.meta.state → 'Maharashtra'
```

### Browser usage

```html
<script src="https://cdn.jsdelivr.net/gh/Gorupa/india-validators/india-validators.js"></script>
<script>
    const r = IndiaValidators.pan('ABCDE1234F');
    console.log(r.valid, r.message);
</script>
```

---

## Return format

All validators return a consistent object:

```js
{
    valid:   true | false,
    message: 'Human readable message',
    meta:    { /* optional extra info */ }
}
```

---

## File Structure

```
india-validators/
├── india-validators.js    ← the library
├── demo/
│   └── index.html         ← live demo
├── package.json
├── README.md
└── LICENSE
```

---

## Contributing

PRs welcome. Ideas for v0.2:
- [ ] Voter ID format validation
- [ ] DL (Driving Licence) format validation
- [ ] CIN (Company Identification Number)
- [ ] TAN (Tax Deduction Account Number)
- [ ] Bank account number format checks
- [ ] TypeScript definitions (.d.ts)

---

## Legal note

This library only validates format and checksum — the same information printed on the document itself. It does not connect to UIDAI, NSDL, GSTN, or any government system. No data is sent anywhere. The developer is responsible for ensuring compliance with applicable laws when collecting and processing sensitive identifiers.

---

## License

[MIT](LICENSE) © 2026 [gorupa](https://github.com/gorupa)
