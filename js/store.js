import {
    store as e
} from "../store.js";
let COL = {
        SKU: 4,
        PRICE_CUR: 7,
        STOC: 9,
        COMM: 10,
        TARGET_PRICE: 12,
        TARGET_STOC: 13,
        MAX_PRICE: 14,
        INPUT_PRICE: 16,
        PROFIT: 20
    },
    calculateProfit = (e, t, r, o) => {
        if (!e || !t) return 0 === t ? "COGS Lipsă" : 0;
        let a = o > 0 ? r / o : 0,
            s = e * a * .7;
        return parseFloat((e - t - s).toFixed(2))
    },
    processRow = t => {
        let r = String(t[COL.SKU] || "").trim();
        if (!r) return t;
        let [o, a, s] = [t[COL.STOC], t[COL.MAX_PRICE], t[COL.INPUT_PRICE]].map(e => parseFloat(e) || 0), [l, c] = [t[COL.PRICE_CUR], t[COL.COMM]].map(e => parseFloat(e) || 0), C = s > 0 ? s : a, n = e.getProductCost(r), i = calculateProfit(C, n, c, l), d = [...t];
        return d[COL.TARGET_STOC] = o, d[COL.TARGET_PRICE] = C, d[COL.PROFIT] = i, d
    },
    downloadExcel = (e, t) => {
        let r = XLSX.write(e, {
                bookType: "xlsx",
                type: "array"
            }),
            o = new Blob([r], {
                type: "application/octet-stream"
            }),
            a = URL.createObjectURL(o),
            s = document.createElement("a");
        Object.assign(s, {
            href: a,
            download: t
        }), document.body.appendChild(s), s.click(), setTimeout(() => {
            URL.revokeObjectURL(a), document.body.removeChild(s)
        }, 100)
    };
export const processEmagFile = async e => (console.log(`Procesare cu filtrare stoc: ${e.name}`), new Promise((t, r) => {
    let o = new FileReader;
    o.onload = o => {
        try {
            let a = XLSX.read(new Uint8Array(o.target.result), {
                    type: "array"
                }),
                s = a.SheetNames.find(e => e.includes("Oferte")) || a.SheetNames[0],
                l = XLSX.utils.sheet_to_json(a.Sheets[s], {
                    header: 1,
                    defval: ""
                }),
                c = l.findIndex(e => String(e[COL.SKU]).includes("part_number") || String(e[COL.SKU]).includes("Cod produs")),
                C = c + 1,
                n = l.slice(C).filter(e => (parseFloat(e[COL.STOC]) || 0) > 0).map(processRow),
                i = [...l.slice(0, C), ...n],
                d = XLSX.utils.aoa_to_sheet(i);
            a.Sheets[s] = d, downloadExcel(a, `PROCESAT_${e.name.replace(".csv",".xlsx")}`), t("Succes!")
        } catch (O) {
            console.error(O), r(O)
        }
    }, o.readAsArrayBuffer(e)
}));
export const processTrendyolFile = async () => new Promise(e => setTimeout(e, 500));
