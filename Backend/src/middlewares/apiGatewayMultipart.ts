import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { HttpException } from '@/exceptions/HttpException';
import { Readable } from 'stream';
import Busboy from 'busboy';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

interface MultipartRequest extends Request {
  rawBody?: Buffer;
  files?: Express.Multer.File[];
  isApiGateway?: boolean;
  isBase64Encoded?: boolean;
  apiGatewayEvent?: any;
}

interface ApiGatewayFile {
  filename: string;
  contentType: string;
  content: Buffer;
  fieldname: string;
}

// Type guard for ApiGatewayFile
function isApiGatewayFile(file: any): file is ApiGatewayFile {
  return file && 
         typeof file.filename === 'string' &&
         typeof file.contentType === 'string' &&
         Buffer.isBuffer(file.content) &&
         typeof file.fieldname === 'string';
}

// Extract boundary from content-type header
function extractBoundary(contentType: string): string | null {
  const match = contentType.match(/boundary=([^;]+)/i);
  if (!match) return null;
  
  // Remove quotes if present
  let boundary = match[1];
  if (boundary.startsWith('"') && boundary.endsWith('"')) {
    boundary = boundary.slice(1, -1);
  }
  
  return boundary;
}

// Comprehensive API Gateway detection
function isApiGatewayRequest(req: Request): boolean {
  const indicators = [
    req.headers['x-apigateway-event'],
    req.headers['x-apigateway-context'],
    req.headers['x-amzn-trace-id'],
    req.headers['x-forwarded-for'],
    req.headers['x-forwarded-proto'] === 'https',
    req.headers['via']?.includes('CloudFront'),
    req.headers['user-agent']?.includes('Amazon CloudFront'),
    (req as any).apiGateway,
    (req as any).requestContext,
    (req as any).isBase64Encoded !== undefined
  ];

  return indicators.some(indicator => !!indicator);
}

// Try multiple methods to get the raw body
async function extractRawBody(req: MultipartRequest): Promise<Buffer> {
  console.log('=== Extracting Raw Body ===');
  
  // Method 1: Check for API Gateway event in request object
  if ((req as any).apiGateway?.event?.body) {
    const event = (req as any).apiGateway.event;
    console.log('Method 1: Found API Gateway event');
    console.log('Event isBase64Encoded:', event.isBase64Encoded);
    
    req.apiGatewayEvent = event;
    req.isBase64Encoded = event.isBase64Encoded;
    
    if (event.isBase64Encoded) {
      const decoded = Buffer.from(event.body, 'base64');
      console.log('Decoded from API Gateway event:', decoded.length, 'bytes');
      return decoded;
    } else {
      return Buffer.from(event.body, 'utf8');
    }
  }

  // Method 2: Check for event in headers
  if (req.headers['x-apigateway-event']) {
    console.log('Method 2: Found event in headers');
    try {
      const event = JSON.parse(req.headers['x-apigateway-event'] as string);
      req.apiGatewayEvent = event;
      req.isBase64Encoded = event.isBase64Encoded;
      
      if (event.body) {
        if (event.isBase64Encoded) {
          const decoded = Buffer.from(event.body, 'base64');
          console.log('Decoded from header event:', decoded.length, 'bytes');
          return decoded;
        } else {
          return Buffer.from(event.body, 'utf8');
        }
      }
    } catch (error) {
      console.warn('Failed to parse event from headers:', error.message);
    }
  }

  // Method 3: Check for existing rawBody
  if (req.rawBody) {
    console.log('Method 3: Using existing rawBody:', req.rawBody.length, 'bytes');
    return req.rawBody;
  }

  // Method 4: Try to read from stream
  if (req.readable && !req.readableEnded) {
    console.log('Method 4: Reading from stream');
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Stream reading timeout'));
      }, 30000);

      req.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      req.on('end', () => {
        clearTimeout(timeout);
        const body = Buffer.concat(chunks);
        console.log('Stream read complete:', body.length, 'bytes');
        resolve(body);
      });

      req.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // Method 5: Process existing req.body
  if (req.body !== undefined) {
    console.log('Method 5: Processing existing body');
    console.log('Body type:', typeof req.body);
    console.log('Body length/size:', typeof req.body === 'string' ? req.body.length : JSON.stringify(req.body).length);
    
    if (typeof req.body === 'string') {
      // For API Gateway, try to detect base64 encoding
      const body = req.body;
      
      // Check multiple base64 indicators
      const couldBeBase64 = 
        body.length > 0 &&
        body.length % 4 === 0 && // Base64 strings are always divisible by 4
        /^[A-Za-z0-9+/]*={0,2}$/.test(body) && // Valid base64 characters
        !body.includes('\n') && // Raw multipart usually has newlines
        !body.includes('--'); // Raw multipart usually has boundaries
      
      if (couldBeBase64) {
        console.log('Attempting base64 decode...');
        try {
          const decoded = Buffer.from(body, 'base64');
          const preview = decoded.subarray(0, 50).toString('ascii');
          
          // Check if decoded content looks like multipart
          if (preview.includes('--') && preview.includes('Content-')) {
            console.log('Base64 decode successful, multipart detected');
            req.isBase64Encoded = true;
            return decoded;
          } else {
            console.log('Base64 decoded but not multipart, using as UTF-8');
          }
        } catch (error) {
          console.log('Base64 decode failed:', error.message);
        }
      }
      
      // Use as UTF-8 string
      console.log('Using body as UTF-8 string');
      return Buffer.from(body, 'utf8');
    } else if (Buffer.isBuffer(req.body)) {
      console.log('Using buffer body');
      return req.body;
    } else {
      console.log('Converting object to JSON');
      return Buffer.from(JSON.stringify(req.body), 'utf8');
    }
  }

  throw new Error('No body data found in request');
}

