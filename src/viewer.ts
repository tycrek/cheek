import { DiscordEmbed } from './app';

/**
 * Builds HTML for Discord. Yes I know this function is kind of disgusting.
 */
export const buildHtml = (url: string, type: string, embed?: DiscordEmbed) =>
	`
<!DOCTYPE HTML>
<html>
	<head>
		<!-- cheek Discord viewer page -->

		<meta name="viewport" content="width=device-width; height=device-height;">
		<title>${url}</title>
		<style>
			/* CSS "borrowed" from Firefox image viewer */
			body {
				margin: 0;
				background-color: #222;
			}
			img {
				display: block;
				image-orientation: from-image;
				text-align: center;
				position: absolute;
				inset: 0;
				margin: auto;
			}
		</style>

		${ /* Title */ embed && embed.title ?
		`<meta property="og:title" content="${embed.title}">` : ''}

		${ /* Description */ embed && embed.description ?
		`<meta property="og:description" content="${embed.description}">` : ''}

		${ /* Colour */ embed && embed.color ?
		`<meta name="theme-color" content="${embed.color}">` : ''}

		${ /* Non-video gets Twitter Card Large */ embed && !type.includes('video') ?
		`<meta name="twitter:card" content="summary_large_image">` : ''}

		${ /* Resource type */ embed ?
		`<meta name="og:type" content="${type.includes('video') ? 'video.other' : type.includes('image') ? 'image' : 'website'}">` : ''}

		${ /* Resource URL */ embed ?
		`<meta name="og:${type.includes('video') ? 'video' : 'image'}" content="${url}">` : ''}
	</head>
	<body>
		<img src="${url}" alt="Discord viewer for resource: ${url}"></img>
	</body>
</html>
`;
