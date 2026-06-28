const https = require("https");

module.exports.geocodeLocation = async (location, country) => {
    const query = encodeURIComponent(`${location}, ${country}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    return new Promise((resolve) => {
        https.get(url, {
            headers: { "User-Agent": "WanderlustApp/1.0", "Accept": "application/json" },
            timeout: 10000,
        }, (res) => {
            let data = "";
            res.on("data", (chunk) => data += chunk);
            res.on("end", () => {
                try {
                    const results = JSON.parse(data);
                    if (results && results.length > 0) {
                        resolve({
                            type: "Point",
                            coordinates: [parseFloat(results[0].lon), parseFloat(results[0].lat)],
                        });
                    } else {
                        resolve({ type: "Point", coordinates: [0, 0] });
                    }
                } catch { resolve({ type: "Point", coordinates: [0, 0] }); }
            });
        }).on("error", () => resolve({ type: "Point", coordinates: [0, 0] }));
    });
};
