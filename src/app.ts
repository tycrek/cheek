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

/**
 * Check if bindings are ready
 */
const isBindingReady = (ctx: Context<{ Bindings: Bindings }>): Promise<boolean> => new Promise((resolve, reject) => {
	try {

		// Check cheek
		const cheek = ctx.env.cheekstore;
		if (!cheek) throw new Error('R2 Bucket not found. Register one under the ID `cheekstore`');

		// Check kv
		const kv = ctx.env.cheekkv;
		if (!kv) throw new Error('Cloudflare KV not found. Register one under the ID `cheekkv`');

		resolve(true);
	} catch (err) {
		reject(err);
	}
});

/**
 * Quick-method to fetch static assets
 */
const assets = (ctx: Context) => (ctx.env.ASSETS as Fetcher).fetch(ctx.req.raw);

// Static asset routes(robots.txt, ui.js)
app
	.get('/robots.txt', assets)
	.get('/ui.js', assets);

// Setup flow
app
	.get('/setup', assets)
	.post((ctx) => ctx.text('Not implemented'));

export default app;
