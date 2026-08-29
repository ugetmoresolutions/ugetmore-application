// Add this BEFORE the API Gateway multipart middleware
export const rawBodyCollector = (req: any, res: any, next: any) => {
  if (req.headers['content-type']?.startsWith('multipart/form-data')) {
    console.log('Raw body collector activated');
    
    let body: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      body.push(chunk);
    });
    
    req.on('end', () => {
      req.rawBody = Buffer.concat(body);
      console.log('Raw body collected:', req.rawBody.length, 'bytes');
      next();
    });
    
    req.on('error', (err: Error) => {
      console.error('Raw body collection error:', err);
      next(err);
    });
  } else {
    next();
  }
};