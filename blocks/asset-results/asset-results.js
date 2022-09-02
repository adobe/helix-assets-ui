import { createOptimizedPicture } from '../../scripts/scripts.js';

export default function decorate(block) {
  window.results = block;

  const counter = document.createElement('div');
  counter.className = 'asset-results-controls';
  block.appendChild(counter);

  const list = document.createElement('ol');
  block.appendChild(list);

  const masonry = document.createElement('div');
  const grid = document.createElement('div');

  const resultsView = window.localStorage.getItem('resultsView');
  if (resultsView === 'masonry') {
    masonry.className = 'asset-results-masonry';
    grid.className = 'asset-results-grid hidden';
  } else {
    masonry.className = 'asset-results-masonry hidden';
    grid.className = 'asset-results-grid';
  }

  block.appendChild(masonry);
  block.append(grid);

  let searchResults = {};
  let showOneUp;

  function handleOneupClick(e, element) {
    e.preventDefault();

    const assetID = element.dataset.assetid;
    const detailURL = new URL(window.location.href);
    detailURL.search = '';
    detailURL.searchParams.set('assetId', assetID);
    window.history.pushState({ inApp: true }, null, detailURL.href);

    showOneUp(searchResults[assetID], []);
  }

  class Masonry {
    constructor(listEl, masonryEl) {
      this.list = listEl;
      this.cols = [];
      this.masonry = masonryEl;
      window.addEventListener('resize', () => {
        this.update();
      });
    }

    setup(width) {
      const numCols = Math.floor(width / 400) + 1;
      if (numCols !== this.masonry.children.length) {
        this.masonry.textContent = '';
        this.cols = [];
        for (let i = 0; i < numCols; i += 1) {
          const col = document.createElement('div');
          col.className = 'asset-results-masonry-col';
          col.dataset.height = 0;
          this.masonry.append(col);
          this.cols.push(col);
        }
      }
    }

    update() {
      const findBestCol = () => {
        const minHeight = Math.min(...this.cols.map((e) => +e.dataset.height));
        return this.cols.find((e) => +e.dataset.height === minHeight);
      };

      this.setup(window.innerWidth);

      const items = [...this.list.children].slice(this.masonry.querySelectorAll('.asset-results-masonry-item').length);
      let add = true;
      items.forEach((result) => {
        const img = result.querySelector('img');
        if (img.complete && add) {
          // const item = result.cloneNode(true);
          const item = document.createElement('div');
          item.className = 'asset-results-masonry-item';
          item.innerHTML = result.innerHTML;

          item.querySelectorAll('a:first-child, .asset-results-caption a').forEach((el) => {
            el.addEventListener('click', (e) => handleOneupClick(e, el));
          });

          const col = findBestCol();
          col.dataset.height = +col.dataset.height + (img.height / img.width);
          col.append(item);
        } else {
          add = false;
          if (img.getAttribute('loading') !== 'eager') {
            img.setAttribute('loading', 'eager');
            img.addEventListener('load', () => { this.update(); });
            img.addEventListener('error', () => { this.update(); });
          }
        }
      });
    }
  }

  function humanSize(size) {
    if (!size) {
      return 'unknown';
    }
    let number = size;
    const thresh = 1000;
    if (Math.abs(size) < thresh) {
      return `${size}`;
    }
    const units = ['K', 'M', 'G'];
    let u = -1;
    const r = 10;
    do {
      number /= thresh;
      u += 1;
    } while (Math.round(Math.abs(number) * r) / r >= thresh && u < units.length - 1);
    return `${number.toFixed()} ${units[u]}`;
  }

  function getDisplayPath(href, source) {
    const brandportal = '/assetdetails.html/content/dam/mac/marketinghub/';
    const aem = '/assetdetails.html/content/dam';
    const url = new URL(href);
    let path = '';
    if (source === 'stock') {
      path = (`${href.substring(0, href.indexOf('?'))}?prev_url=detail`);
    } else if (source === 'aem') {
      path = url.pathname.substring(aem.length, url.pathname.lastIndexOf('/'));
    } else if (source === 'brandportal') {
      path = url.pathname.substring(brandportal.length, url.pathname.lastIndexOf('/'));
    } else {
      path = url.pathname.substring(0, url.pathname.lastIndexOf('/'));
    }
    return path;
  }

  function getDownloadFilename(asset) {
    const file = asset.alt || asset.caption || 'image';
    // get extension from Helix Mediabus URL: https://something.hlx3.page/media_1fffe97fc5519b7f542e5151a70c0a650e49119bd.png#width=319&width=191
    const ext = asset.image ? asset.image.split('#')[0].split('.').pop() : 'file';
    return `${file}.${ext}`;
  }

  function getDownloadURL(asset) {
    // use current origin to make downloads work well in browsers
    return `${window.location.origin}${new URL(asset.image).pathname}`;
  }

  const showResults = (results) => {
    searchResults = {};
    const datalist = document.getElementById('query-suggestions');
    if (results.facets && datalist) {
      Object.entries(results.facets)
        .filter(([facetName]) => facetName !== 'assetID')
        .forEach(([facetName, values]) => {
          Object.keys(values).slice(0, 5).forEach((value) => {
            const option = document.createElement('option');
            option.innerHTML = `${facetName}:${value}`;
            datalist.append(option);
          });
        });
    }
    counter.innerHTML = `<div class="asset-results-heading"><img src="/blocks/asset-results/filter.svg"><span class="asset-results-heading-text">Assets & Files (${results.nbHits})</span></div>
  <div class="asset-results-view-switcher ${resultsView === 'masonry' ? 'assets-results-view-grid' : 'assets-results-view-masonry'}">${resultsView === 'masonry' ? 'Grid View' : 'Masonry View'}</div>`;

    const filterbutton = counter.querySelector('.asset-results-heading>img');
    filterbutton.addEventListener('click', () => {
      block.parentElement.parentElement.classList.toggle('show-sidebar');
      const url = new URL(window.location.href);
      url.hash = block.parentElement.parentElement.classList.contains('show-sidebar') ? 'sidebar' : '';
      window.history.replaceState(null, null, url.href);
    });

    list.textContent = '';
    const switcher = block.querySelector('.asset-results-view-switcher');
    switcher.addEventListener('click', () => {
      if (switcher.classList.contains('assets-results-view-grid')) {
        switcher.classList.remove('assets-results-view-grid');
        switcher.classList.add('assets-results-view-masonry');
        window.localStorage.setItem('resultsView', 'grid');
        switcher.innerHTML = 'Masonry View';
      } else {
        switcher.classList.add('assets-results-view-grid');
        switcher.classList.remove('assets-results-view-masonry');
        window.localStorage.setItem('resultsView', 'masonry');
        switcher.innerHTML = 'Grid View';
      }
      grid.classList.toggle('hidden');
      masonry.classList.toggle('hidden');
    });

    results.hits.forEach((hit) => {
      searchResults[hit.assetID] = hit;

      const item = document.createElement('li');
      const topurl = new URL(hit.topurl || hit.sourceURL || hit.image);
      const imageURL = new URL(hit.image);
      const detailURL = new URL(window.location.href);
      detailURL.search = '';
      detailURL.searchParams.set('assetId', hit.assetID);

      imageURL.searchParams.set('width', 750);
      const description = hit.alt || hit.caption;
      const picture = createOptimizedPicture(imageURL.href, description, false, [{ width: '750' }]);
      const path = getDisplayPath(topurl.href, hit.sourceType);

      item.innerHTML = `
        <a href="${detailURL.href}" data-assetid="${hit.assetID}">${picture.outerHTML}</a>
        <div class="asset-results-details source-${hit.sourceType}">
          <p class="asset-results-caption"><a href="${detailURL.href}" data-assetid="${hit.assetID}">${description}</a></p>
          <!-- <p class="asset-results-source"><a href="${topurl.href}">${path}</a></p> -->
          <!-- <p class="asset-results-views">${humanSize(hit.views)}</p> -->
          <p class="asset-results-dimensions">${hit.height} x ${hit.width}</p>
          <p class="asset-results-tags"><span>${(hit.tags || []).join('</span> <span>')}</span></p>
        </div>
      `;
      list.appendChild(item);
    });
    list.querySelectorAll('li > a, .asset-results-caption a').forEach((el) => {
      el.addEventListener('click', (e) => handleOneupClick(e, el));
    });

    masonry.textContent = '';
    const m = new Masonry(list, masonry);
    m.update();

    grid.append(list);
  };

  showOneUp = async (asset, otherassets) => {
    const createInfo = (panelConfig) => {
      const panel = document.createElement('div');
      panelConfig.forEach((sectionConfig) => {
        const section = document.createElement('div');
        section.className = 'asset-results-oneup-section';
        const h3 = document.createElement('h3');
        h3.textContent = sectionConfig.title;
        section.append(h3);
        sectionConfig.infos
          .filter((infoConfig) => infoConfig.value)
          .forEach((infoConfig) => {
            const info = document.createElement('dl');
            info.innerHTML = `<dt>${infoConfig.title}</dt><dd>${infoConfig.value}</dd>`;
            if (infoConfig.alts && infoConfig.alts.length) {
              Array.from(new Set(infoConfig.alts))
                .filter((alt) => alt !== infoConfig.value)
                .forEach((alt) => {
                  const ddalt = document.createElement('dd');
                  ddalt.className = 'alt';
                  ddalt.innerHTML = alt;
                  info.append(ddalt);
                });
            }
            section.append(info);
          });
        panel.append(section);
      });
      return panel;
    };
    const modal = document.createElement('div');
    modal.classList.add('asset-results-oneup');
    modal.innerHTML = `<header>
      <div class="header block" data-block-name="header" data-block-status="loaded">
      <div class="header-brand">
        <a href="http://localhost:3000/?q=assetID%3A12e16e067b6259f02449f35a35c5b2f7505550167&amp;index=assets"><img src="/styles/adobe.svg"></a>
        Assets Across Adobe
      </div>
      <div class="header-filename"></div>
      <div class="header-button">
        <a download="${getDownloadFilename(asset)}" href="${getDownloadURL(asset)}" title="${asset.caption}"><button class="primary">Download</button></a>
        <button name='close' class="secondary">Done</button>
      </div>
    </div>
    </header>
    <div>
      <div class="asset-results-oneup-picture">
      </div>
      <div class="asset-results-oneup-info">
      </div>
      <div class="asset-results-oneup-more">
      </div>
    </div>`;
    const closeButton = modal.querySelector('.header-button button[name=close]');
    function closeOneup() {
      if (window.history.state && window.history.state.inApp) {
        // if we opened within the app, just close modal
        modal.remove();
        block.style.display = 'block';
        window.history.back();
      } else {
        // if the detail url was opened directly, we have to reload the page for the search view
        const baseURL = new URL(window.location.href);
        baseURL.search = '';
        window.location.href = baseURL.href;
      }
    }
    closeButton.addEventListener('click', () => {
      closeOneup();
    });

    // this needs a bit more refinement
    // document.body.addEventListener('keypress', (e) => {
    //   if (e.key === 'Escape') {
    //     closeOneup();
    //   }
    // });

    const pictureDiv = modal.querySelector('.asset-results-oneup-picture');
    const moreDiv = modal.querySelector('.asset-results-oneup-more');

    const assetDescription = asset.alt || asset.caption;
    const createdDate = asset.created ? new Date(asset.created).toLocaleDateString() : 'N/A';
    const modDate = asset.modified ? new Date(asset.modified).toLocaleDateString() : 'N/A';

    const displayNameMap = {
      rum: 'Website',
      stock: 'Stock',
      brandportal: 'Brand Portal',
      aem: 'AEM',
    };

    const infoConfig = [{
      title: 'Information',
      infos: [
        { title: 'File type', value: asset?.type.toUpperCase(), alts: otherassets.map((o) => o.type?.toUpperCase()) },
        { title: 'Description', value: assetDescription, alts: otherassets.map((o) => (o.alt || o.caption)) },
        { title: 'Created', value: createdDate },
        { title: 'Modified', value: modDate },
        { title: 'Size', value: '193MB' },
        { title: 'Width', value: `${asset.width}px`, alts: otherassets.map((o) => `${o.width}px`) },
        { title: 'Height', value: `${asset.height}px`, alts: otherassets.map((o) => `${o.height}px`) },
        { title: 'Usage rights', value: 'licensed' },
        { title: 'Source', value: displayNameMap[asset.sourceType] },
        { title: 'File name', value: 'Filename' },
        { title: 'Path', value: `<a href="${asset.sourceURL || asset.image}">${getDisplayPath((asset.sourceURL || asset.image), asset.sourceType)}</a>` },
        { title: 'Tags', value: `<span>${(asset.tags || []).join('</span> <span>')}</span>` },
      ],
    }];

    const infoDiv = modal.querySelector('.asset-results-oneup-info');
    const info = createInfo(infoConfig);
    infoDiv.append(info);

    otherassets.forEach((otherasset) => {
      const a = document.createElement('a');
      a.href = `#${otherasset.objectID}`;
      a.appendChild(createOptimizedPicture(otherasset.image));
      moreDiv.appendChild(a);
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const myasset = otherasset;
        const allotherassets = [asset, ...otherassets].filter((other) => other !== myasset);
        modal.remove();
        showOneUp(myasset, allotherassets);
      });
    });

    pictureDiv.appendChild(createOptimizedPicture(asset.image));
    block.parentElement.append(modal);
    block.style.display = 'none';

    const similarserviceurl = new URL('https://helix-pages.anywhere.run/helix-services/asset-ingestor@v1');
    similarserviceurl.searchParams.set('url', asset.image);

    try {
      const res = await fetch(similarserviceurl.href);
      const { hits } = await res.json();
      hits.forEach((otherasset) => {
        const a = document.createElement('a');
        const detailurl = new URL(window.location.href);
        detailurl.search = '';
        detailurl.searchParams.set('assetId', otherasset.assetID);
        a.href = detailurl.href;
        a.appendChild(createOptimizedPicture(otherasset.image));
        moreDiv.appendChild(a);
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Could not load similar images:', e);
    }
  };

  // this is an URL state change listener
  const search = () => {
    const myurl = new URL(window.location.href);

    const index = myurl.searchParams.get('index') || 'assets';
    const query = myurl.searchParams.get('q') || '';
    const terms = query.split(' ');
    const words = terms.filter((term) => !term.match(':')).join(' ');

    let filters;

    const assetId = myurl.searchParams.get('assetId');
    if (assetId) {
      filters = `assetID:${assetId}`;
    } else {
      filters = [
        ...(Array.from(myurl.searchParams.entries())
          .filter(([param]) => param.match(/f:(.*)-minimum/))
          .map(([param, value]) => `${param.replace(/f:(.*)-minimum/, '$1')}>${value}`)),
        ...(Array.from(myurl.searchParams.entries())
          .filter(([param]) => param.match(/f:(.*)-maximum/))
          .map(([param, value]) => `${param.replace(/f:(.*)-maximum/, '$1')}<${value}`)),
        ...(terms.filter((term) => term.match(':'))),
        ...myurl.searchParams.getAll('ff'),
      ]
        .map((t) => t.split(':').map((s) => (s.match(/ /) ? `"${s}"` : s)).join(':'))
        .join(' AND ');
    }

    const url = new URL(`https://SWFXY1CU7X-dsn.algolia.net/1/indexes/${index}`);
    url.searchParams.set('query', words);
    url.searchParams.set('x-algolia-api-key', 'bd35440a1d9feb709a052226f1aa70d8');
    url.searchParams.set('x-algolia-application-id', 'SWFXY1CU7X');
    // only one objectID per assetID
    // (search for "a person wearing sunglasses" for test)
    url.searchParams.set('distinct', !filters.match(/assetID:/));
    // set filters
    url.searchParams.set('filters', filters);
    url.searchParams.set('facets', '*');

    fetch(url.href).then(async (res) => {
      const json = await res.json();
      if (filters.includes('assetID:')) {
        showOneUp(json.hits[0], json.hits.slice(1));
      } else {
        showResults(json, 'masonry');
      }
      window.appState.set('facets', json.facets);
    });
  };

  window.addURLStateChangeListener(search);

  search();
}
