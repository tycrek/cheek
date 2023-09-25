import { DiscordEmbed } from './app';

export const buildHtml = (url: string, type: string, embed?: DiscordEmbed) =>
	`
<!DOCTYPE HTML>
<html>
	<head>
		<meta name="viewport" content="width=device-width; height=device-height;">
		<title>${url}</title>
		<style>
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
		${embed && embed.title ?
		`<meta property="og:title" content="${embed.title}">` : ''}
		${embed && embed.description ?
		`<meta property="og:description" content="${embed.description}">` : ''}
		${embed && embed.color ?
		`<meta name="theme-color" content="${embed.color}">` : ''}
		${embed && !type.includes('video') ?
		`<meta name="twitter:card" content="summary_large_image">` : ''}
	</head>
	<body>
		<img src="${url}" alt="${url}"></img>
	</body>
</html>
`;
