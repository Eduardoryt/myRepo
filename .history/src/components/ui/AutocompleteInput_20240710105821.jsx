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
  const [loading, setLoading] = useState(false); // Estado de carga

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

    // Ensure the element is available before focusing
    setTimeout(() => {
      if (descripcionRefs.current[index]) {
        // descripcionRefs.current[index].focus();
      }
    }, 0);
  };


  const handleKeyDown = (event) => {
    if (event.key === " ") {
      if (Array.isArray(filteredWords) && filteredWords.length > 0) {
        event.preventDefault();
        handleSelectWord(filteredWords[0]);
      }
      setShowHistorial(false);
    }
  };

  const extractWordsFromData = () => {
    const allWords = data.flatMap(item => {
      return fieldsToCheck.reduce((words, field) => {
        const fieldValue = item[field];
        if (fieldValue) {
          const fieldWords = fieldValue.toLowerCase().split(/\s+/);
          words.push(...fieldWords);
        }
        return words;
      }, []);
    });

    return [...new Set(allWords)]; // Filtra palabras repetidas
  };

  const handleValueChange = async (value) => {
    onChange(value);

    if (value.trim() === "") {
      setFilteredWords([]);
      setShowHistorial(false);
    } else {
      setLoading(true); // Activar estado de carga

      const words = value.toLowerCase().split(/\s+/);
      const lastWord = words[words.length - 1];

      const suggestions = extractWordsFromData().filter(word => word.startsWith(lastWord));
      setFilteredWords(suggestions.slice(0, 5));
      setShowHistorial(true);

      setLoading(false); // Desactivar estado de carga una vez completado el filtro
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <textarea
        className="p-3 text-black w-full rounded-md resize-none border border-gray-400"
        placeholder={placeholder}
        value={value}
        ref={(el) => (descripcionRefs.current[index] = el)}
        onChange={(e) => handleValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
        {...inputProps}
      />
      {loading && <div className="text-sm text-gray-500 mt-1">Cargando...</div>}
      {showHistorial && (
        <div
          className="absolute z-10 bg-white p-3 rounded-md border border-gray-300 shadow-lg mt-2 max-h-40 overflow-y-auto"
          style={{ width: descripcionRefs.current[index]?.offsetWidth }}
        >
          {filteredWords && Array.isArray(filteredWords) && filteredWords.length > 0 ? (
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
