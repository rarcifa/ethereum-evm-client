import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'js',
      sourcemap: true,
      exports: 'auto' 
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json', 
      outputToFilesystem: true 
    }),
  ],
  external: ['axios', 'tslib', 'winston']
};
