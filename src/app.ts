import { Hono, Context } from 'hono';

/**
 * Bindings introduced for Hono v3.0.0
 */
type Bindings = {
	/**
	 * Static asset fetcher for Pages
	 */
	ASSETS: Fetcher;

	/**
	 * R2 Bucket for storing files
	 */
	cheekstore: R2Bucket;

	/**
	 * Cloudflare KV for storing credentials
	 */
	cheekkv: KVNamespace;
}

/**
 * Create a new Hono app
 */
const app = new Hono<{ Bindings: Bindings }>();

export default app;
