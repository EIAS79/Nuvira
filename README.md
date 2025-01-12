![NPM Version](https://img.shields.io/npm/v/nuvira-parser)  
![Downloads](https://img.shields.io/npm/dt/nuvira-parser)  
![License](https://img.shields.io/npm/l/nuvira-parser)

# Nuvira

**Nuvira** is a structured data format that combines schema definitions, validation rules, records, and relationships. It provides a way to define complex data relationships and structures while ensuring data integrity through validation and strict mode enforcement.

---

## Table of Contents

- [Overview](#overview)
- [Nuvira File Structure](#nuvira-file-structure)
- [File Rules](#file-rules)
- [Schema Section](#schema-section)
- [Relations Section](#relations-section)
- [Validation Section](#validation-section)
- [Records Section](#records-section)
- [Key Features of Nuvira](#key-features-of-nuvira)
- [Example Usage](#example-usage)
  - [Nuvira Validation Example](#nuvira-validation-example)
- [Advantages of Nuvira Format](#advantages-of-nuvira-format)

---

## <a id="overview"></a> Overview

<details>
  <summary><strong>Overview</strong></summary>
  <p><strong>Nuvira</strong> is a structured data format that combines schema definitions, validation rules, records, and relationships. It supports strict mode, which ensures data consistency by enforcing type restrictions and validation rules. The format is designed to make it easier to define complex data structures and their interrelationships while maintaining data integrity.</p>
</details>

---

## <a id="nuvira-file-structure"></a> Nuvira File Structure

<details>
  <summary><strong>File Structure</strong></summary>
  <p><strong>A Nuvira</strong> file consists of several key sections, each serving a specific purpose to ensure data consistency, validation, and relationships between records. The structure includes:</p>
  <ul>
    <li><strong>File Rules</strong> (`STRICT`, `SIZE`, `TYPE`, `LOCKED`): Specifies the rules governing the behavior of the file and its schema:
      <ul>
        <li><strong>STRICT</strong>: Controls the strictness of data adherence to the schema structure (e.g., `STRICT=TRUE` for strict compliance).</li>
        <li><strong>SIZE</strong>: Defines the maximum number of records allowed in the file (e.g., `SIZE=100`).</li>
        <li><strong>TYPE</strong>: Specifies the schema type, such as `ROOT`, `NODE`, `LEAF`, etc. (e.g., `TYPE=NODE`).</li>
        <li><strong>LOCKED</strong>: Defines whether the schema is locked for modification (e.g., `LOCKED=TRUE`).</li>
      </ul>
    </li>
    <li><strong>Schema Definition</strong> (`@schema`): Defines the structure of the data, specifying fields, data types, and relationships between them. The schema can also include nested structures and arrays.</li>
    <li><strong>Relations Definition</strong> (`@relations`): Defines the relationships between different schemas, such as one-to-one, one-to-many, and many-to-many, along with behaviors on delete, update, and create operations.</li>
    <li><strong>Validation Rules</strong> (`@validations`): Specifies the validation rules for each field, including constraints like `required`, `minLength`, `maxLength`, `isDate`, `isUnique`, and more, to ensure data integrity.</li>
    <li><strong>Records</strong> (`@records`): Contains the actual data entries, following the schema and validation rules defined earlier. The records section is where the main dataset is stored.</li>
  </ul>
  <p>Each section in the Nuvira file is marked by specific tags (`@schema`, `@relations`, `@validations`, `@records`) and is closed with `@end`. The structure ensures that the data is well-organized, validated, and linked according to the rules defined in the schema and relations sections.</p>
</details>

---

## <a id="file-rules"></a> File Rules (`*STRICT`, `*SIZE`, `*TYPE`, `*LOCKED`)

<details>
  <summary><strong>File Rules Explanation</strong></summary>
  <p>The <strong>File Rules</strong> section at the top of the Nuvira file configures how data is validated, structured, and whether schema modifications are allowed. This section includes the following parameters:</p>

<ul>
  <li><strong>*STRICT</strong>: Controls the strictness of the data.  
    <ul>
      <li><strong>TRUE</strong>: Data must strictly follow the schema structure, types, and order.</li>
      <li><strong>FALSE</strong>: Data can have more flexibility in types and order.</li>
    </ul>
    Example:  
    <code>*STRICT=FALSE</code>
  </li>

  <li><strong>*SIZE</strong>: Defines the number of records allowed in the file. This sets the maximum document count within the records section.  
    Example:  
    <code>*SIZE=100</code>
  </li>

  <li><strong>*TYPE</strong>: Specifies the schema type for the dataset. Valid values are:
    <ul>
      <li><strong>ROOT</strong>: The top-most schema.</li>
      <li><strong>NODE</strong>: A mid-level schema that can connect other schemas.</li>
      <li><strong>LEAF</strong>: A terminal schema with no children.</li>
      <li><strong>ISOLATED</strong>: A schema that doesn’t connect with any other schema.</li>
      <li><strong>REFERENCE</strong>: A schema that points to other data, but doesn’t hold it.</li>
    </ul>
    Example:  
    <code>*TYPE=NODE</code>
  </li>

  <li><strong>*LOCKED</strong>: When <strong>TRUE</strong>, the file is locked and cannot be modified. When <strong>FALSE</strong>, the file is open for changes.  
    Example:  
    <code>*LOCKED=TRUE</code>
  </li>
</ul>


  <p>These rules are defined at the top of the Nuvira file and help configure how data will be handled, validated, and structured.</p>
</details>

---

## <a id="schema-section"></a> 2. **Schema Section (`@schema`)**

<details>
  <summary><strong>Schema Section</strong></summary>
  <p>The schema section defines the fields and their data types. Each schema is named and can include complex structures such as objects and arrays. A schema is defined using the `@schema` directive followed by the schema name.</p>
  
  <h4>Allowed Types for Schema Fields</h4>
  The following data types can be used in a schema field definition:

  - **Number**: Represents numerical values.
  - **String**: Represents textual data.
  - **Binary**: Represents binary data.
  - **Date**: Represents date values.
  - **Boolean**: Represents true/false values.
  - **Uint8Array**: Represents an array of unsigned 8-bit integers.
  - **Object**: Represents an object with key-value pairs.
  - **Any[]**: Represents an array of any type of data.
  - **StringArray**: Represents an array of strings.
  - **String[]**: Another way to define an array of strings.
  - **ObjectArray**: Represents an array of objects.
  - **NumberArray**: Represents an array of numbers.
  - **Number[]**: Another way to define an array of numbers.
  - **Null**: Represents a null value (used when a field can be null).
  - **undefined**: Represents an undefined value (used when a field can be undefined).
  - **Array**: A general array type.
  - **[]**: Another way to define an array (equivalent to `Array`).
  - **Any**: Represents any data type (used when the field type is flexible).
  - **AnyArray**: Represents an array of any data type.
  
  <h4>Example Schema Definition</h4>
  <pre><code>
@schema: Users-Info
Users -> Object[] {
    name -> String
    age -> Number
    friends -> StringArray | Null | undefined
    isStudent -> Boolean
    image -> Binary
    birthDate -> Date | Number
    nationality -> Object {
        countries -> String[]
        city -> String | Null
        postcode -> String | undefined
    }
}
@end
  </code></pre>
  <p>In this example, the schema `Users-Info` defines an array of `Object[]` with various field types. Nested structures are included, such as an `Object` for the `nationality` field. Additionally, it demonstrates how to specify optional (`Null`, `undefined`) or multiple valid types for a field, like `birthDate` which can be either `Date` or `Number`.</p>
</details>

---

## <a id="relations-section"></a> 3. **Relations Section (`@relations`)**

<details>
  <summary><strong>Relations Section</strong></summary>
  <p>The relations section defines relationships between different schemas. You can specify one-to-one, one-to-many, or many-to-many relationships. Additionally, you can define the behavior on delete, update, and other operations such as cascading, restricting, or setting defaults.</p>
  
  <h4>Valid Relation Types</h4>
  The following valid relation types and behaviors can be used in the relations section:

  <table>
    <thead>
      <tr>
        <th>Metadata Field</th>
        <th>Valid Values</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>type</strong></td>
        <td>one-to-one, one-to-many, many-to-one, many-to-many</td>
        <td>Specifies the type of relationship between two schemas. For example, "one-to-one" means one instance of the source schema is related to exactly one instance of the target schema.</td>
      </tr>
      <tr>
        <td><strong>onDelete</strong></td>
        <td>cascade, restrict, set-null, no-action</td>
        <td>Defines the behavior when a record is deleted in the source schema. Options include:
          <ul>
            <li><strong>cascade</strong>: Automatically deletes related records in the target schema.</li>
            <li><strong>restrict</strong>: Prevents the deletion of the record in the source schema if there are related records in the target schema.</li>
            <li><strong>set-null</strong>: Sets related records in the target schema to null when the source record is deleted.</li>
            <li><strong>no-action</strong>: No action is performed on the target schema when a record in the source schema is deleted.</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td><strong>onUpdate</strong></td>
        <td>cascade, restrict, set-null, no-action</td>
        <td>Defines the behavior when a record is updated in the source schema. Similar to <code>onDelete</code>, options include cascading, restricting, setting to null, or doing nothing.</td>
      </tr>
      <tr>
        <td><strong>onCreate</strong></td>
        <td>set-default, restrict, no-action</td>
        <td>Defines what happens when a new record is created in the target schema. Options include setting default values, restricting creation, or taking no action.</td>
      </tr>
      <tr>
        <td><strong>unique</strong></td>
        <td>true, false</td>
        <td>Indicates whether the relation should be unique. If set to <code>true</code>, the related field must be unique in the target schema.</td>
      </tr>
      <tr>
        <td><strong>nullable</strong></td>
        <td>true, false</td>
        <td>Indicates whether the related field can be null. If set to <code>true</code>, the relation allows null values.</td>
      </tr>
      <tr>
        <td><strong>index</strong></td>
        <td>true, false</td>
        <td>Specifies whether the relation should be indexed for faster lookup.</td>
      </tr>
      <tr>
        <td><strong>cascade</strong></td>
        <td>true, false</td>
        <td>Indicates whether cascading behavior is applied to the relation.</td>
      </tr>
      <tr>
        <td><strong>reverse</strong></td>
        <td>true, false</td>
        <td>Specifies if the reverse of the relation should be created. For example, if a one-to-many relation is defined, the reverse relation will be a "many-to-one".</td>
      </tr>
      <tr>
        <td><strong>uniqueConstraint</strong></td>
        <td>true, false</td>
        <td>Indicates whether a unique constraint should be enforced on the relation.</td>
      </tr>
    </tbody>
  </table>

  <h4>Example Relations</h4>
  <pre><code>
@relations
Employee(Salary) -> Users(name) {
    type = "one-to-many";
    onDelete = "cascade";
    onUpdate = "restrict";
}

Company(age) -> Users(age) {
    type = "one-to-one";
    onDelete = "cascade";
    onUpdate = "restrict";
}
@end
  </code></pre>
  <p>In this example:</p>
  <ul>
    <li>The relation between `Employee` and `Users` is one-to-many, meaning one employee can have many associated users. Deleting an employee will cascade and delete the related user records, but updates to the employee record will be restricted if there are related users.</li>
    <li>The relation between `Company` and `Users` is one-to-one, meaning each company is linked to a single user. Deleting a company will cascade and delete the related user, and updates to the company record are restricted if there is a related user.</li>
  </ul>
</details>

---

## <a id="validation-section"></a> 4. **Validation Section (`@validations`)**

<details>
  <summary><strong>Validation Section</strong></summary>
  <p>The validation section specifies rules for each field to ensure data integrity. These rules can include constraints like `required`, `minLength`, `isDate`, `maxLength`, `isUnique`, and more. Validation rules are set on schema fields to ensure the data conforms to the expected structure and values.</p>

  <h4>Valid Validation Keywords</h4>
  The following validation keywords can be used, with the respective valid types for each rule:

  <table>
    <thead>
      <tr>
        <th>Validation Keyword</th>
        <th>Description</th>
        <th>Valid Types</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>minLength</strong></td>
        <td>Specifies the minimum length of a string, array, or object.</td>
        <td>String, StringArray, String[], ObjectArray, Object[], Array, Any[], [], Object, NumberArray, Number[], Uint8Array</td>
      </tr>
      <tr>
        <td><strong>maxLength</strong></td>
        <td>Specifies the maximum length of a string, array, or object.</td>
        <td>String, StringArray, String[], ObjectArray, Object[], Array, Any[], [], Object, NumberArray, Number[], Uint8Array</td>
      </tr>
      <tr>
        <td><strong>isDate</strong></td>
        <td>Ensures the field value is a valid date.</td>
        <td>Date, StringArray, String[], NumberArray, Number[]</td>
      </tr>
      <tr>
        <td><strong>minDate</strong></td>
        <td>Specifies the minimum date allowed.</td>
        <td>Date, StringArray, String[], NumberArray, Number[]</td>
      </tr>
      <tr>
        <td><strong>maxDate</strong></td>
        <td>Specifies the maximum date allowed.</td>
        <td>Date, StringArray, String[], NumberArray, Number[]</td>
      </tr>
      <tr>
        <td><strong>isBoolean</strong></td>
        <td>Ensures the field value is a boolean.</td>
        <td>Boolean, Array, Any[], []</td>
      </tr>
      <tr>
        <td><strong>hasProperties</strong></td>
        <td>Ensures the object has specified properties.</td>
        <td>Object, ObjectArray, Object[]</td>
      </tr>
      <tr>
        <td><strong>enum</strong></td>
        <td>Ensures the field value is one of the specified values.</td>
        <td>Any</td>
      </tr>
      <tr>
        <td><strong>notNull</strong></td>
        <td>Ensures the field is not null.</td>
        <td>Any</td>
      </tr>
      <tr>
        <td><strong>pattern</strong></td>
        <td>Ensures the field matches a specified pattern (usually a regex).</td>
        <td>Any</td>
      </tr>
      <tr>
        <td><strong>isUnique</strong></td>
        <td>Ensures the field values are unique within the dataset.</td>
        <td>Any</td>
      </tr>
      <tr>
        <td><strong>required</strong></td>
        <td>Ensures the field is required and cannot be empty.</td>
        <td>Any</td>
      </tr>
      <tr>
        <td><strong>isNull</strong></td>
        <td>Ensures the field value is null.</td>
        <td>Any</td>
      </tr>
      <tr>
        <td><strong>min</strong></td>
        <td>Specifies the minimum numeric value.</td>
        <td>Number, NumberArray, Number[], Uint8Array</td>
      </tr>
      <tr>
        <td><strong>max</strong></td>
        <td>Specifies the maximum numeric value.</td>
        <td>Number, NumberArray, Number[], Uint8Array</td>
      </tr>
      <tr>
        <td><strong>isPositive</strong></td>
        <td>Ensures the field value is positive.</td>
        <td>Number, NumberArray, Number[], Uint8Array</td>
      </tr>
      <tr>
        <td><strong>isNegative</strong></td>
        <td>Ensures the field value is negative.</td>
        <td>Number, NumberArray, Number[], Uint8Array</td>
      </tr>
      <tr>
        <td><strong>isNumeric</strong></td>
        <td>Ensures the field value is numeric.</td>
        <td>NumberArray, Number[], Number</td>
      </tr>
      <tr>
        <td><strong>isInteger</strong></td>
        <td>Ensures the field value is an integer.</td>
        <td>Number, NumberArray, Number[]</td>
      </tr>
      <tr>
        <td><strong>isFloat</strong></td>
        <td>Ensures the field value is a float.</td>
        <td>Number, NumberArray, Number[]</td>
      </tr>
      <tr>
        <td><strong>isEmail</strong></td>
        <td>Ensures the field value is a valid email address.</td>
        <td>String, StringArray, String[]</td>
      </tr>
      <tr>
        <td><strong>isURL</strong></td>
        <td>Ensures the field value is a valid URL.</td>
        <td>String, String[], StringArray</td>
      </tr>
      <tr>
        <td><strong>isAlpha</strong></td>
        <td>Ensures the field value contains only alphabetic characters.</td>
        <td>String, String[], StringArray</td>
      </tr>
      <tr>
        <td><strong>isAlphanumeric</strong></td>
        <td>Ensures the field value contains only alphanumeric characters.</td>
        <td>String, String[], StringArray</td>
      </tr>
      <tr>
        <td><strong>isIP</strong></td>
        <td>Ensures the field value is a valid IP address.</td>
        <td>String, String[], StringArray</td>
      </tr>
      <tr>
        <td><strong>trim</strong></td>
        <td>Ensures the field value is trimmed of whitespace.</td>
        <td>String, String[], StringArray</td>
      </tr>
      <tr>
        <td><strong>lowercase</strong></td>
        <td>Ensures the field value is converted to lowercase.</td>
        <td>String, String[], StringArray</td>
      </tr>
      <tr>
        <td><strong>uppercase</strong></td>
        <td>Ensures the field value is converted to uppercase.</td>
        <td>String, String[], StringArray</td>
      </tr>
    </tbody>
  </table>

  <h4>Example Validations</h4>
  <pre><code>
@validations
Users -> required=true; maxLength=50; isUnique=true
Users.name -> required=true; minLength=3; uppercase=true
@end
  </code></pre>
  <p>In this example, the `Users` field is required, must have a maximum length of 50 characters, and must contain unique values. Additionally, the `name` field under `Users` is required, must have a minimum length of 3, and must be converted to uppercase.</p>
</details>

---

## <a id="records-section"></a> 5. **Records Section (`@records`)**

<details>
  <summary><strong>Records Section</strong></summary>
  <p>The records section contains actual data entries. Each record is prefixed with a unique document number (`#0`, `#1`, etc.). These entries represent real data and follow the schema and validation rules.</p>
  
  <h4>Example Records</h4>
  <pre><code>
@records
#0 -> Users[
    _0{ 
      name("Elias"); age(20); friends[ _0("Marco"); _1("Kmosha"); _2("Abdullah"); ];
      iSstudent(TRUE); image(<Buffer 23 32 43 56 ..>); birthDate(05/04/2004);
      nationality{ countries[ _0("Egypt"); _1("Poland"); ]; city(NULL); postcode(); };
    };
];
#1 -> Users[....];
@end
  </code></pre>
</details>

---

## <a id="example-usage"></a> Example Usage

<details>
  <summary><strong>Example Usage</strong></summary>
  <p>You can find usage examples in the `example` folder of the installed package. See:</p>
  <ul>
    <li><a href="example/test.js">example/test.js</a></li>
    <li><a href="example/test.nuv">example/test.nuv</a></li>
  </ul>
</details>

---

## <a id="nuvira-validation-example"></a> Example Usage for Nuvira Validation

<details>
  <summary><strong>Nuvira Validation Example</strong></summary>
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
  activities: { type: ['ObjectArray'], items: {

 type: ['String'] } }
};

// Example Validation Rule
const validation: Record<string, ValidationRules> = {
  username: { required: true, minLength: 3, maxLength: 20, isUnique: true },
  age: { required: true, min: 18, max: 99 },
  birthdate: { required: true, isDate: true },
  isVerified: { required: true },
  friends: { minLength: 1 },
  preferences: { required: true }
};

// Example Validation Request
const params: ValidateParams = {
  username: "JohnDoe",
  age: 30,
  birthdate: new Date(),
  isVerified: true,
  friends: ["Jane", "Doe"],
  preferences: { theme: "dark", notifications: true }
};

const validationResult: ValidationResult = Validator.validate(schema, validation, params);

if (validationResult.isValid) {
  console.log("Validation passed.");
} else {
  console.error("Validation failed.");
}
  </code></pre>
</details>

---

## <a id="key-features-of-nuvira"></a> Key Features of Nuvira

<details>
  <summary><strong>Key Features</strong></summary>

- **Document Numbers**:  
  Each record is identified by a unique document number (`#0`, `#1`, `#2`, etc.). These document numbers are essential for referencing specific records, ensuring easy tracking, error resolution, and quick lookups. This helps organize large datasets and allows for efficient querying and validation.

- **Indexed Arrays**:  
  Arrays in Nuvira are indexed with unique keys like `_0`, `_1`, `_2`, etc. This provides clarity and structure for managing array elements and ensures consistency when accessing or modifying individual elements. It is particularly useful for data where elements are ordered and need to be referenced directly.

- **Strict Mode**:  
  The **strict mode** (`*STRICT=TRUE`) ensures that the data strictly follows the schema structure, types, and the order of elements. When strict mode is enabled, any deviation from the schema, such as missing fields, wrong data types, or extra fields, will lead to validation errors. In **non-strict mode** (`*STRICT=FALSE`), the format allows for more flexible data input and can accommodate deviations from the strict schema, giving you more freedom when working with the data.

- **Schema Definition Flexibility**:  
  The Nuvira format supports various schema types—**ROOT**, **NODE**, **LEAF**, **ISOLATED**, and **REFERENCE**—giving users flexibility to define complex relationships between data fields and structure. This ensures that your data models can range from simple flat structures to deeply nested or interconnected schemas.

- **Validation Rules**:  
  Validation is a built-in feature in Nuvira, ensuring that data adheres to predefined rules. Rules can be applied to fields, specifying things like `required`, `minLength`, `maxLength`, `isDate`, `unique`, and more. This allows for automatic validation during data insertion or modification, ensuring that the data stays consistent and valid.

- **File Integrity**:  
  The **File Rules** (`*STRICT`, `*SIZE`, `*TYPE`, `*LOCKED`) at the top of the Nuvira file define global settings for how the data is structured and validated. These settings also specify whether the schema is locked or can be modified, and how strict the validation should be across the entire file.

- **Nested and Complex Data Types**:  
  Nuvira allows for the definition of complex data types like **Objects**, **Arrays**, and even **Arrays of Objects**, allowing for multi-level data modeling. It’s possible to nest objects within objects, as well as create arrays of multiple types, making it suitable for complex, real-world data structures.

- **Human-Readable Format**:  
  The Nuvira file format is designed to be easily readable by humans, with clear definitions and a structured, organized layout. This makes it simple to write, debug, and maintain, even for non-programmers or users unfamiliar with the technical details.

- **Document Locking**:  
  The **`*LOCKED`** setting in the file rules allows you to lock file, preventing any further modifications. This feature ensures that once a file is finalized, it cannot be changed, maintaining data integrity over time.

- **Support for Relationships**:  
  Nuvira supports complex relationships between different schemas. With the **@relations** section, you can define one-to-one, one-to-many, or many-to-many relationships between schemas, as well as actions to be taken on delete or update (e.g., cascading or restricting).

These features ensure that Nuvira is a highly flexible, robust, and efficient data format for managing structured, validated data, making it ideal for use in applications where data integrity, flexibility, and complex relationships are important.
</details>

---

## <a id="advantages-of-nuvira-format"></a> Advantages of Nuvira Format

<details>
  <summary><strong>Advantages</strong></summary>
  <ul>
    <li><strong>Enforces Data Integrity:</strong> Nuvira ensures that your data adheres strictly to predefined schemas, preventing inconsistencies and errors through robust validation rules.</li>
    <li><strong>Supports Complex Data Structures and Relationships:</strong> With support for arrays, nested objects, and various data types, Nuvira can model intricate relationships between different entities in your data.</li>
    <li><strong>Flexible Validation and Strict Mode:</strong> Customize validation settings to match your project's requirements. Whether you need strict data structure adherence or more flexibility, Nuvira allows you to choose the right balance for your needs.</li>
    <li><strong>Easy Integration with JavaScript (Node.js) Environments:</strong> Nuvira is optimized for seamless integration with Node.js and other JavaScript frameworks, ensuring quick setup and easy use in modern web and backend applications.</li>
    <li><strong>Improved Performance:</strong> Nuvira’s lightweight format ensures fast processing speeds, even when working with large datasets or complex schema structures.</li>
    <li><strong>Enhanced Security and Data Consistency:</strong> By leveraging strong validation mechanisms, Nuvira helps secure data by preventing the introduction of invalid or harmful data.</li>
  </ul>
</details>

---
