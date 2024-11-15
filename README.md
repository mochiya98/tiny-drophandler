# tiny-drophandler

tiny drag and drop handler that supports multiple files and directories

| Asset                                                                                                                           | Size   | Size (gzip) | Size (brotli) |
| ------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- | ------------- |
| [`tiny-drophandler.min.cjs`](https://cdn.jsdelivr.net/gh/mochiya98/tiny-drophandler@latest/dist/tiny-drophandler.min.cjs) | 1.27KB | 0.65KB | 0.56KB |
| [`tiny-drophandler.min.js`](https://cdn.jsdelivr.net/gh/mochiya98/tiny-drophandler@latest/dist/tiny-drophandler.min.js) | 1.16KB | 0.63KB | 0.54KB |
| [`tiny-drophandler.umd.min.js`](https://cdn.jsdelivr.net/gh/mochiya98/tiny-drophandler@latest/dist/tiny-drophandler.umd.min.js) | 1.40KB | 0.73KB | 0.63KB |
| [`tiny-drophandler.cjs`](https://cdn.jsdelivr.net/gh/mochiya98/tiny-drophandler@latest/dist/tiny-drophandler.cjs) | 2.57KB | 0.87KB | 0.74KB |
| [`tiny-drophandler.js`](https://cdn.jsdelivr.net/gh/mochiya98/tiny-drophandler@latest/dist/tiny-drophandler.js) | 2.54KB | 0.86KB | 0.73KB |
| [`tiny-drophandler.umd.js`](https://cdn.jsdelivr.net/gh/mochiya98/tiny-drophandler@latest/dist/tiny-drophandler.umd.js) | 3.05KB | 1.02KB | 0.86KB |

## Usage

```html
<script src="https://cdn.jsdelivr.net/gh/mochiya98/tiny-drophandler@latest/dist/tiny-drophandler.umd.min.js"></script>
<script>
  const dropArea = document.querySelector(".drop-area");
  const detach = TinyDrophandler.attachDropHandler({
    target: dropArea,
    onDragOver: (e) => {
      dropArea.classList.add("drag-over");
    },
    onDragLeave: (e) => {
      dropArea.classList.remove("drag-over");
    },
    onDrop: (files) => {
      console.log(files);
    },
  });
</script>
```
