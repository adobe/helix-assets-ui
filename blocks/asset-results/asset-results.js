export default function decorate(block) {
  window.results = block;

  const counter = document.createElement('div');
  block.appendChild(counter);

  const list = document.createElement('ol');
  block.appendChild(list);

  const showResults = (results) => {
    counter.innerHTML = `${results.nbHits} hits`;
    list.innerHTML = '';

    results.hits.forEach((hit) => {
      console.log(hit);
      const item = document.createElement('li');
      const topurl = new URL(hit.topurl);
      item.innerHTML = `
        <img src="https://${topurl.hostname}${topurl.pathname}/media_${hit.objectID}.png?width=200">
        <p class="caption">${hit.caption}</p>
        <p class="source"><a href="${hit.topurl}">${hit.topurl}</a></p>
      `;
      list.appendChild(item);
    });
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
