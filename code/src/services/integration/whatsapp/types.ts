export interface WhatsappMessage {
    to: string;
    text: string;
  }
  
  export interface WhatsappResponse {
    status: 'SENT' | 'FAILED';
    errorMessage?: string;
  }