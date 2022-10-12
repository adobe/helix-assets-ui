# index.*.js minified changes

from Alex

## 1 - Fix for incorrect svg URL

Change

```
`${window.location.pathname}/styles/adobe.svg`
```

to this

```
`${window.location.origin}${window.tenantLogo}`
```


## 2 - Required UI activation logic

At the end of index.*.js replace

```
Ug.createRoot(document.getElementsByTagName("main")[0]).render($(Wle, {}));
```

with

```
if (window.ui !== 'helix') { Ug.createRoot(document.getElementsByTagName("main")[0]).render($(Wle, {})); }
```
