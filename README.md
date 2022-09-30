# Helix Assets / Assets Across Adobe

> Search UI for Assets Across Adobe prototype

### Project Links
* [Assets Across Adobe wiki](https://wiki.corp.adobe.com/display/AdobeDesign/Assets+Across+Adobe)
* [Project Board](https://github.com/orgs/adobe/projects/22)
* Git repos
  * Search UI https://github.com/adobe/helix-assets-ui
  * Ingestion service https://github.com/adobe/helix-asset-ingestor
  * Crawler CLI https://github.com/adobe/helix-asset-scan-cli


## Customer Environments

These require a password (read only algolia api token).

- Adobe https://adobe.hlx.media (public, no login)
- Testcustomer https://testcustomer.hlx.media
- BestBuy https://bestbuy.hlx.media
- Disney https://disney.hlx.media

### How to add a new customer

1. Create branch from `main` named `<customer>_hlx_media`
2. This should automatically create `https://<customer>.hlx.media`
3. On the `<customer>_hlx_media` branch adjust the [scripts/scripts.js](scripts/scripts.js) for naming and branding
   * `window.tenantTitle`
   * `window.tenantLogo`
4. Login to [Algolia](https://www.algolia.com/apps/SWFXY1CU7X), app `SWFXY1CU7X`
5. Create a new index `<customer>_assets`, copy settings from `<adobe>_assets`
6. Under Configure > Query Suggestions create a new suggestion index `<customer>_assets_query_suggestions` using `<customer>_assets` as source index
7. Go to Settings > API Keys to manage Algolia api keys
8. Add new search only key / password for search site
   * Description: `Search only key for "<customer>"`
   * Indices: `<customer_assets` and `<customer>_assets_query_suggestions`
   * ACL: `search`
9. Create a new write key or reuse existing
   * Description: `Ingestion key for "<customer>"`
   * Indices: `<customer_assets` and `<customer>_assets_query_suggestions`
   * ACL: `search, addObject, deleteObject, browse`
10. Scan/crawl/index content using the write key
    ```
    export SCAN_CUSTOMER=<customer>
    export SCAN_INDEX_API_KEY=<write-key>

    scan <cmd> ...
    ```

## Development Environments

- Main: https://main--helix-assets-ui--adobe.hlx3.page
- Branch: `https://<branch>--helix-assets-ui--adobe.hlx3.page`

To select a custom tenant set the `tenant` query parameter:

```
https://main--helix-assets-ui--adobe.hlx3.page/?tenant=<customer>
```

To logout, go to Browser Developer Console > Storage or Application > Local Storage and find & delete the `algoliaApiKey` key. Then reload the page.

## Local development

1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
2. Run `npm install`
3. Start Helix Pages Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
4. Open the `{repo}` directory in your favorite IDE and start coding :)
