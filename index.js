import { JSDOM } from "jsdom";
import { readFileSync } from "fs";
import { getDocument } from "pdfjs-dist";

const list = readFileSync("./words.txt", "utf-8").split("\n").filter(x => x);
let count = {};
for(let i of list)
    count[i] = 0;

const URL = "https://razgovor.edsoo.ru";

(async () => {
    const f1 = await fetch(URL);
    const t1 = await f1.text();
    const { document: document1 } = (new JSDOM(t1, { "contentType": "text/html" })).window;

    const links = document1.querySelectorAll(".content-month-cards a");
    for(let i of links) {
        try {
            const fl = await fetch(URL + i.getAttribute("href"));
            const tl = await fl.text();
            const { document: documentl } = (new JSDOM(tl, { "contentType": "text/html" })).window;
            for(let i = 1; i <= Array.from(documentl.querySelector("div.topic-resources").children).length; i++) {
                const finalLink = documentl.querySelector(`div.topic-resources > div:nth-child(${i}) > div.topic-resource-group-columns > div:nth-child(1) > a:nth-child(4)`).getAttribute("href");
                const fp = await fetch(finalLink);
                const bp = await fp.arrayBuffer();

                try {
                    const pdf = await getDocument(bp).promise;
                    for(let j = 0; j < pdf.numPages; j++) {
                        const page = await pdf.getPage(j + 1);
                        const text = await page.getTextContent();
                        const str = text.items.map(x => x.str).join(" ").toLowerCase();
                        for(let k of list)
                            if(str.includes(k.toLowerCase()))
                                count[k]++;
                        console.clear();
                        console.log(count);
                    }
                } catch(e) {console.log(e.stack)}
            }
        } catch(e) {console.log(e.stack)}
    }
})();