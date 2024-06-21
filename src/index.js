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

const delayAndUpdateCurrentNumber = async (delay) => {
    await new Promise(resolve => setTimeout(resolve, delay));
};

// Pokemon Image.
function Appearance(props) {
    const [transitionClass, setTransitionClass] = useState(''); // State to manage transition classes

    useEffect(() => {
        // Determine the direction of transition
        let exitClass = '';
        let entranceClass = '';

        if (props.direction === 'left') {
            exitClass = 'slideOutLeft';
            entranceClass = 'slideInRight';
        } else if (props.direction === 'right') {
            exitClass = 'slideOutRight';
            entranceClass = 'slideInLeft';
        }

        // Apply exit transition class
        setTransitionClass(exitClass);

        // Reset transition after a short delay (adjust as needed)
        const timeout = setTimeout(() => {
            setTransitionClass('');
        }, 250); // Adjust timing as per your transition needs

        // Set entrance transition class after exit completes
        const entranceTimeout = setTimeout(() => {
            setTransitionClass(entranceClass);
        }, 250); // Ensure entrance starts shortly after exit begins

        return () => {
            clearTimeout(timeout);
            clearTimeout(entranceTimeout);
        };
    }, [props.direction, props.number]);

    const imageUrl = props.isShiny
        ? (props.isFront
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${props.number}.png`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${props.number}.png`)
        : (props.isFront
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${props.number}.png`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${props.number}.png`);

    return (
        <img
            src={imageUrl}
            alt={`Pokemon ${props.number}`}
            className={`pokemonImage ${transitionClass}`}
        />
    );
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
    const [currentNumber, setCurrentNumber] = React.useState(1); // Initial Pokemon number
    const [inputValue, setInputValue] = React.useState('');
    const [audioSrc, setAudioSrc] = useState('');
    const [isFront, setIsFront] = useState(true); // State to toggle between front and back sprites
    const [isShiny, setIsShiny] = useState(false); // State to toggle between shiny and non-shiny sprites
    const [direction, setDirection] = useState('');

    useEffect(() => {
        const fetchPokemonSound = async () => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentNumber}`);
                await response.json();
                const soundUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${currentNumber}.ogg`;
                setAudioSrc(soundUrl);
            } catch (error) {
                console.error('Error fetching Pokemon sound:', error);
            }
        };

        fetchPokemonSound();
    }, [currentNumber]);

    const playPokemonSound = () => {
        if (audioSrc) {
            const audio = new Audio(audioSrc);
            audio.play();
        }
    };

    const toggleSprite = () => {
        setIsFront(!isFront);
    };

    const toggleShinySprite = () => {
        setIsShiny(!isShiny);
    };

    const handleLeftArrowClick = () => {
        setDirection('right'); // Slide out to the right

        delayAndUpdateCurrentNumber(150).then(() => {
            setCurrentNumber((prevNumber) => {
                if (prevNumber === 1) {
                    return 1025; // Cycle back to 1025 if reached the beginning
                } else {
                    return prevNumber - 1;
                }
            });
        });
    };

    const handleRightArrowClick = () => {
        setDirection('left'); // Slide out to the left

        delayAndUpdateCurrentNumber(150).then(() => {
            setCurrentNumber((prevNumber) => {
                if (prevNumber === 1025) {
                    return 1; // Cycle back to 001 if reached the end
                } else {
                    return prevNumber + 1;
                }
            });
        });
    };

    // Function to handle input change
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    // Function to handle input submission
    const handleInputSubmit = (event) => {
        if (event.key === 'Enter') {
            const value = parseInt(inputValue);
            if (!isNaN(value) && value >= 1 && value <= 1025) {
                setCurrentNumber(value);
                setInputValue('');
            }
        }
    };

    React.useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === "ArrowLeft") {
                handleLeftArrowClick();
            } else if (event.key === "ArrowRight") {
                handleRightArrowClick();
            }
        };

        // Add event listener for keydown event
        document.addEventListener('keydown', handleKeyPress);

        // Clean up the event listener when component unmounts
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []); // Empty dependency array to ensure effect runs only once

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <audio src={audioSrc} id="pokemonCry"></audio>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <button className="leftArrow" onClick={handleLeftArrowClick}>&#8592;</button>
                <Appearance
                    number={currentNumber.toString()}
                    isFront={isFront}
                    isShiny={isShiny}
                    direction={direction}
                />
                <button className="rightArrow" onClick={handleRightArrowClick}>&#8594;</button>
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <h1 className="pokemonTitleContainer">
                    <p>#{currentNumber}</p>
                    <PokemonName number={currentNumber} />
                    <button className='crySound' onClick={playPokemonSound}>&#128266;</button>
                    <button className='toggleSprite' onClick={toggleSprite}>&#8634;</button>
                    <button className='toggleShinySprite' onClick={toggleShinySprite}>&#10024;</button>
                </h1>
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <input
                    type="number"
                    className="lookup"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputSubmit}
                    placeholder="Lookup # (Press Enter)"
                />
            </div>
            <PokemonBio number={currentNumber} />
            <h2 className="pokemonTypeContainer">
                <PokemonType number={currentNumber} />
            </h2>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);