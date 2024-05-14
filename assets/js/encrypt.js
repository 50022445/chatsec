import { E2EE } from "e2ee.js";

// Create a new E2EE object
const user  = new E2EE();
await user.generateKeyPair();