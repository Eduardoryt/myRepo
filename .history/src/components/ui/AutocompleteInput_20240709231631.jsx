import React, { useState, useEffect, useRef } from "react";

export const AutocompleteInput = ({
    index,
    value,
    onChange,
    data,
    recentSuggestions,
    setRecentSuggestions,
    descripcionRefs,
    inputProps,
    placeholder = "Ingrese un valor",
    fieldsToCheck = [], // Array de campos a consultar
}) => {
    const [showHistorial, setShowHistorial] = useState(false);
    const [filteredWords, setFilteredWords] = useState([]);
    const [loading, setLoading] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target) &&
                !event.target.classList.contains('text-sm') &&
                !event.target.classList.contains('cursor-pointer') &&
                !event.target.classList.contains('hover:text-blue-500')
            ) {
                setShowHistorial(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleHistorial = () => {
        setShowHistorial(!showHistorial);
    };

    const handleSelectWord = (selectedWord) => {
        const newValue = value.replace(/\S+$/, selectedWord);
        onChange(newValue);
        setShowHistorial(false);

        if (!recentSuggestions.includes(selectedWord)) {
            if (recentSuggestions.length >= 5) {
                setRecentSuggestions([...recentSuggestions.slice(1), selectedWord]);
            } else {
                setRecentSuggestions([...recentSuggestions, selectedWord]);
            }
        }

        setTimeout(() => {
            if (descripcionRefs.current[index]) {
                descripcionRefs.current[index].focus();
            }
        }, 0);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Tab") {
            if (filteredWords.length > 0) {
                event.preventDefault();
                handleSelectWord(filteredWords[0]);
            }
            setShowHistorial(false);
        }
    };

    const extractWordsFromItem = (item) => {
        return fieldsToCheck.map(field => item[field] || '').filter(Boolean); // Filtra campos vacíos o nulos
    };

    const handleValueChange = (value) => {
        onChange(value);

        if (value.trim() === "") {
            setFilteredWords([]);
            setShowHistorial(false);
        } else {
            setLoading(true); // Indicar carga de sugerencias
            const words = value.toLowerCase().split(' ');
            const lastWord = words[words.length - 1];

            const uniqueWords = data.flatMap(extractWordsFromItem);
            const suggestions = uniqueWords
                .filter(word => word.startsWith(lastWord))
                .slice(0, 5); // Limitar a 5 sugerencias

            setFilteredWords(suggestions);
            setShowHistorial(true);
            setLoading(false); // Finalizar carga de sugerencias
        }
    };

    return (
        <div ref={containerRef}>
            <textarea
                className="p-3 text-black w-full rounded-md resize-none border border-gray-400"
                placeholder={placeholder}
                value={value}
                ref={(el) => (descripcionRefs.current[index] = el)}
                onChange={(e) => handleValueChange(e.target.value)}
                onKeyDown={handleKeyDown}
                {...inputProps}
            />
            {showHistorial && (
                <div
                    className="absolute z-10 bg-white p-3 rounded-md border border-gray-300 shadow-lg mt-2 max-h-40 overflow-y-auto"
                    style={{ width: descripcionRefs.current[index]?.offsetWidth }}
                >
                    {loading ? (
                        <div className="text-sm text-gray-500 mt-1">Cargando sugerencias...</div>
                    ) : filteredWords.length > 0 ? (
                        filteredWords.map((word, wordIndex) => (
                            <div key={wordIndex} className="mb-2">
                                <span
                                    className="text-sm cursor-pointer hover:text-blue-500"
                                    onClick={() => handleSelectWord(word)}
                                >
                                    {word}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-gray-500 mt-1">No hay sugerencias disponibles.</div>
                    )}
                </div>
            )}
        </div>
    );
};
