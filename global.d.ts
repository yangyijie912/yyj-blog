// Allow importing css/scss files (global side-effect imports)
declare module '*.css';
declare module '*.scss';

// More specific typings for CSS Modules to get class name autocompletion and safer imports
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Fallback typings for bcryptjs under TS moduleResolution "bundler"
declare module 'bcryptjs' {
  export function compareSync(data: string, encrypted: string): boolean;
  export function genSaltSync(rounds?: number): string;
  export function hashSync(data: string, saltOrRounds?: string | number): string;
}
