export default function decorate(block) {
  const textfield = document.createElement('input');
  textfield.type = 'text';
  textfield.name = 'query';

  const search = () => {
    const url = new URL('https://SWFXY1CU7X-dsn.algolia.net/1/indexes/assets');
    url.searchParams.set('query', textfield.value);
    url.searchParams.set('x-algolia-api-key', 'bd35440a1d9feb709a052226f1aa70d8');
    url.searchParams.set('x-algolia-application-id', 'SWFXY1CU7X');

    const myurl = new URL(window.location.href);
    myurl.searchParams.set('q', textfield.value);
    window.history.pushState({ query: textfield.value }, '', myurl.href);

    fetch(url.href).then(async (res) => window.results
      && window.results.showResults(await res.json()));
  };

  if (new URL(window.location.href).searchParams.has('q')) {
    textfield.value = new URL(window.location.href).searchParams.get('q');
    window.setTimeout(search, 1000);
  }

  textfield.addEventListener('input', search);

  block.replaceWith(textfield);
}
