'use strict';

const standardAPIAvailable = "getAsEntry" in DataTransferItem.prototype;
async function handleEntry(entry, files) {
    const fullPath = entry.fullPath.slice(1);
    if (entry.isFile) {
        const file = await new Promise((resolve)=>{
            entry.file(resolve);
        });
        files[fullPath] = file;
    } else if (entry.isDirectory) {
        delete files[fullPath];
        const dirReader = entry.createReader();
        let entries;
        do {
            entries = await new Promise((resolve, reject)=>{
                dirReader.readEntries((entries)=>resolve(entries), reject);
            });
            for (const entry of entries){
                await handleEntry(entry, files);
            }
        }while (entries.length > 0)
    }
}
const attachDropHandler = ({ target = document.documentElement, onDrop, onDragOver, onDragLeave })=>{
    const handleDragOver = (e)=>{
        e.preventDefault();
        onDragOver && onDragOver(e);
    };
    const handleDragLeave = (e)=>{
        onDragLeave && onDragLeave(e);
    };
    const handleDrop = async (e)=>{
        e.preventDefault();
        onDragLeave && onDragLeave(e);
        if (!e.dataTransfer) return;
        const items = e.dataTransfer.items;
        let files = Object.fromEntries(Array.from(e.dataTransfer.files).map((file)=>[
                file.name,
                file
            ]));
        try {
            for(let i = 0; i < items.length; i++){
                const item = items[i];
                if (item.kind === "file") {
                    const entry = //@ts-ignore
                    item[standardAPIAvailable ? "getAsEntry" : "webkitGetAsEntry"](); // Use webkitGetAsEntry for directory support
                    if (entry && !entry.isFile) await handleEntry(entry, files);
                }
            }
        } catch (e) {
            console.warn(e);
        }
        const result = Object.entries(files).map(([fullPath, file])=>({
                file,
                fullPath
            }));
        result.length !== 0 && onDrop(result);
    };
    target.addEventListener("dragover", handleDragOver);
    target.addEventListener("dragleave", handleDragLeave);
    target.addEventListener("drop", handleDrop);
    return ()=>{
        target.removeEventListener("dragover", handleDragOver);
        target.removeEventListener("dragleave", handleDragLeave);
        target.removeEventListener("drop", handleDrop);
    };
};

exports.attachDropHandler = attachDropHandler;
//# sourceMappingURL=tiny-drophandler.cjs.map
