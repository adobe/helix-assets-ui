export default function decorate(block) {
  const textfield = document.createElement('input');
  textfield.type = 'text';
  textfield.name = 'query';

  if (new URL(window.location.href).searchParams.has('q')) {
    textfield.value = new URL(window.location.href).searchParams.get('q');
  }

  const datalist = document.createElement('datalist');
  datalist.id = 'query-suggestions';

  // enable autocompletion
  textfield.setAttribute('list', datalist.id);

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

  block.replaceWith(textfield);
  textfield.after(datalist);
}
