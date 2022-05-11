const ignoredFacets = ['assetID', 'tags', 'multiple', 'background', 'categories', 'foreground', 'sourceDomain'];
const displayNameMap = {
  rum: "Website",
  stock: "Stock",
  brandportal: "Brand Portal",
  aem: "AEM",
  type: "File type",
  sourceType: "Sources",
  aspectratio: "Orientation"
}

export default function decorate(block) {
  window.appState.on('facets', (_, facets) => {
    const url = new URL(window.location.href);
    if (url.hash === '#sidebar') {
      block.parentElement.parentElement.classList.add('show-sidebar');
    }

    block.innerHTML = '';

    const allfacets = url.searchParams.getAll('ff');

    ['width', 'height'].forEach((numprop) => {
      const parentdiv = document.createElement('div');
      const facetdiv = document.createElement('div');
      facetdiv.classList.add('filter');
      parentdiv.innerHTML = `<h3>${numprop}</h3>`;
      
      const input = document.createElement('input');
      input.type = 'number';
      input.id = `f:${numprop}-minimum`;
      const label = document.createElement('label');
      label.setAttribute('for', input.id);
      label.innerHTML = `minimum ${numprop}`;
      
      const input2 = document.createElement('input');
      input2.type = 'number';
      input2.id = `f:${numprop}-maximum`;
      const label2 = document.createElement('label');
      label2.setAttribute('for', input2.id);
      label2.innerHTML = `maximum ${numprop}`;
      
      if (url.searchParams.has(input.id)) {
        input.valueAsNumber = url.searchParams.get(input.id).match(/[0-9]+/);
      }
      if (url.searchParams.has(input2.id)) {
        input2.valueAsNumber = url.searchParams.get(input2.id).match(/[0-9]+/);
      }
      
      const el = ({target}) => {
        const myurl = new URL(window.location.href);
        if (!!target.valueAsNumber) {
          myurl.searchParams.set(target.id, target.valueAsNumber);
        } else {
          myurl.searchParams.delete(target.id);       
        }
        window.changeURLState({}, myurl.href);
      };
      
      input.addEventListener('change', el);
      input2.addEventListener('change', el);
      
      facetdiv.append(input);
      facetdiv.append(label);
      facetdiv.append(input2);
      facetdiv.append(label2);
      parentdiv.append(facetdiv);
      block.append(parentdiv);
    });

    ['created', 'modified'].forEach((dateprop) => {
      const parentdiv = document.createElement('div');
      const facetdiv = document.createElement('div');
      facetdiv.classList.add('filter');
      parentdiv.innerHTML = `<h3>${dateprop}</h3>`;
      
      const input = document.createElement('input');
      input.type = 'date';
      input.id = `f:${dateprop}-minimum`;
      const label = document.createElement('label');
      label.setAttribute('for', input.id);
      label.innerHTML = `${dateprop} after`;
      
      const input2 = document.createElement('input');
      input2.type = 'date';
      input2.id = `f:${dateprop}-maximum`;
      const label2 = document.createElement('label');
      label2.setAttribute('for', input2.id);
      label2.innerHTML = `${dateprop} before`;
      
      if (url.searchParams.has(input.id)) {
        input.valueAsNumber = url.searchParams.get(input.id).match(/[0-9]+/);
      }
      if (url.searchParams.has(input2.id)) {
        input2.valueAsNumber = url.searchParams.get(input2.id).match(/[0-9]+/);
      }
      
      const el = ({target}) => {
        const myurl = new URL(window.location.href);
        if (!!target.valueAsNumber) {
          myurl.searchParams.set(target.id, target.valueAsNumber);
        } else {
          myurl.searchParams.delete(target.id);       
        }
        window.changeURLState({}, myurl.href);
      };
      
      input.addEventListener('change', el);
      input2.addEventListener('change', el);
      
      facetdiv.append(input);
      facetdiv.append(label);
      facetdiv.append(input2);
      facetdiv.append(label2);
      parentdiv.append(facetdiv);
      block.append(parentdiv);
    });

    Object.keys(facets)
      .filter((facet) => !ignoredFacets.includes(facet))
      .forEach((facet) => {
        const parentdiv = document.createElement('div');
        const facetdiv = document.createElement('div');
        facetdiv.classList.add('facet');
        const facetTitle = displayNameMap[facet];
        parentdiv.innerHTML = `<h3>${facetTitle}</h3>`;
        parentdiv.append(facetdiv);
        Object.entries(facets[facet]).forEach(([value, count]) => {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = `facet-${facet}-${value}`;
          checkbox.checked = !!allfacets.filter((f) => f === `${facet}:${value}`).length;
          const label = document.createElement('label');
          label.innerHTML = `<span class="value">${displayNameMap[value]}</span><span class="count">${count}</span>`;
          label.setAttribute('for', checkbox.id);
          facetdiv.append(checkbox);
          facetdiv.append(label);

          checkbox.addEventListener('change', () => {
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
