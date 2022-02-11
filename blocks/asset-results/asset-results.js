export default function decorate(block) {
  window.results = block;

  const counter = document.createElement('div');
  block.appendChild(counter);

  const list = document.createElement('ol');
  block.appendChild(list);

  block.showResults = (results) => {
    counter.innerHTML = `${results.nbHits} hits`;
    list.innerHTML = '';

    results.hits.forEach((hit) => {
      console.log(hit);
      const item = document.createElement('li');
      const topurl = new URL(hit.topurl);
      item.innerHTML = `
        <img src="https://${topurl.hostname}${topurl.pathname}/${hit.target}.png?width=200">
        Source: <a href="${hit.topurl}">${hit.topurl}</a> (and ${hit.pages} other pages)
      `;
      list.appendChild(item);
    });
  };
}
