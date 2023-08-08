import { Image } from './app';

const genHTML = (metadata: Image, URL: string) => {
    console.log(URL);
    return(
    `
    <!DOCTYPE HTML>
    <html>
    <head>
    <meta property="og:title" content="${metadata.embed?.title}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${metadata.embed?.provider.url}" />
    <meta property="og:description" content="${metadata.embed?.description}" />
    <meta property="og:image" content="${URL}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="${metadata.embed?.color}" />
    </head>
    </html>
    `
    )
}

export default genHTML