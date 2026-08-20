const fs = require("fs");
const path = require("path");

const BASE_URL = "https://pokedex.ajayarora.ca";
const POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon?limit=1025";

const POKEMON_TYPES = [
    "normal", "fire", "water", "grass", "electric", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

async function generateSitemap() {
    console.log("Fetching Pokémon from PokéAPI...");
    const response = await fetch(POKEAPI_URL);
    if (!response.ok) {
        throw new Error(`PokéAPI request failed: ${response.status}`);
    }
    const data = await response.json();

    const urls = [
        `${BASE_URL}/`,
        ...data.results.map(
            (pokemon) => `${BASE_URL}/${pokemon.name}`
        ),
        ...POKEMON_TYPES.map(
            (type) => `${BASE_URL}/${type}`
        ),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
            .map(
                (url) => `    <url>
        <loc>${url}</loc>
    </url>`
            )
            .join("\n")}
</urlset>`;

    const outputPath = path.join(__dirname, "..", "public", "sitemap.xml");
    fs.writeFileSync(outputPath, sitemap);

    console.log(`Sitemap generated with ${urls.length} URLs.`);
    console.log(`Saved to: ${outputPath}`);
}

generateSitemap().catch((error) => {
    console.error("Failed to generate sitemap:");
    console.error(error);
    process.exit(1);
});