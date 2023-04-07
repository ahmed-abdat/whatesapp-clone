import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import dotenv from 'dotenv';
dotenv.config();

// Other Vite configuration code goes here


// Other configuration code goes here

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
