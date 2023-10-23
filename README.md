<div align="center">

😝 cheek
===

*ass cheek. a serverless ShareX server.*

</div>


# What??

**cheek** is similar to my other project, [ass](https://github.com/tycrek/ass). The biggest difference is that cheek is runs on Cloudflare's **serverless platform**, where ass uses traditional hosting with Node.js.

# Roadmap

- [x] Upload (supports ShareX currently)
- [x] Fetch/view image
- [x] Embed features for Discord
- [ ] Delete image
- [ ] Multi-user

# Usage

You will be deploying to Cloudflare [Pages]. Before you begin, make sure you have setup:

| Bind type | Bind name |
| :-------: | --------- |
| [KV] | `cheekkv` |
| [R2] | `cheekstore` |

[Pages]: https://pages.cloudflare.com/
[KV]: https://www.cloudflare.com/en-ca/developer-platform/workers-kv/
[R2]: https://www.cloudflare.com/en-ca/developer-platform/r2/

Run these commands to deploy:

```bash
git clone https://github.com/tycrek/cheek.git
cd cheek
npm i
npm run publish
```

Navigate to your deployment domain to view the setup page. Enter a token that you will use for uploading.

## Uploads

*Docs WIP*

## Discord Embeds

Discord embeds can be configured by setting the following HTTP Headers. **Title** is required for embeds to work.

- **`x-cheek-title`**
- `x-cheek-description`
- `x-cheek-author-name`
- `x-cheek-author-url`
- `x-cheek-provider-name`
- `x-cheek-provider-url`
- `x-cheek-color`

#### These docs are a work-in-progress
