const ignoredFacets = ['assetID'];

export default function decorate(block) {
  window.appState.on('facets', (_, facets) => {
    const url = new URL(window.location.href);
    if (url.hash === '#sidebar') {
      block.parentElement.parentElement.classList.add('show-sidebar');
    }

    block.innerHTML = '';

    const allfacets = url.searchParams.getAll('ff');

    Object.keys(facets)
      .filter((facet) => !ignoredFacets.includes(facet))
      .forEach((facet) => {
        const parentdiv = document.createElement('div');
        const facetdiv = document.createElement('div');
        facetdiv.classList.add('facet');
        parentdiv.innerHTML = `<h3>${facet}</h3>`;
        parentdiv.append(facetdiv);
        Object.entries(facets[facet]).forEach(([value, count]) => {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = `facet-${facet}-${value}`;
          checkbox.checked = !!allfacets.filter((f) => f === `${facet}:${value}`).length;
          const label = document.createElement('label');
          label.innerHTML = `<span class="value">${value}</span><span class="count">${count}</span>`;
          label.setAttribute('for', checkbox.id);
          facetdiv.append(checkbox);
          facetdiv.append(label);

          checkbox.addEventListener('change', () => {
            console.log('toggled', facet, value);
            const myurl = new URL(window.location.href);
            if (checkbox.checked) {
              myurl.searchParams.append('ff', `${facet}:${value}`);
            } else {
              const validfacets = myurl.searchParams.getAll('ff')
                .filter((v) => v !== `${facet}:${value}`);
              myurl.searchParams.delete('ff');
              validfacets.forEach((v) => myurl.searchParams.append('ff', v));
            }

            window.changeURLState({}, myurl.href);
          });
        });
        block.append(parentdiv);
      });
  });
}
