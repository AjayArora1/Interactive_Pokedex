import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './style.scss';

const typeColors = {
    normal: "rgba(164, 172, 175, 0.2)",
    fire: "rgba(253, 125, 36, 0.2)",
    water: "rgba(69, 146, 196, 0.2)",
    grass: "rgba(155, 204, 80, 0.2)",
    flying: "rgba(61, 199, 239, 0.2)",
    fighting: "rgba(213, 103, 35, 0.2)",
    poison: "rgba(185, 127, 201, 0.2)",
    electric: "rgba(238, 213, 53, 0.2)",
    ground: "rgba(247, 222, 63, 0.2)",
    rock: "rgba(163, 140, 33, 0.2)",
    psychic: "rgba(243, 102, 185, 0.2)",
    ice: "rgba(81, 196, 231, 0.2)",
    bug: "rgba(114, 159, 63, 0.2)",
    ghost: "rgba(123, 98, 163, 0.2)",
    steel: "rgba(158, 183, 184, 0.2)",
    dragon: "rgba(83, 164, 207, 0.2)",
    dark: "rgba(112, 112, 112, 0.2)",
    fairy: "rgba(253, 185, 233, 0.2)"
};


// Pokemon Image.
function Appearance(props) {
    const imageUrl = `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${props.number}.png`;
    return <img src={imageUrl} alt={`Pokemon ${props.number}`} />;
}

function capitalizeName(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function PokemonName(props) {
    const [name, setName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${props.number}`);
                const data = await response.json();

                // Extracting the name from the response and capitalizing all words
                const pokemonName = data.name.split('-').map(capitalizeName).join(' ');

                // Applying text flavors
                const formattedName = pokemonName
                    .replace(/\f/g, '\n')
                    .replace(/\u00ad\n/g, '')
                    .replace(/\u00ad/g, '')
                    .replace(/ -\n/g, ' - ')
                    .replace(/-\n/g, '-')
                    .replace(/\n/g, ' ');

                setName(formattedName);
            } catch (error) {
                console.error('Error fetching Pokemon Name:', error);
            }
        };

        fetchData();
    }, [props.number]);

    return <p>{name}</p>;
}

function PokemonBio(props) {
    const [bio, setBio] = useState('');

    useEffect(() => {
        const fetchBio = async () => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${props.number}`);
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

                setBio(pokemonBio);
            } catch (error) {
                console.error('Error fetching Pokemon Bio:', error);
            }
        };

        fetchBio();
    }, [props.number]);

    return <p className="PokemonBio">{bio}</p>;
}

function PokemonType(props) {
    const [types, setTypes] = useState([]);
    const [hasType, setHasType] = useState(false);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${props.number}`);
                const data = await response.json();

                const pokemonTypes = data.types.map(slot => slot.type.name);
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
            // Find the common type between the Pokemon's types and the typeColors object
            const commonType = types.find(type => typeColors[type]);
            if (commonType) {
                // Set background color based on the common type
                document.body.style.backgroundColor = typeColors[commonType];
            } else {
                // If no common type found, reset to default
                document.body.style.backgroundColor = "";
            }
        } else {
            document.body.style.backgroundColor = ""; // Reset to default
        }
    }, [types, hasType]);

    return (
        <div className="PokemonTypes">
            {types.join(' ').split(' ').map((type, index) => (
                <span key={index} className={`PokemonType ${type}`}>{type}</span>
            ))}
        </div>
    );
}

function App() {
    const [currentNumber, setCurrentNumber] = useState(1); // Initial Pokemon number

    // Function to handle left arrow click
    const handleLeftArrowClick = () => {
        setCurrentNumber((prevNumber) => {
            if (prevNumber === 1) {
                return 1025; // Cycle back to 1025 if reached the beginning
            } else {
                return prevNumber - 1;
            }
        });
    };

    // Function to handle right arrow click
    const handleRightArrowClick = () => {
        setCurrentNumber((prevNumber) => {
            if (prevNumber === 1025) {
                return 1; // Cycle back to 001 if reached the end
            } else {
                return prevNumber + 1;
            }
        });
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <button className="leftArrow" onClick={handleLeftArrowClick}>&lt;</button>
                <Appearance number={currentNumber.toString().padStart(3, '0')} />
                <button className="rightArrow" onClick={handleRightArrowClick}>&gt;</button>
            </div>
            <div>
                <h1 className="pokemonTitleContainer">
                    <p>#{currentNumber}</p>
                    <PokemonName number={currentNumber} />
                </h1>
                <PokemonBio number={currentNumber} />
                <h2 className="pokemonTypeContainer">
                    <PokemonType number={currentNumber} />
                </h2>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);