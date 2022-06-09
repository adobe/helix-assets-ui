export default async function decorate(block) {
  const selfURL = new URL(window.location.href);
  selfURL.searchParams.set('index', selfURL.searchParams.get('index') === 'assets' ? 'assets-cai' : 'assets');
  block.innerHTML = `<div class="header-brand"><a href="${selfURL.href}"><img src="/styles/adobe.svg"></a>Assets Across Adobe</div><div class="header-input"><span><input placeholder="Landscape Type to search..."></span></div><div class="header-button"></div>`;

  const textfield = block.querySelector('input');

  if (new URL(window.location.href).searchParams.has('q')) {
    textfield.value = new URL(window.location.href).searchParams.get('q');
  }

  const datalist = document.createElement('datalist');
  datalist.id = 'query-suggestions';

  // enable autocompletion
  textfield.setAttribute('list', datalist.id);
  textfield.setAttribute('placeholder', 'type or drag to search');

  textfield.addEventListener('drop', async (e) => {
    // image similarity search
    e.preventDefault();
    // console.log('dropped', e.dataTransfer.getData('url'));

    const imagebitmap = await createImageBitmap(e.dataTransfer.files.item(0), {
      resizeWidth: 500,
    });
    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    canvas.width = imagebitmap.width;
    canvas.height = imagebitmap.height;
    block.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imagebitmap, 0, 0);
    const upload = canvas.toDataURL();
    canvas.remove();
    const data = new URLSearchParams();
    data.set('upload', upload);
    const res = await fetch('https://helix-pages.anywhere.run/helix-services/asset-ingestor@v1', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      },
      body: data.toString(),
    });
    const resdata = await res.json();
    if (resdata.result.length) {
      textfield.value = resdata.result[0].filepath;
      const myurl = new URL(window.location.href);
      myurl.searchParams.set('q', textfield.value);
      window.changeURLState({ query: textfield.value }, myurl.href);
    }
  });

  // update the URL when the input changes
  textfield.addEventListener('input', () => {
    const myurl = new URL(window.location.href);
    myurl.searchParams.set('q', textfield.value);
    window.changeURLState({ query: textfield.value }, myurl.href);

    const query = myurl.searchParams.get('q');

    const url = new URL('https://SWFXY1CU7X-dsn.algolia.net/1/indexes/assets_query_suggestions');
    url.searchParams.set('query', query);
    url.searchParams.set('x-algolia-api-key', 'bd35440a1d9feb709a052226f1aa70d8');
    url.searchParams.set('x-algolia-application-id', 'SWFXY1CU7X');

    fetch(url.href).then(async (res) => {
      const { hits } = await res.json();
      if (hits.length) {
        datalist.innerHTML = '';
      }
      hits.forEach((hit) => {
        const option = document.createElement('option');
        option.innerHTML = hit.query;
        datalist.append(option);
      });
    });
  });
  textfield.after(datalist);
}
