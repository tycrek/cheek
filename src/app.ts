import { Hono, Context } from 'hono';

/**
 * Bindings introduced for Hono v3.0.0
 */
type Bindings = {
}

/**
 * Create a new Hono app
 */
const app = new Hono<{ Bindings: Bindings }>();

export default app;
