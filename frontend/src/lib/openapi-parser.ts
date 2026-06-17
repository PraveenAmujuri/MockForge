import jsYaml from 'js-yaml';

export interface ParsedEndpoint {
  name: string;
  path: string;
  method: string;
  responseJson: any;
  statusCode: number;
  delayMs: number;
}

export function parseOpenApi(content: string): ParsedEndpoint[] {
  let doc: any;
  
  // 1. Try parsing JSON
  try {
    doc = JSON.parse(content);
  } catch (jsonErr) {
    // 2. Try parsing YAML
    try {
      doc = jsYaml.load(content);
    } catch (yamlErr) {
      throw new Error('Invalid format: File is neither valid JSON nor valid YAML');
    }
  }

  if (!doc || typeof doc !== 'object') {
    throw new Error('Invalid OpenAPI document: Root must be an object');
  }

  const paths = doc.paths;
  if (!paths || typeof paths !== 'object') {
    throw new Error('Invalid OpenAPI document: Missing "paths" object');
  }

  const endpoints: ParsedEndpoint[] = [];
  const validMethods = ['get', 'post', 'put', 'delete', 'patch'];

  for (const [routePath, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!validMethods.includes(method.toLowerCase())) continue;
      if (!operation || typeof operation !== 'object') continue;

      const methodUpper = method.toUpperCase();
      const op = operation as any;
      
      // Determine a descriptive name
      const name = op.summary || op.operationId || `${methodUpper} ${routePath}`;

      // Determine status code (default to 201 for POST, 200 otherwise)
      let statusCode = methodUpper === 'POST' ? 201 : 200;
      let responseJson: any = { message: 'Imported mock response' };

      if (op.responses && typeof op.responses === 'object') {
        // Find the first successful response code (e.g. 200, 201, 202)
        const successCode = Object.keys(op.responses).find(
          (code) => code.startsWith('2')
        );

        if (successCode) {
          statusCode = Number(successCode) || statusCode;
          const responseObj = op.responses[successCode];

          // Try to extract example JSON payload
          if (responseObj && typeof responseObj === 'object') {
            // OpenAPI 3 structure: responses[code].content['application/json'].example
            if (responseObj.content && typeof responseObj.content === 'object') {
              const jsonContent = responseObj.content['application/json'];
              if (jsonContent && typeof jsonContent === 'object') {
                if (jsonContent.example !== undefined) {
                  responseJson = jsonContent.example;
                } else if (jsonContent.examples && typeof jsonContent.examples === 'object') {
                  const firstExampleName = Object.keys(jsonContent.examples)[0];
                  const ex = jsonContent.examples[firstExampleName];
                  if (ex && typeof ex === 'object' && ex.value !== undefined) {
                    responseJson = ex.value;
                  }
                } else if (jsonContent.schema && typeof jsonContent.schema === 'object') {
                  if (jsonContent.schema.example !== undefined) {
                    responseJson = jsonContent.schema.example;
                  } else if (jsonContent.schema.default !== undefined) {
                    responseJson = jsonContent.schema.default;
                  } else {
                    responseJson = generateExampleFromSchema(jsonContent.schema);
                  }
                }
              }
            }
            // Swagger 2.0 structure: responses[code].examples['application/json']
            else if (responseObj.examples && typeof responseObj.examples === 'object') {
              const jsonExample = responseObj.examples['application/json'];
              if (jsonExample !== undefined) {
                responseJson = jsonExample;
              }
            }
            // Swagger 2.0 schema example
            else if (responseObj.schema && typeof responseObj.schema === 'object') {
              if (responseObj.schema.example !== undefined) {
                responseJson = responseObj.schema.example;
              } else if (responseObj.schema.default !== undefined) {
                responseJson = responseObj.schema.default;
              } else {
                responseJson = generateExampleFromSchema(responseObj.schema);
              }
            }
          }
        }
      }

      endpoints.push({
        name,
        path: routePath,
        method: methodUpper,
        responseJson,
        statusCode,
        delayMs: 0
      });
    }
  }

  return endpoints;
}

function generateExampleFromSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return {};

  if (schema.type === 'object') {
    const obj: any = {};
    if (schema.properties && typeof schema.properties === 'object') {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propSchema && typeof propSchema === 'object') {
          const ps = propSchema as any;
          if (ps.example !== undefined) {
            obj[propName] = ps.example;
          } else if (ps.default !== undefined) {
            obj[propName] = ps.default;
          } else if (ps.type === 'string') {
            obj[propName] = 'string';
          } else if (ps.type === 'number' || ps.type === 'integer') {
            obj[propName] = 0;
          } else if (ps.type === 'boolean') {
            obj[propName] = false;
          } else if (ps.type === 'array') {
            obj[propName] = [];
          } else if (ps.type === 'object') {
            obj[propName] = {};
          } else {
            obj[propName] = null;
          }
        }
      }
    }
    return obj;
  }

  if (schema.type === 'array') {
    if (schema.items && typeof schema.items === 'object') {
      return [generateExampleFromSchema(schema.items)];
    }
    return [];
  }

  return { message: 'Imported mock response' };
}
