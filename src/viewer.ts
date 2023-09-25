import { DiscordEmbed } from './app';

/**
 * Builds HTML for Discord. Yes I know this function is kind of disgusting.
 */
export const buildHtml = (url: string, type: string, embed?: DiscordEmbed) =>
	`
<!DOCTYPE HTML>
<html>
	<!-- cheek Discord viewer page -->
	<head>
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
</html>
`;
