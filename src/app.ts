import { Hono, Context, Next } from 'hono';
import { nanoid } from 'nanoid';
import { buildHtml } from './discord';

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
 * Represents Discord Embed data
 */
export interface DiscordEmbed {
	title?: string;
	description?: string;
	author?: {
		name?: string;
		url?: string;
	}
	provider?: {
		name?: string;
		url?: string;
	}
	color?: string;
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
	embed?: DiscordEmbed;
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

// Static asset routes
app
	.get('/robots.txt', assets)
	.get('/ui.js', assets);

// Setup flow
app
	.get('/setup', assets)
	.post(async (ctx) => {

		// Check if KV already has credentials
		if (await ctx.env.cheekkv.get('credentials'))
			return ctx.text('Setup already complete');

		// Parse body
		const { UPLOAD_TOKEN } = await ctx.req.json();

		// Check if values are valid (at least 16 characters)
		if (!UPLOAD_TOKEN || UPLOAD_TOKEN.length < 16)
			return ctx.text('Please enter a valid Upload Token (at least 16 characters)');

		// Save values to KV
		const kv = ctx.env.cheekkv;
		await kv.put('credentials', UPLOAD_TOKEN);

		// Setup complete
		return ctx.text('Setup complete');
	});

// Upload route
app.post('/upload', bindingReadyMiddleware, async (ctx) => {

	// Get Authorization header & credentials for comparison
	const auth = ctx.req.header('Authorization');
	const credentials = await ctx.env.cheekkv.get('credentials');

	// Check if credentials are valid
	if (!auth || auth !== credentials) return ctx.text('Invalid credentials', 401);

	// Parse body
	const { image } = await ctx.req.parseBody();

	// Check if image is present
	if (image instanceof File) {

		// Get binary data buffer
		const buffer = await image.arrayBuffer();

		// Recursive ID generation
		const generateID = async (): Promise<string> => {
			const id = nanoid(8);
			const existing = await ctx.env.cheekkv.get(id);
			return (existing) ? generateID() : id;
		};

		// Generate image metadata
		const metadata: Image = {
			id: await generateID(),
			hash: await sha256(buffer),
			filename: image.name,
			type: image.type,
			time: Date.now()
		};

		// Extract embed data from Headers (if present)
		const embed = ctx.req.header('x-cheek-title') === '' ? undefined : {
			title: ctx.req.header('x-cheek-title'),
			description: ctx.req.header('x-cheek-description') || undefined,
			author: {
				name: ctx.req.header('x-cheek-author-name') || undefined,
				url: ctx.req.header('x-cheek-author-url') || undefined
			},
			provider: {
				name: ctx.req.header('x-cheek-provider-name') || undefined,
				url: ctx.req.header('x-cheek-provider-url') || undefined
			},
			color: ctx.req.header('x-cheek-color') || undefined
		};

		// Add embed data to metadata
		if (embed) metadata.embed = embed;

		// Save metadata to KV
		await ctx.env.cheekkv.put(metadata.id, JSON.stringify(metadata));

		// Save image to R2 Bucket
		await ctx.env.cheekstore.put(metadata.hash, buffer);

		// get the domain
		const domain = ctx.req.header('Host') || 'localhost';

		// get secure protocol
		const protocol = ctx.req.header('X-Forwarded-Proto') || 'http';

		// Return image URL
		const url = `${protocol}://${domain}/${metadata.id}`;
		console.log(url);
		return ctx.text(url);
	} else return ctx.text('Please provide an image', 400);
});

// Image route
app.get('/:id', bindingReadyMiddleware, async (ctx) => {

	// Check if image exists
	const kv = ctx.env.cheekkv;
	const metadata = JSON.parse(await kv.get(ctx.req.param('id').split('.')[0])) as Image;
	if (!metadata) return ctx.text('Image not found', 404);

	// Fetch image from R2 Bucket
	const cheek = ctx.env.cheekstore;
	const file = await cheek.get(metadata.hash);

	// Check if using Discord
	if (metadata.embed?.title && ctx.req.header('User-Agent').toLocaleLowerCase().includes('discord') && ctx.req.query('direct') !== 'true')
		return ctx.html(buildHtml(ctx.req.url.concat('?direct=true'), metadata.type, metadata.embed));

	// Set content headers
	ctx.res.headers.set('Content-Disposition', `inline; filename="${metadata.filename}"`);
	ctx.res.headers.set('Content-Type', metadata.type);

	// Set cache headers
	ctx.res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	ctx.res.headers.set('ETag', metadata.hash);
	ctx.res.headers.set('Last-Modified', new Date(metadata.time).toUTCString());

	// Return image
	return ctx.body(file.body);
});

// Index
app.get('/', bindingReadyMiddleware, assets);

export default app;
