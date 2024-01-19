import { JSDOM } from "jsdom";
import { PdfReader } from "pdfreader";
import { readFileSync } from "fs";

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
                const bp = Buffer.from(await fp.arrayBuffer());

                try {
                    await new Promise((resolve, reject) => {
                        new PdfReader().parseBuffer(bp, (err, item) => {
                            if(err) {
                                reject(err);
                            } else if(!item) {
                                resolve();
                            } else if(item.text) {
                                console.clear();
                                for(let i of list)
                                    count[i] += (item.text.toLowerCase().match(new RegExp(i, "g")) || []).length;
                                console.log(count);
                            }
                        });
                    });
                } catch(_) {}
            }
        } catch(_) {}
    }
})();