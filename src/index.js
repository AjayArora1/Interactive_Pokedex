import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import GitHubButton from "react-github-btn";
import './style.scss';

const typeColors = {
    normal: "164, 172, 175",
    fire: "253, 125, 36",
    water: "69, 146, 196",
    grass: "155, 204, 80",
    flying: "61, 199, 239",
    fighting: "213, 103, 35",
    poison: "185, 127, 201",
    electric: "238, 213, 53",
    ground: "247, 222, 63",
    rock: "163, 140, 33",
    psychic: "243, 102, 185",
    ice: "81, 196, 231",
    bug: "114, 159, 63",
    ghost: "123, 98, 163",
    steel: "158, 183, 184",
    dragon: "83, 164, 207",
    dark: "112, 112, 112",
    fairy: "253, 185, 233"
};

const delayAndUpdateCurrentNumber = async (delay) => {
    await new Promise(resolve => setTimeout(resolve, delay));
};

// Pokemon Image.
function Appearance(props) {
    const [displayed, setDisplayed] = useState({
        number: props.number,
        isFront: props.isFront,
        isShiny: props.isShiny
    });
    const [outgoing, setOutgoing] = useState(null);
    const [transitionType, setTransitionType] = useState('shuffle'); // 'shuffle' or 'fade'
    const prevRef = useRef({
        number: props.number,
        isFront: props.isFront,
        isShiny: props.isShiny
    });

    useEffect(() => {
        const prev = prevRef.current;
        const numberChanged = prev.number !== props.number;
        const spriteChanged = prev.isFront !== props.isFront || prev.isShiny !== props.isShiny;

        if (numberChanged || spriteChanged) {
            setTransitionType(numberChanged ? 'shuffle' : 'fade');
            setOutgoing(prev);
            setDisplayed({
                number: props.number,
                isFront: props.isFront,
                isShiny: props.isShiny
            });
            prevRef.current = {
                number: props.number,
                isFront: props.isFront,
                isShiny: props.isShiny
            };

            const timeout = setTimeout(() => {
                setOutgoing(null);
            }, 400);

            return () => clearTimeout(timeout);
        }
    }, [props.number, props.isFront, props.isShiny]);

    const getImageUrl = (state) => state.isShiny
        ? (state.isFront
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${state.number}.png`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${state.number}.png`)
        : (state.isFront
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${state.number}.png`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${state.number}.png`);

    const outClass = transitionType === 'shuffle' ? 'shuffleOut' : 'fadeOut';
    const inClass = transitionType === 'shuffle' ? 'shuffleIn' : 'fadeIn';

    return (
        <div className="pokemonFloat">
            {outgoing && (
                <img
                    key={`out-${outgoing.number}-${outgoing.isFront}-${outgoing.isShiny}`}
                    src={getImageUrl(outgoing)}
                    alt={`Pokemon ${outgoing.number}`}
                    className={`pokemonImage ${outClass}`}
                />
            )}
            <img
                key={`in-${displayed.number}-${displayed.isFront}-${displayed.isShiny}`}
                src={getImageUrl(displayed)}
                alt={`Pokemon ${displayed.number}`}
                className={`pokemonImage ${outgoing ? inClass : ''}`}
            />
        </div>
    );
}

