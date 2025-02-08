declare module 'pdf-parse' {
  function PDFParse(dataBuffer: Buffer): Promise<{
    text: string;
    numpages: number;
    info: any;
  }>;
  export default PDFParse;
} 