// Repair multipart data if possible
function repairMultipartData(body: Buffer, boundary: string): Buffer {
  console.log('=== Attempting to Repair Multipart Data ===');
  
  const bodyStr = body.toString('binary');
  const expectedBoundary = `--${boundary}`;
  
  console.log('Original boundary:', boundary);
  console.log('Expected boundary:', expectedBoundary);
  console.log('Body starts with:', bodyStr.substring(0, 100));
  
  // Check if boundary exists anywhere in the body
  if (!bodyStr.includes(boundary)) {
    console.log('Boundary not found in body at all');
    return body; // Can't repair
  }
  
  // Check if it starts with the boundary
  if (!bodyStr.startsWith(expectedBoundary)) {
    console.log('Body does not start with expected boundary');
    
    // Try to find where the boundary starts
    const boundaryIndex = bodyStr.indexOf(expectedBoundary);
    if (boundaryIndex > 0) {
      console.log('Found boundary at position:', boundaryIndex);
      const repaired = body.subarray(boundaryIndex);
      console.log('Repaired by trimming', boundaryIndex, 'bytes from start');
      return repaired;
    }
    
    // Try without the -- prefix
    const altBoundaryIndex = bodyStr.indexOf(boundary);
    if (altBoundaryIndex >= 0) {
      console.log('Found boundary without -- at position:', altBoundaryIndex);
      const beforeBoundary = bodyStr.substring(0, altBoundaryIndex);
      const afterBoundary = bodyStr.substring(altBoundaryIndex);
      const repaired = Buffer.from(`--${afterBoundary}`, 'binary');
      console.log('Repaired by adding -- prefix');
      return repaired;
    }
  }
  
  return body; // Return as-is if no repair needed/possible
}

// Parse multipart with multiple fallback strategies
async function parseMultipartWithFallbacks(
  originalBody: Buffer, 
  contentType: string
): Promise<{ fields: Record<string, string>, files: ApiGatewayFile[] }> {
  
  const boundary = extractBoundary(contentType);
  if (!boundary) {
    throw new Error('No boundary found in Content-Type header');
  }
  
  console.log('=== Multipart Parsing with Fallbacks ===');
  console.log('Boundary:', boundary);
  console.log('Original body length:', originalBody.length);
  
  // Strategy 1: Try parsing as-is
  try {
    console.log('Strategy 1: Parsing original body');
    return await parseWithBusboy(originalBody, contentType);
  } catch (error) {
    console.log('Strategy 1 failed:', error.message);
  }
  
  // Strategy 2: Try repairing the multipart data
  try {
    console.log('Strategy 2: Attempting repair');
    const repairedBody = repairMultipartData(originalBody, boundary);
    if (repairedBody !== originalBody) {
      return await parseWithBusboy(repairedBody, contentType);
    }
  } catch (error) {
    console.log('Strategy 2 failed:', error.message);
  }
  
  // Strategy 3: Try different encoding interpretations
  try {
    console.log('Strategy 3: Trying different encodings');
    
    // Maybe it's double-encoded?
    const bodyStr = originalBody.toString('utf8');
    if (bodyStr.includes('--') && bodyStr.includes('Content-')) {
      console.log('Trying UTF-8 interpretation');
      const utf8Body = Buffer.from(bodyStr, 'utf8');
      return await parseWithBusboy(utf8Body, contentType);
    }
    
    // Maybe it's latin1?
    const latin1Body = Buffer.from(originalBody.toString('latin1'), 'latin1');
    return await parseWithBusboy(latin1Body, contentType);
  } catch (error) {
    console.log('Strategy 3 failed:', error.message);
  }
  
  // Strategy 4: Manual boundary detection and reconstruction
  try {
    console.log('Strategy 4: Manual reconstruction');
    const bodyStr = originalBody.toString('binary');
    
    // Find all boundary occurrences
    const boundaryPositions = [];
    let pos = 0;
    while ((pos = bodyStr.indexOf(boundary, pos)) !== -1) {
      boundaryPositions.push(pos);
      pos += boundary.length;
    }
    
    if (boundaryPositions.length > 0) {
      console.log('Found boundaries at positions:', boundaryPositions);
      
      // Reconstruct with proper boundary prefixes
      let reconstructed = '';
      for (let i = 0; i < boundaryPositions.length; i++) {
        const start = boundaryPositions[i];
        const end = boundaryPositions[i + 1] || bodyStr.length;
        const part = bodyStr.substring(start, end);
        
        if (i === 0) {
          reconstructed += '--' + part;
        } else {
          reconstructed += '\r\n--' + part;
        }
      }
      
      // Add final boundary
      if (!reconstructed.endsWith(`--${boundary}--`)) {
        reconstructed += `\r\n--${boundary}--\r\n`;
      }
      
      const reconstructedBody = Buffer.from(reconstructed, 'binary');
      console.log('Reconstructed body length:', reconstructedBody.length);
      
      return await parseWithBusboy(reconstructedBody, contentType);
    }
  } catch (error) {
    console.log('Strategy 4 failed:', error.message);
  }
  
  throw new Error('All multipart parsing strategies failed');
}