function capitalizeName(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function PokemonHeightWeight(props) {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [stats, setStats] = useState([]);
    const [fetchingStats, setFetchingStats] = useState(false);

    const statLabels = {
        hp: 'HP',
        attack: 'Attack',
        defense: 'Defense',
        'special-attack': 'Sp. Attack',
        'special-defense': 'Sp. Defense',
        speed: 'Speed'
    };

    useEffect(() => {
        const fetchHeightWeight = async () => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${props.number}`);
                const data = await response.json();

                // Calculate height and weight as before
                const pokemonHeight = data.height * 10;
                const pokemonWeight = data.weight / 10;

                // Update state with fetched height and weight
                setHeight(`${pokemonHeight}cm`);
                setWeight(`${pokemonWeight}kg`);

                // Extract base stats
                const baseStats = data.stats.map(stat => ({
                    name: stat.stat.name,
                    value: stat.base_stat
                }));

                // Update state with base stats
                setStats(baseStats);
            } catch (error) {
                console.error('Error fetching Pokemon height, weight, and stats:', error);
            } finally {
                setFetchingStats(false);
            }
        };

        fetchHeightWeight();
    }, [props.number]);

    return (
        <div className="PokemonHeightWeight">
            <div className="HeightWeight">
                <div className="HeightWeightGrid">
                    <div className="HeightWeightGridItem">
                        <p><strong>Height:</strong> {height}</p>
                    </div>
                    <div className="HeightWeightGridItem">
                        <p><strong>Weight:</strong> {weight}</p>
                    </div>
                </div>
            </div>
            <div className="BaseStats">
                <div className="StatsGrid">
                    {stats.map((stat, index) => (
                        <div key={index} className="StatItem">
                            <span className="BoldLabel">{statLabels[stat.name]}</span>: {stat.value}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PokemonName(props) {
    const [name, setName] = useState('');

    // Effect to fetch and update Pokemon name
    useEffect(() => {
        const fetchData = async () => {

            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${props.number}`);
                const data = await response.json();

                // Extracting the name from the response and capitalizing all words
                let pokemonName = data.name
                    .split('-')
                    .map(capitalizeName)
                    .join(' ');

                if (data.name === 'nidoran-m') {
                    pokemonName = 'Nidoran \u2642';
                } else if (data.name === 'nidoran-f') {
                    pokemonName = 'Nidoran \u2640';
                }

                // Applying text flavors
                const formattedName = pokemonName
                    .replace(/\f/g, '\n')
                    .replace(/\u00ad\n/g, '')
                    .replace(/\u00ad/g, '')
                    .replace(/ -\n/g, ' - ')
                    .replace(/-\n/g, '-')
                    .replace(/\n/g, ' ');

                // Simulate typewriter effect for name
                await typewriterEffect(formattedName);

                setName(formattedName);
            } catch (error) {
                console.error('Error fetching Pokemon Name:', error);
            }

        };

        fetchData();
    }, [props.number]);

    const typewriterEffect = async (text) => {
        const duration = 400;
        const delay = Math.max(duration / text.length, 4);

        for (let i = 0; i <= text.length; i++) {
            await new Promise(resolve => setTimeout(resolve, delay));
            setName(text.slice(0, i) + ' '.repeat(text.length - i));
        }
    };

    return (
        <p>{name}</p>
    );
}
function Sidebar({ cardColor, setCurrentRoute, setSelectedType, currentRoute, isComparing, onToggleComparison }) {
    const [typeOpen, setTypeOpen] = useState(false);

    const types = [
        "normal", "fire", "water", "grass", "electric", "ice",
        "fighting", "poison", "ground", "flying", "psychic", "bug",
        "rock", "ghost", "dragon", "dark", "steel", "fairy"
    ];

    const isTypeExplorerActive = currentRoute === "type";

    return (
        <aside className="sidebar" style={{ background: `rgba(${cardColor}, 0.75)` }}>
            <div className="sidebarHeader">
                <h2>Tools</h2>
            </div>

            <div className="sidebarItem">
                <div className="githubButtonWrapper">
                    <GitHubButton
                        href="https://github.com/AjayArora1/Interactive_Pokedex"
                        data-size="large"
                        data-show-count="true"
                        aria-label="Star AjayArora1/Interactive_Pokedex on GitHub"
                    >
                        Star
                    </GitHubButton>
                </div>
            </div>

            <button className="sidebarButton" onClick={() => setTypeOpen(!typeOpen)}>
                Type Explorer
                <span>{typeOpen ? "▲" : "▼"}</span>
            </button>

            {typeOpen && (
                <div className="typeGrid">
                    {types.map(type => (
                        <button
                            key={type}
                            className={`PokemonType ${type}`}
                            onClick={() => {
                                setSelectedType(type);
                                setCurrentRoute("type");
                                window.history.pushState({}, "", `/${type}`);
                                document.title = `${capitalizeName(type)} Type | Interactive Pokédex`;
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            )}

            <button
                className={`sidebarButton ${isTypeExplorerActive ? 'disabled' : ''}`}
                disabled={isTypeExplorerActive}
            >
                Team Builder
            </button>
            <button
                className={`sidebarButton ${isTypeExplorerActive ? 'disabled' : ''}`}
                disabled={isTypeExplorerActive}
            >
                Evolution Tree
            </button>
            <button
                className={`sidebarButton ${isTypeExplorerActive ? 'disabled' : ''}`}
                disabled={isTypeExplorerActive}
                onClick={onToggleComparison}
            >
                {isComparing ? 'Stop Comparing' : 'Comparison'}
            </button>
        </aside>
    );
}

function TypeExplorerView({
    type,
    cardColor,
    onSelectPokemon
}) {
    const [pokemon, setPokemon] = useState([]);

    useEffect(() => {
        const fetchType = async () => {
            const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
            const data = await res.json();

            setPokemon(
                data.pokemon
                    .filter(p => p.slot === 1)
                    .map(p => ({
                        id: Number(p.pokemon.url.split("/").filter(Boolean).pop()),
                        name: p.pokemon.name
                    }))
            );
        };

        fetchType();
    }, [type]);

    return (
        <div className="TypeExplorerCard">
            <h2>{capitalizeName(type)} Type</h2>

            <div className="TypeExplorerGrid">
                {pokemon.map(p => (
                    <button
                        key={p.id}
                        className="TypePokemonButton"
                        onClick={async () => {
                            const res = await fetch(
                                `https://pokeapi.co/api/v2/pokemon/${p.id}`
                            );
                            const data = await res.json();

                            onSelectPokemon(p.id, data.name);
                        }}
                    >
                        <div className="typePokemonFloat">
                            <img
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                                alt={p.name}
                            />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function PokemonBio(props) {
    const [bio, setBio] = useState('');
    const [fetching, setFetching] = useState(false);

    // Ref to manage ongoing fetch request and typewriter effect
    const fetchControllerRef = useRef(null);
    const typewriterTimeoutRef = useRef(null);

    useEffect(() => {
        // Clear ongoing fetch and typewriter effect if component unmounts or fetch is re-triggered
        return () => {
            if (fetchControllerRef.current) {
                fetchControllerRef.current.abort();
            }
            clearTimeout(typewriterTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const fetchBio = async () => {
            setBio(''); // Clear previous bio
            setFetching(true); // Set fetching state

            // Create a new AbortController for fetch cancellation
            const controller = new AbortController();
            fetchControllerRef.current = controller;

            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${props.number}`, { signal: controller.signal });
                const data = await response.json();

                // Finding the English flavor text entry
                const englishBioEntry = data.flavor_text_entries.find(entry => entry.language.name === 'en');

                // Extracting the bio from the English entry and applying replacements
                let pokemonBio = englishBioEntry.flavor_text
                    .replace(/\f/g, '\n')
                    .replace(/\u00ad\n/g, '')
                    .replace(/\u00ad/g, '')
                    .replace(/ -\n/g, ' - ')
                    .replace(/-\n/g, '-')
                    .replace(/\n/g, ' ');

                // Simulate typewriter effect for bio
                await typewriterEffect(pokemonBio);

                setBio(pokemonBio);
            } catch (error) {
                console.error('Error fetching Pokemon Bio:', error);
                setBio('Bio not available'); // Handle error case gracefully
            } finally {
                setFetching(false); // Reset fetching state
            }
        };

        // Debounce fetch requests to avoid rapid API calls
        const debounceFetch = setTimeout(() => {
            fetchBio();
        }, 300); // Adjust debounce delay as needed

        // Cleanup function to clear timeout and abort fetch if component unmounts or fetch is re-triggered
        return () => {
            clearTimeout(debounceFetch);
            if (fetchControllerRef.current) {
                fetchControllerRef.current.abort();
            }
            clearTimeout(typewriterTimeoutRef.current);
        };
    }, [props.number]);

    // Function to simulate typewriter effect
    const typewriterEffect = async (text) => {
        const duration = 400; // match card shuffle animation length
        const delay = Math.max(duration / text.length, 4); // min 4ms so it doesn't go instant on tiny strings

        for (let i = 0; i <= text.length; i++) {
            await new Promise(resolve => {
                typewriterTimeoutRef.current = setTimeout(() => {
                    setBio(text.slice(0, i));
                    resolve();
                }, delay);
            });
        }
    };

    return (
        <p className="PokemonBio">{bio}</p>
    );
}

function PokemonType(props) {
    const [types, setTypes] = useState([]);
    const [hasType, setHasType] = useState(false);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await fetch(
                    `https://pokeapi.co/api/v2/pokemon/${props.number}`
                );

                const data = await response.json();

                const pokemonTypes = data.types.map(
                    slot => slot.type.name
                );

                setTypes(pokemonTypes);
                setHasType(pokemonTypes.length > 0);
            } catch (error) {
                console.error('Error fetching Pokemon Types:', error);
            }
        };

        fetchTypes();
    }, [props.number]);

    useEffect(() => {
        if (hasType) {
            const commonType = types.find(type => typeColors[type]);

            if (commonType) {
                props.setCardColor(typeColors[commonType]);
            }
        }
    }, [types, hasType]);

    return (
        <div className="PokemonTypes">
            {types.join(' ').split(' ').map((type, index) => (
                <span
                    key={index}
                    className={`PokemonType ${type}`}
                >
                    {type}
                </span>
            ))}
        </div>
    );
}

function PokedexCard({ id, initialNumber, isPrimary, onPrimaryColorChange, onPrimaryNumberChange, isEntering, isExiting, onClose }) {
    const [currentNumber, setCurrentNumber] = useState(initialNumber);
    const [inputValue, setInputValue] = useState('');
    const [audioSrc, setAudioSrc] = useState('');
    const [isFront, setIsFront] = useState(true);
    const [isShiny, setIsShiny] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [cardColor, setCardColor] = useState('255, 255, 255');

    useEffect(() => {
        if (isEntering || isExiting) return; // don't double up with the slide animation
        setIsShuffling(true);
        const timeout = setTimeout(() => setIsShuffling(false), 400);
        return () => clearTimeout(timeout);
    }, [currentNumber, isEntering, isExiting]);

    useEffect(() => {
        if (isPrimary && onPrimaryColorChange) {
            onPrimaryColorChange(cardColor);
        }
    }, [cardColor, isPrimary]);

    useEffect(() => {
        if (isPrimary && onPrimaryNumberChange) {
            onPrimaryNumberChange(currentNumber);
        }
    }, [currentNumber, isPrimary]);

    useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentNumber}`);
                const data = await response.json();

                const soundUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${currentNumber}.ogg`;
                setAudioSrc(soundUrl);

                if (isPrimary) {
                    window.history.replaceState({}, '', `/${data.name}`);
                    document.title = `${capitalizeName(data.name)} #${currentNumber} | Interactive Pokédex`;
                }
            } catch (error) {
                console.error('Error fetching Pokemon:', error);
            }
        };

        fetchPokemonData();
    }, [currentNumber, isPrimary]);

    const playPokemonSound = () => {
        if (audioSrc) {
            const audio = new Audio(audioSrc);
            audio.play();
        }
    };

    const toggleSprite = () => setIsFront(f => !f);
    const toggleShinySprite = () => setIsShiny(s => !s);

    const handleLeftArrowClick = () => {
        setCurrentNumber((prevNumber) => (prevNumber === 1 ? 1025 : prevNumber - 1));
    };

    const handleRightArrowClick = () => {
        setCurrentNumber((prevNumber) => (prevNumber === 1025 ? 1 : prevNumber + 1));
    };

    const handleInputChange = (event) => setInputValue(event.target.value);

    const handleInputSubmit = (event) => {
        if (event.key === 'Enter') {
            const value = parseInt(inputValue);
            if (!isNaN(value) && value >= 1 && value <= 1025) {
                setCurrentNumber(value);
                setInputValue('');
            }
        }
    };

    // Only the primary (first) card responds to global arrow-key navigation,
    // so comparing a second Pokemon doesn't fight with arrow presses.
    useEffect(() => {
        if (!isPrimary) return;

        const handleKeyPress = (event) => {
            if (event.key === "ArrowLeft") handleLeftArrowClick();
            else if (event.key === "ArrowRight") handleRightArrowClick();
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isPrimary]);

    const animationClass = isExiting ? 'comparisonExit' : (isEntering ? 'comparisonEnter' : '');

    const slideClass = isExiting ? 'comparisonExit' : (isEntering ? 'comparisonEnter' : '');
    const shuffleClass = (isShuffling && !isEntering && !isExiting) ? 'cardShuffle' : '';

    return (
        <div
            className={`Pokedex ${shuffleClass} ${slideClass}`}
            style={{ background: `rgba(${cardColor}, 0.75)` }}
        >
            {!isPrimary && (
                <button className="closeComparison" onClick={onClose}>✕</button>
            )}

            <div className="PokedexContent">
                <audio src={audioSrc} id={`pokemonCry-${id}`}></audio>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Appearance
                        number={currentNumber.toString()}
                        isFront={isFront}
                        isShiny={isShiny}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 className="pokemonTitleContainer">
                        <p>#{currentNumber}</p>
                        <PokemonName number={currentNumber} />

                        <button className="crySound" onClick={playPokemonSound}>&#128266;</button>
                        <button className="toggleSprite" onClick={toggleSprite}>&#8634;</button>
                        <button className="toggleShinySprite" onClick={toggleShinySprite}>&#10024;</button>
                    </h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0 4px 0' }}>
                    <button className="leftArrow" onClick={handleLeftArrowClick}>&#8592;</button>

                    <input
                        type="number"
                        className="lookup"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleInputSubmit}
                        placeholder="Lookup # (Press Enter)"
                    />

                    <button className="rightArrow" onClick={handleRightArrowClick}>&#8594;</button>
                </div>

                <PokemonBio number={currentNumber} />
                <PokemonHeightWeight number={currentNumber} />

                <h2 className="pokemonTypeContainer">
                    <PokemonType number={currentNumber} setCardColor={setCardColor} />
                </h2>
            </div>
        </div>
    );
}

function App() {
    const [inputValue, setInputValue] = React.useState(''); // can be removed too, unused now
    const [direction, setDirection] = useState(''); // unused, can remove
    const pokemonTypes = [
        "normal", "fire", "water", "grass", "electric", "ice",
        "fighting", "poison", "ground", "flying", "psychic", "bug",
        "rock", "ghost", "dragon", "dark", "steel", "fairy"
    ];

    const [currentRoute, setCurrentRoute] = useState("pokemon");
    const [selectedType, setSelectedType] = useState(null);

    const [initialNumber, setInitialNumber] = useState(1);
    const [primaryNumber, setPrimaryNumber] = useState(1);

    const [isComparing, setIsComparing] = useState(false);
    const [isComparisonClosing, setIsComparisonClosing] = useState(false);
    const [comparisonKey, setComparisonKey] = useState(0);

    const [pokemonSlug, setPokemonSlug] = useState('');

    useEffect(() => {
        const slug = window.location.pathname.replace("/", "").toLowerCase();
        if (!slug) return;

        if (pokemonTypes.includes(slug)) {
            setCurrentRoute("type");
            setSelectedType(slug);
            document.title = `${capitalizeName(slug)} Type | Interactive Pokédex`;
            return;
        }

        const loadPokemon = async () => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
                const data = await response.json();
                setInitialNumber(data.id);
                setCurrentRoute("pokemon");
            } catch (err) {
                console.error(err);
            }
        };

        loadPokemon();
    }, []);

    const [cardColor, setCardColor] = useState('255, 255, 255');

    useEffect(() => {
        document.body.style.backgroundColor = `rgba(${cardColor}, 0.25)`;
        return () => { document.body.style.backgroundColor = ''; };
    }, [cardColor]);

    // Reset comparison when leaving the Pokemon route
    useEffect(() => {
        if (currentRoute !== "pokemon") {
            setIsComparing(false);
            setIsComparisonClosing(false);
        }
    }, [currentRoute]);

    const handleToggleComparison = () => {
        if (isComparing) {
            setIsComparisonClosing(true);
            setTimeout(() => {
                setIsComparing(false);
                setIsComparisonClosing(false);
            }, 400); // match slideOutComparison duration
        } else {
            setComparisonKey(k => k + 1);
            setIsComparing(true);
        }
    };

    const comparisonStartNumber = (primaryNumber % 1025) + 1;

    return (
        <div className={`appLayout ${currentRoute === "pokemon" ? "pokemonRoute" : "typeRoute"}`}>
            {currentRoute === "pokemon" ? (
                <div className={`pokedexRow ${isComparing ? 'comparing' : 'single'}`}>
                    <PokedexCard
                        id="primary"
                        initialNumber={initialNumber}
                        isPrimary={true}
                        onPrimaryColorChange={setCardColor}
                        onPrimaryNumberChange={setPrimaryNumber}
                    />

                    {isComparing && (
                        <PokedexCard
                            key={comparisonKey}
                            id="comparison"
                            initialNumber={comparisonStartNumber}
                            isPrimary={false}
                            isEntering={!isComparisonClosing}
                            isExiting={isComparisonClosing}
                            onClose={handleToggleComparison}
                        />
                    )}
                </div>
            ) : (
                <TypeExplorerView
                    type={selectedType}
                    cardColor={cardColor}
                    onSelectPokemon={(id, name) => {
                        setInitialNumber(id);
                        setCurrentRoute("pokemon");
                        window.history.pushState({}, "", `/${name}`);
                    }}
                />
            )}

            <Sidebar
                cardColor={cardColor}
                setCurrentRoute={setCurrentRoute}
                setSelectedType={setSelectedType}
                currentRoute={currentRoute}
                isComparing={isComparing}
                onToggleComparison={handleToggleComparison}
            />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);