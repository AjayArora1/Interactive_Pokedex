import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './style.scss';

// Pokemon Image.
function Appearance(props) {
    const imageUrl = `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${props.number}.png`;
    return <img src={imageUrl} alt={`Pokemon ${props.number}`} />;
}

function PokemonName(props) {
    const [name, setName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${props.number}`);
                const data = await response.json();

                // Extracting the name from the response
                const pokemonName = data.name;

                setName(pokemonName);
            } catch (error) {
                console.error('Error fetching Pokemon Name:', error);
            }
        };

        fetchData();
    }, [props.number]);
    return <p>{name}</p>;
}


function App() {
    const [currentNumber, setCurrentNumber] = useState(1); // Initial Pokemon number

    // Function to handle left arrow click
    const handleLeftArrowClick = () => {
        setCurrentNumber((prevNumber) => {
            if (prevNumber === 1) {
                return 151; // Cycle back to 151 if reached the beginning
            } else {
                return prevNumber - 1;
            }
        });
    };

    // Function to handle right arrow click
    const handleRightArrowClick = () => {
        setCurrentNumber((prevNumber) => {
            if (prevNumber === 151) {
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
                <button onClick={handleLeftArrowClick}>Left</button>
                <Appearance number={currentNumber.toString().padStart(3, '0')} />
                <button onClick={handleRightArrowClick}>Right</button>
            </div>
            <div>
                <h1 className="pokemonTitleContainer">
                    <p>#{currentNumber}</p>
                    <PokemonName number={currentNumber} />
                </h1>
            </div>
        </div>
    );

}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
