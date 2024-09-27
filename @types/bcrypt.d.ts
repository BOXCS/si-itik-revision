declare module 'bcrypt' {
    export function hash(data: string, saltOrRounds: string | number): Promise<string>;
    export function compare(data: string, encrypted: string): Promise<boolean>;
    export function genSalt(rounds?: number, minor?: string): Promise<string>;
    // Add more function declarations as needed
  }
  