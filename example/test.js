const SQON = require('sqon-parser');  // Assuming sqon-parser being installed

// Parse a .nuv file with sections for schema and validations
const parser1 = new SQON({ filePath: './test.nuv', sections: "schema" });
parser1.parse()
    .then(parserResult => {
        console.log("Parsed Result (test1):");
        console.log(JSON.stringify(parserResult, null, 2));

        // Expected output (example):
        /*
        {
          "fileRules": {},
          "schema": {
            ....
          },
          "validations": {},
          "records": [],
          "errors": []
        }
        */
    })
    .catch(error => {
        console.error("Error during parsing:", error);
    });

// Parse the full .nuv file with schema, validations, records, and metadata
const parser2 = new SQON({ filePath: './test.nuv' });
parser2.parse()
    .then(parserResult => {
        console.log("Parsed Result (test2):");
        console.log(JSON.stringify(parserResult, null, 2));

        // Expected output (example with metadata and errors):
        /*
        {
          "fileRules": {
            "strict": false
          },
          "schema": {
          ......
          },
          "validations": {
           .......
          },
          "records": [
          ......
          ],
          "errors": [],
          "metadata": {
           ......
        }
        */
    })
    .catch(error => {
        console.error("Error during parsing:", error);
    });
