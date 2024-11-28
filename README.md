![NPM Version](https://img.shields.io/npm/v/sqon-parser)
![Downloads](https://img.shields.io/npm/dt/sqon-parser)
![License](https://img.shields.io/npm/l/sqon-parser)

# SQON: Structured Queue Object Notation

**SQON** (Structured Queue Object Notation) is a structured data format that combines schema definitions, validation rules, and records. It ensures data consistency with strict mode, enforcing type restrictions and validation rules.

---

## Table of Contents

- [Overview](#overview)
- [SQON File Structure](#sqon-file-structure)
- [Strict Mode](#strict-mode)
- [Schema Section](#schema-section)
- [Validation Section](#validation-section)
- [Records Section](#records-section)
- [Key Features of SQON](#key-features-of-sqon)
- [Example Usage](#example-usage)
  - [SQON Validation Example](#sqon-validation-example)
- [Advantages of SQON Format](#advantages-of-sqon-format)

[Check logs to know what's new in the new version](https://www.npmjs.com/package/sqon-parser?activeTab=code)

---

## <a id="overview"></a> Overview

<details>
  <summary><strong>Overview</strong></summary>
  <p>**SQON** is a structured data format that combines schema definitions, validation rules, and records. It supports strict mode, which ensures data consistency by enforcing type restrictions and validation rules.</p>
</details>

---

## <a id="sqon-file-structure"></a> SQON File Structure

<details>
  <summary><strong>File Structure</strong></summary>
  <p>A SQON file includes:</p>
  <ul>
    <li><strong>Strict Mode Setting</strong> (`STRICT=TRUE/FALSE`)</li>
    <li><strong>Schema Definition</strong> (`@schema`)</li>
    <li><strong>Validation Rules</strong> (`@validations`)</li>
    <li><strong>Records</strong> (`@records`)</li>
  </ul>
  <p>Each section is marked by specific tags (`@schema`, `@validations`, and `@records`) and closed with `@end`.</p>
</details>

---

## <a id="strict-mode"></a> 1. **Strict Mode (`*STRICT=TRUE/FALSE`)**

<details>
  <summary><strong>Strict Mode</strong></summary>
  <p>The strict mode setting, located at the top of the file, controls whether records must strictly adhere to the schema and validation rules.</p>
  <ul>
    <li><strong>STRICT=TRUE</strong>: Enforces a strict schema where each field must match the exact data type.</li>
    <li><strong>STRICT=FALSE</strong>: Allows more flexibility with fields that can have multiple types.</li>
  </ul>

  <h4>Example with Strict Mode Enabled</h4>
  <pre><code>STRICT=TRUE</code></pre>
</details>

---

## <a id="schema-section"></a> 2. **Schema Section (`@schema`)**

<details>
  <summary><strong>Schema Section</strong></summary>
  <p>The schema section defines the fields and their data types. When `STRICT=TRUE`, fields must have a single, precise data type. With `STRICT=FALSE`, fields can accept multiple types (e.g., `String | Number`).</p>
  
  <h4>Example Schema (Strict Mode Enabled)</h4>
  <pre><code>
@schema
username -> String
age -> Number
createdDate -> Date
preferences -> Object
tags -> StringArray
@end
  </code></pre>
</details>

---

## <a id="validation-section"></a> 3. **Validation Section (`@validations`)**

<details>
  <summary><strong>Validation Section</strong></summary>
  <p>The validation section specifies rules for each field to ensure data integrity. These rules might include constraints like `required`, `minLength`, or `isDate`.</p>
  
  <h4>Example Validations</h4>
  <pre><code>
@validations
username -> required=true; minLength=3
age -> required=true; min=18; max=120
createdDate -> isDate=true
tags -> minLength=1; maxLength=10
@end
  </code></pre>
</details>

---

## <a id="records-section"></a> 4. **Records Section (`@records`)**

<details>
  <summary><strong>Records Section</strong></summary>
  <p>The records section contains actual data entries. Each record is prefixed with a unique document number (`#0`, `#1`, etc.). These entries represent real data and follow the schema and validation rules.</p>
  
  <h4>Example Records</h4>
  <pre><code>
@records
#0 -> username("JohnDoe"); age(30); createdDate(1993-07-16T00:00:00Z); preferences{ theme: "dark" }; tags[ _0("friend"); _1("coworker") ];
#1 -> username("JaneSmith"); age(25); createdDate(1998-04-22T00:00:00Z); preferences{}; tags[ _0("family") ];
@end
  </code></pre>
</details>

---

## <a id="key-features-of-sqon"></a> Key Features of SQON

<details>
  <summary><strong>Key Features</strong></summary>
  <p>**Document Numbers**: Each record is identified by a unique document number (`#0`, `#1`, `#2`), which allows for easy reference, error tracking, and quick lookup.</p>
  <p>**Indexed Arrays**: Arrays are indexed with unique keys (e.g., `_0`, `_1`), which provides clarity and structure for managing array elements.</p>
</details>

---

## <a id="example-usage"></a> Example Usage

<details>
  <summary><strong>Example Usage</strong></summary>
  <p>You can find usage examples in the `example` folder of the installed package. See:</p>
  <ul>
    <li><a href="example/test.js">example/test.js</a></li>
    <li><a href="example/test.sqon">example/test.sqon</a></li>
  </ul>
</details>

---

## <a id="sqon-validation-example"></a> Example Usage for SQON Validation

<details>
  <summary><strong>SQON Validation Example</strong></summary>
  <p>This example demonstrates:</p>
  <ul>
    <li>How to define nested schemas for objects and arrays.</li>
    <li>How to apply validation rules to nested schemas.</li>
    <li>Use all types (`String`, `Number`, `Date`, `Boolean`, `StringArray`, `Object`, `ObjectArray`).</li>
  </ul>

  <h4>Example Code</h4>
  <pre><code>
import { Validator, ValidateParams, ValidationResult, SchemaDefinition, ValidationRules } from './Validator';

// Example Schema Definition
const schema: Record<string, SchemaDefinition> = {
  username: { type: ['String'] },
  age: { type: ['Number'] },
  birthdate: { type: ['Date'] },
  isVerified: { type: ['Boolean'] },
  friends: { type: ['StringArray'] },
  preferences: { type: ['Object'], properties: { theme: { type: ['String'] }, notifications: { type: ['Boolean'] } } },
  activities: { type: ['ObjectArray'], items: { type: ['Object'], properties: { activityName: { type: ['String'] }, duration: { type: ['Number'] } } } }
};

// Example Validation Rules
const validations: Record<string, ValidationRules> = { 
  username: { rules: { required: true, minLength: 3 } },
  age: { rules: { required: true, min: 18, max: 120 } },
  birthdate: { rules: { isDate: true } },
  isVerified: { rules: { required: true } },
  friends: { rules: { minLength: 1, maxLength: 5 } },
  preferences: { rules: { maxLength: 10, required: true }, theme: { rules: { required: true, minLength: 3 } }, notifications: { rules: { required: true } } },
  activities: { rules: { minLength: 1, maxLength: 10, required: true, isUnique: true }, activityName: { rules: { required: true, minLength: 3 } }, duration: { rules: { required: true, min: 1 } } }
};

const data = {
  username: "Alice",
  age: 30,
  birthdate: "1993-05-20T00:00:00Z",
  isVerified: true,
  friends: ["Bob", "Charlie"],
  preferences: { theme: "dark", notifications: true },
  activities: [{ activityName: "Running", duration: 60 }, { activityName: "Swimming", duration: 45 }]
};

async function validateSQONEntry({ schema, validateData, data, strict = true }: ValidateParams): Promise<ValidationResult> {
  const validator = new Validator();
  return await validator.validate({ schema, validateData, data, strict });
}

validateSQONEntry({ schema

, validateData: validations, data, strict: true }).then(result => {
  if (result.valid) {
    console.log("Data is valid.");
  } else {
    console.log("Validation failed:", result.errors);
  }
});
  </code></pre>
</details>

---

## <a id="advantages-of-sqon-format"></a> Advantages of SQON Format

<details>
  <summary><strong>Advantages of SQON Format</strong></summary>
  <ul>
    <li><strong>Human-Readable Structure</strong>: SQON’s layout is easy to read, write, and understand for humans.</li>
    <li><strong>Flexible Schema Definitions</strong>: Allows multiple data types per field, providing flexibility for complex data structures.</li>
    <li><strong>Integrated Validation</strong>: Validation rules ensure data integrity and consistency within the SQON file.</li>
    <li><strong>Indexed Arrays</strong>: The `_number` notation for arrays adds clarity and structure, making it easy to manage array elements.</li>
    <li><strong>Document Numbers</strong>: Sequential document numbering allows easy tracking, reference, and query handling for records.</li>
  </ul>
  <p>This format is useful in applications where structured data with flexible types, validation, and indexed array elements are needed. SQON enhances both readability and data management, making it a powerful choice for structured, validated data storage.</p>
</details>