// Original busboy parser with timeout
async function parseWithBusboy(body: Buffer, contentType: string): Promise<{
  fields: Record<string, string>,
  files: ApiGatewayFile[]
}> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: { 'content-type': contentType },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 20,
        fields: 200
      }
    });

    const fields: Record<string, string> = {};
    const files: ApiGatewayFile[] = [];
    let finished = false;

    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error('Busboy parsing timeout'));
      }
    }, 30000);

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const chunks: Buffer[] = [];

      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        files.push({
          fieldname,
          filename: filename || 'unknown',
          contentType: mimeType || 'application/octet-stream',
          content: Buffer.concat(chunks)
        });
      });
    });

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });

    busboy.on('finish', () => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        resolve({ fields, files });
      }
    });

    busboy.on('error', (error) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        reject(error);
      }
    });

    try {
      busboy.end(body);
    } catch (error) {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        reject(error);
      }
    }
  });
}

export const apiGatewayMultipartMiddleware = async (
  req: MultipartRequest,
  res: Response,
  next: NextFunction
) => {
  const contentType = req.headers['content-type'] || '';
  
  if (!contentType.startsWith('multipart/form-data')) {
    return next();
  }

  console.log('=== API Gateway Multipart Middleware Start ===');
  console.log('Content-Type:', contentType);
  console.log('Content-Length:', req.headers['content-length']);
  
  const isApiGateway = isApiGatewayRequest(req);
  console.log('Is API Gateway request:', isApiGateway);

  if (!isApiGateway) {
    console.log('Not API Gateway, proceeding normally');
    return next();
  }

  try {
    req.isApiGateway = true;

    // Extract raw body using multiple methods
    const rawBody = await extractRawBody(req);
    req.rawBody = rawBody;

    console.log('Raw body extracted:', {
      length: rawBody.length,
      isBase64Encoded: req.isBase64Encoded,
      preview: rawBody.subarray(0, 100).toString('ascii').replace(/[\r\n]/g, '\\n')
    });

    // Parse with fallback strategies
    const { fields, files } = await parseMultipartWithFallbacks(rawBody, contentType);

    console.log('Parsing successful:', {
      fieldsCount: Object.keys(fields).length,
      filesCount: files.length,
      fieldNames: Object.keys(fields),
      fileDetails: files.map(f => ({ name: f.filename, size: f.content.length }))
    });

    // Process files
    if (files.length > 0) {
      const uploadDir = 'leaves/';
      await mkdirAsync(uploadDir, { recursive: true }).catch(err => {
        if (err.code !== 'EEXIST') throw err;
      });

      req.files = await Promise.all(
        files.filter(isApiGatewayFile).map(async (file, index) => {
          const ext = path.extname(file.filename) || '.bin';
          const uniqueName = `${file.fieldname}-${Date.now()}-${index}${ext}`;
          const filePath = path.join(uploadDir, uniqueName);

          await writeFileAsync(filePath, file.content);

          // Verify file was written correctly
          const stats = await fs.promises.stat(filePath);
          console.log(`File ${index + 1} written:`, {
            original: file.filename,
            saved: uniqueName,
            size: stats.size,
            contentType: file.contentType
          });

          const fileStream = new Readable();
          fileStream.push(file.content);
          fileStream.push(null);

          return {
            fieldname: file.fieldname,
            originalname: file.filename,
            encoding: '7bit',
            mimetype: file.contentType,
            destination: uploadDir,
            filename: uniqueName,
            path: filePath,
            size: file.content.length,
            buffer: file.content,
            stream: fileStream
          };
        })
      );
    } else {
      req.files = [];
    }

    // Merge fields
    req.body = { ...req.body, ...fields };

    console.log('=== Middleware Complete ===');
    next();

  } catch (error) {
    console.error('=== Middleware Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // Provide detailed error information
    const errorDetails = {
      message: error.message,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      hasRawBody: !!req.rawBody,
      rawBodyLength: req.rawBody?.length,
      isBase64Encoded: req.isBase64Encoded,
      apiGatewayEvent: !!req.apiGatewayEvent
    };
    
    console.error('Error details:', errorDetails);
    next(new HttpException(400, `Multipart upload failed: ${error.message}`));
  }
};