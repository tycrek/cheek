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
 * Represents Image metadata which is stored in KV
 */
interface Image {
	id: string;
	hash: string;
	filename: string;
	type: string;
	time: number;
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
 * Hono middleware for checking if bindings are ready
 */
const bindingReadyMiddleware = (ctx: Context<{ Bindings: Bindings }>, next: Next) =>
	isBindingReady(ctx)
		.then(async (bindingsReady) => {
			if (!bindingsReady) return ctx.redirect('/setup');

			// Check if KV has credentials
			const credentials = await ctx.env.cheekkv.get('credentials');
			if (!credentials) return ctx.redirect('/setup');

			return next();
		})
		.catch((err) => ctx.text(err.message, 500));

/**
 * Generate SHA256 hash from ArrayBuffer
 */
const sha256 = (image: ArrayBuffer): Promise<string> => new Promise((resolve, reject) =>
	crypto.subtle.digest('SHA-256', image)
		.then((hash) => resolve(Array
			.from(new Uint8Array(hash))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('')))
		.catch(reject));

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

// Index
app.get('/', (ctx) => isBindingReady(ctx)
	.then(async (bindingsReady) => {
		if (!bindingsReady) return ctx.redirect('/setup');

		// Check if KV has credentials
		const kv = ctx.env.cheekkv;
		const credentials = await kv.get('credentials');
		if (!credentials) return ctx.redirect('/setup');

		return assets(ctx);
	})
	.catch((err) => ctx.text(err.message, 500)));

// Index
app.get('/', bindingReadyMiddleware, assets);

export default app;
