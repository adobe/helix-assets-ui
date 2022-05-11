import { createOptimizedPicture } from '../../scripts/scripts.js';

export default function decorate(block) {
  window.results = block;

  const counter = document.createElement('div');
  counter.className = 'asset-results-controls';
  block.appendChild(counter);

  const list = document.createElement('ol');
  block.appendChild(list);

  const masonry = document.createElement('div');
  masonry.className = 'asset-results-masonry hidden';
  block.appendChild(masonry);

  const grid = document.createElement('div');
  grid.className = 'asset-results-grid';
  block.append(grid);

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
          const item = document.createElement('div');
          item.className = 'asset-results-masonry-item';
          item.innerHTML = result.innerHTML;
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

  const showResults = (results) => {
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
    counter.innerHTML = `<div class="asset-results-heading"><img src="/blocks/asset-results/filter.svg">Assets & files (${results.nbHits})</div>
  <div class="asset-results-view-switcher assets-results-view-grid"></div>`;

    const filterbutton = counter.firstElementChild;
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
      } else {
        switcher.classList.add('assets-results-view-grid');
        switcher.classList.remove('assets-results-view-masonry');
      }
      grid.classList.toggle('hidden');
      masonry.classList.toggle('hidden');
    });

    results.hits.forEach((hit) => {
      const item = document.createElement('li');
      const topurl = new URL(hit.topurl || hit.sourceURL || hit.image);
      const imageURL = new URL(hit.image);
      const detailURL = new URL(window.location.href);
      detailURL.searchParams.set('q', `assetID:${hit.assetID}`);
      imageURL.searchParams.set('width', 750);
      const picture = createOptimizedPicture(imageURL.href, hit.caption, false, [{ width: '750' }]);
      item.innerHTML = `
        <a href="${detailURL.href}">${picture.outerHTML}</a>
        <div class="asset-results-details source-${hit.sourceType}">
          <p class="asset-results-caption"><a href="${detailURL.href}">${hit.caption}</a></p>
          <p class="asset-results-source"><a href="${topurl.href}">${hit.sourceDomain}</a></p>
          <p class="asset-results-views">${humanSize(hit.views)}</p>
          <p class="asset-results-dimensions">${hit.height} x ${hit.width}</p>
          <p class="asset-results-tags"><span>${(hit.tags || []).join('</span> <span>')}</span></p>
        </div>
      `;
      list.appendChild(item);
    });

    masonry.textContent = '';
    const m = new Masonry(list, masonry);
    m.update();

    grid.append(list);
  };

  const showOneUp = (asset, otherassets) => {
    console.log(otherassets);
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
              .filter(alt => alt !== infoConfig.value)
              .forEach(alt => {
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
        Helix Assets
      </div>
      <div class="header-filename"></div>
      <div class="header-button"><button class="secondary">Done</button></div>
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
    const closeButton = modal.querySelector('.header-button button');
    closeButton.addEventListener('click', () => {
      modal.remove();
      window.history.back();
    });
    const pictureDiv = modal.querySelector('.asset-results-oneup-picture');
    const moreDiv = modal.querySelector('.asset-results-oneup-more');
    console.log('Asset:', asset);
    const infoConfig = [{
      title: 'Information',
      infos: [
        { title: 'File', value: asset?.type.toUpperCase(), alts: otherassets.map(o => o.type?.toUpperCase()) },
        { title: 'Created', value: asset?.created && new Date(asset.created).toLocaleDateString() },
        { title: 'Modified', value: asset?.modified && new Date(asset.modified).toLocaleDateString() },
        { title: 'Size', value: '193MB' },
        { title: 'Width', value: `${asset.width}px`, alts: otherassets.map(o => `${o.width}px`) },
        { title: 'Height', value: `${asset.height}px`, alts: otherassets.map(o => `${o.height}px`) },
      ],
    }, {
      //title: 'Source',
      infos: [
        { title: 'Image', value: asset.image },
        { title: 'URL', value: asset.topurl },
      ],
    }, {
      title: 'Other',
      infos: [
        { title: 'Human Description', value: asset.alt, alts: otherassets.map(o => o.alt) },
        { title: 'Machine Description', value: asset.caption, alts: otherassets.map(o => o.caption) },
        { title: 'SKU', value: '000000' },
        { title: 'Status', value: 'Approved' },
        { title: 'Tags', value: `<span>${(asset.tags || []).join('</span> <span>')}</span>` },
        { title: 'Categories', value: `<span>${(asset.categories || []).join('</span> <span>')}</span>` },
        { title: 'Project', value: asset.sourceDomain },
      ],
    }];

    const infoDiv = modal.querySelector('.asset-results-oneup-info');
    const info = createInfo(infoConfig);
    infoDiv.append(info);
    
    otherassets.forEach(otherasset => {
      const a = document.createElement('a');
      a.href = `#${otherasset.objectID}`;
      a.appendChild(createOptimizedPicture(otherasset.image));
      moreDiv.appendChild(a);
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const myasset = otherasset;
        const allotherassets = [asset, ...otherassets].filter(a => a !== myasset);
        modal.remove();
        showOneUp(myasset, allotherassets);
      });
    });
    
    const similarserviceurl = new URL('https://helix-pages.anywhere.run/helix-services/asset-ingestor@v1');
    similarserviceurl.searchParams.set('url', asset.image);
    const similarassets = fetch(similarserviceurl.href).then(async res => {
      const { hits } = await res.json();
      hits.forEach(otherasset => {
        const a = document.createElement('a');
        const detailurl = new URL(window.location.href);
        detailurl.searchParams.set('q', `assetID:${otherasset.assetID}`);
        a.href = detailurl.href;
        a.appendChild(createOptimizedPicture(otherasset.image));
        moreDiv.appendChild(a);
      });
    });

    pictureDiv.appendChild(createOptimizedPicture(asset.image));
    block.append(modal);
  };

  const search = () => {
    const myurl = new URL(window.location.href);
    const query = myurl.searchParams.get('q') || '';
    const index = myurl.searchParams.get('index') || 'assets';

    const terms = query.split(' ');
    
    console.log(Array.from(myurl.searchParams.entries())
      .filter(([param]) => param.match(/f:(.*)-minimum/))
    );
    
    const filters = [
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
    const words = terms.filter((term) => !term.match(':')).join(' ');

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
