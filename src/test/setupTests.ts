import '@testing-library/jest-dom'; // Extends expect with jest-dom matchers
import dotenv from 'dotenv';

// Load environment variables from .env.test file
dotenv.config({ path: '.env.development' });
