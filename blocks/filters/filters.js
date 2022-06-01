const ignoredFacets = ['assetID', 'tags', 'multiple', 'background', 'categories', 'foreground'];
const ignoreSourceDomains = ['cc-author.prod.corp.adobe.com', 'marketinghub', 'stock.adobe.com', 'www.hp.com', 'fonts.adobe.com', 'photoshopcamera.app.link', 'adobe-robohelp-launch-2020.meetus.adobeevents.com', 'main--blog--adobe.hlx.page', 'blogs.nvidia.com', 'www.adobeprerelease.com'];
const ignoreSource = ['website', 'rum'];
const displayNameMap = {
  website: 'Website',
  stock: 'Adobe Stock',
  brandportal: 'Brand Portal',
  aem: 'Adobe Experience Manager',
  type: 'File type',
  sourceType: 'Sources',
  aspectratio: 'Orientation',
};

export default function decorate(block) {
  window.appState.on('facets', (_, facets) => {
    const url = new URL(window.location.href);
    if (url.hash === '#sidebar') {
      block.parentElement.parentElement.classList.add('show-sidebar');
    }

    block.innerHTML = '';

    const allfacets = url.searchParams.getAll('ff');

    const facetGroups = {};
    let websiteCounts = 0;
    const websiteSources = {};

    Object.keys(facets)
      .filter((facet) => !ignoredFacets.includes(facet))
      .forEach((facet) => {
        const facetEntries = {};
        // List 'non website' selections
        Object.entries(facets[facet]).forEach(([value, count]) => {
          if (!ignoreSource.includes(value)) {
            facetEntries[value] = {};
            facetEntries[value].count = count;
          }
        });
        if (facet !== 'sourceDomain') {
          facetGroups[facet] = facetEntries;
        }

        if (facet === 'sourceDomain') {
          Object.entries(facets[facet]).forEach(([value, count]) => {
            if (!ignoreSourceDomains.includes(value)) {
              websiteSources[value] = count;
              websiteCounts += count;
            }
          });
        }
      });
    if (facetGroups.sourceType !== undefined && websiteCounts > 0) {
      facetGroups.sourceType.website = {};
      facetGroups.sourceType.website.count = websiteCounts;
      facetGroups.sourceType.website.domains = websiteSources;
    }

    Object.keys(facetGroups).forEach((facet) => {
      const parentdiv = document.createElement('div');
      const facetdiv = document.createElement('div');
      facetdiv.classList.add('facet');
      const facetTitle = displayNameMap[facet];
      parentdiv.innerHTML = `<h3>${facetTitle}</h3>`;
      parentdiv.append(facetdiv);
      // List 'non website' selections
      Object.keys(facetGroups[facet]).forEach((facetEntry) => {
        const checkbox = document.createElement('input');
        const assetCount = facetGroups[facet][facetEntry].count;
        const value = facetEntry;
        checkbox.type = 'checkbox';
        checkbox.id = `facet-${facet}-${value}`;
        checkbox.checked = !!allfacets.filter((f) => f === `${facet}:${value}`).length;
        const label = document.createElement('label');
        label.innerHTML = `<span class="value">${displayNameMap[value] !== undefined ? displayNameMap[value] : value}</span><span class="count">${assetCount}</span>`;
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
        if (value === 'website') {
          const facetName = 'sourceDomain';
          const domainFacetdiv = document.createElement('div');
          domainFacetdiv.classList.add('domainfacet');
          facetdiv.append(domainFacetdiv);
          Object.entries(facetGroups[facet][facetEntry].domains).forEach(([valuex, countx]) => {
            const checkboxx = document.createElement('input');
            checkboxx.type = 'checkbox';
            checkboxx.id = `facet-${facetName}-${valuex}`;
            checkboxx.checked = !!allfacets.filter((f) => f === `${facetName}:${valuex}`).length;
            const labelx = document.createElement('label');
            labelx.innerHTML = `<span class="value">${displayNameMap[valuex] !== undefined ? displayNameMap[valuex] : valuex}</span><span class="count">${countx}</span>`;
            labelx.setAttribute('for', checkboxx.id);
            domainFacetdiv.append(checkboxx);
            domainFacetdiv.append(labelx);

            checkboxx.addEventListener('change', () => {
              const myurl = new URL(window.location.href);
              if (checkboxx.checked) {
                myurl.searchParams.append('ff', `${facetName}:${valuex}`);
              } else {
                const validfacets = myurl.searchParams.getAll('ff')
                  .filter((v) => v !== `${facetName}:${valuex}`);
                myurl.searchParams.delete('ff');
                validfacets.forEach((v) => myurl.searchParams.append('ff', v));
              }

              window.changeURLState({}, myurl.href);
            });
          });
        }
      });
      block.append(parentdiv);
    });

    const resolutionDiv = document.createElement('div');
    resolutionDiv.innerHTML = '<h3>Resolution</h3>';

    ['width', 'height'].forEach((numprop) => {
      const parentdiv = document.createElement('div');
      const facetdiv = document.createElement('div');
      facetdiv.classList.add('filter');

      const input = document.createElement('input');
      input.type = 'number';
      input.id = `f:${numprop}-minimum`;
      const label = document.createElement('label');
      label.setAttribute('for', input.id);
      label.innerHTML = `minimum ${numprop}`;

      if (url.searchParams.has(input.id)) {
        input.valueAsNumber = url.searchParams.get(input.id).match(/[0-9]+/);
      }

      const el = ({ target }) => {
        const myurl = new URL(window.location.href);
        if (target.valueAsNumber) {
          myurl.searchParams.set(target.id, target.valueAsNumber);
        } else {
          myurl.searchParams.delete(target.id);
        }
        window.changeURLState({}, myurl.href);
      };

      input.addEventListener('change', el);

      facetdiv.append(input);
      facetdiv.append(label);
      parentdiv.append(facetdiv);
      resolutionDiv.append(parentdiv);
      block.append(resolutionDiv);
    });

    ['created', 'modified'].forEach((dateprop) => {
      const parentdiv = document.createElement('div');
      const facetdiv = document.createElement('div');
      facetdiv.classList.add('filter');
      const fLabel = dateprop.charAt(0).toUpperCase() + dateprop.slice(1);
      parentdiv.innerHTML = `<h3>${fLabel}</h3>`;

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

      const el = ({ target }) => {
        const myurl = new URL(window.location.href);
        if (target.valueAsNumber) {
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

    // add 'fake' status filter
    const parentdivx = document.createElement('div');
    const facetdivx = document.createElement('div');
    facetdivx.classList.add('facet');
    parentdivx.innerHTML = '<h3>Status</h3>';
    parentdivx.append(facetdivx);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'facet-status-approved';
    checkbox.checked = false;
    const labelx = document.createElement('label');
    labelx.innerHTML = '<span class="value">Approved</span><span></span>';
    labelx.setAttribute('for', checkbox.id);
    facetdivx.append(checkbox);
    facetdivx.append(labelx);

    block.append(parentdivx);
  });
}
