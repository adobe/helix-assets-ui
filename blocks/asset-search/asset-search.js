export default function decorate(block) {
  const textfield = document.createElement('input');
  textfield.type = 'text';
  textfield.name = 'query';

  if (new URL(window.location.href).searchParams.has('q')) {
    textfield.value = new URL(window.location.href).searchParams.get('q');
  }

  // update the URL when the input changes
  textfield.addEventListener('input', () => {
    const myurl = new URL(window.location.href);
    myurl.searchParams.set('q', textfield.value);
    window.changeURLState({ query: textfield.value }, myurl.href);
  });

  block.replaceWith(textfield);
}
