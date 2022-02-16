import { createOptimizedPicture } from '../../scripts/scripts.js';

export default function decorate(block) {
  window.results = block;

  const counter = document.createElement('div');
  counter.className = 'asset-results-counter';
  block.appendChild(counter);

  const list = document.createElement('ol');
  block.appendChild(list);

  const masonry = document.createElement('div');
  masonry.className = 'asset-results-masonry';
  block.appendChild(masonry);

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
    counter.innerHTML = `${results.nbHits} hits`;
    list.textContent = '';
    masonry.textContent = '';

    results.hits.forEach((hit) => {
      const item = document.createElement('li');
      const topurl = new URL(hit.topurl);
      const picture = createOptimizedPicture(`https://${topurl.hostname}${topurl.pathname}/media_${hit.objectID}.png?width=750`, hit.caption, false, [{ width: '750' }]);
      item.innerHTML = `
        ${picture.outerHTML}
        <div class="asset-results-details">
          <p class="asset-results-caption">${hit.caption}</p>
          <p class="asset-results-source"><a href="${hit.topurl}">${topurl.hostname}</a></p>
          <p class="asset-results-views">${humanSize(hit.views)}</p>
          <p class="asset-results-dimensions">${hit.height} x ${hit.width}</p>
          <p class="asset-results-tags"><span>${hit.tags.join('</span> <span>')}</span></p>
        </div>
      `;
      list.appendChild(item);
    });
    const m = new Masonry(list, masonry);
    m.update();
  };

  const search = () => {
    const myurl = new URL(window.location.href);
    const query = myurl.searchParams.get('q');

    const url = new URL('https://SWFXY1CU7X-dsn.algolia.net/1/indexes/assets');
    url.searchParams.set('query', query);
    url.searchParams.set('x-algolia-api-key', 'bd35440a1d9feb709a052226f1aa70d8');
    url.searchParams.set('x-algolia-application-id', 'SWFXY1CU7X');

    fetch(url.href).then(async (res) => showResults(await res.json()));
  };

  window.addURLStateChangeListener(search);

  search();
}
