import { useState, useRef, useEffect } from 'react';
import wordsText from './assets/usable_words.txt?raw';

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }

  addWord(word: string) {
    let node: TrieNode = this;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEndOfWord = true;
  }
}

function App() {
  const [n, setN] = useState(4);
  const [matrix, setMatrix] = useState<string[][]>(
    Array(4)
      .fill(null)
      .map(() => Array(4).fill(''))
  );
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [rootNode, setRootNode] = useState<TrieNode>(new TrieNode());
  const [foundWords, setFoundWords] = useState<
    { word: string; path: [number, number][] }[]
  >([]);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const dirs = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
  ];

  const dfs = (
    row: number,
    col: number,
    trie: TrieNode,
    visited: boolean[][],
    currentWord: string = '',
    currentPath: [number, number][] = []
  ): { word: string; path: [number, number][] }[] => {
    let ret: { word: string; path: [number, number][] }[] = [];

    const cellValue = matrix[row][col];
    if (!cellValue || !trie.children.has(cellValue)) {
      return ret;
    }

    const nextTrie = trie.children.get(cellValue)!;
    const newWord = currentWord + cellValue;
    const newPath: [number, number][] = [
      ...currentPath,
      [row, col] as [number, number],
    ];

    if (nextTrie.isEndOfWord) {
      ret.push({ word: newWord, path: newPath });
    }

    visited[row][col] = true;

    for (const [dx, dy] of dirs) {
      let newRow = row + dx;
      let newCol = col + dy;
      if (newRow < 0 || newRow >= n || newCol < 0 || newCol >= n) continue;
      if (visited[newRow][newCol]) continue;

      const results = dfs(newRow, newCol, nextTrie, visited, newWord, newPath);
      ret.push(...results);
    }

    visited[row][col] = false;
    return ret;
  };

  const runDfs = (trie: TrieNode) => {
    let ret: { word: string; path: [number, number][] }[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let visited = Array(n)
          .fill(false)
          .map(() => Array(n).fill(false));
        ret.push(...dfs(i, j, trie, visited, '', []));
      }
    }
    return ret;
  };

  useEffect(() => {
    // Read the file line by line
    const lines = wordsText.split('\n').map((line) => line.trim());
    setWords(lines);
    console.log(`Loaded ${lines.length} words`);
  }, []);

  useEffect(() => {
    const trie = new TrieNode();
    for (const word of words) {
      trie.addWord(word);
    }
    setRootNode(trie);
  }, [words]);

  useEffect(() => {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (!matrix[i][j]) return;
      }
    }
    const results = runDfs(rootNode);
    const wordMap = new Map<
      string,
      { word: string; path: [number, number][] }
    >();
    for (const result of results) {
      if (!wordMap.has(result.word)) {
        wordMap.set(result.word, result);
      }
    }
    const uniqueResults = Array.from(wordMap.values());
    uniqueResults.sort((a, b) => b.word.length - a.word.length);
    setFoundWords(uniqueResults);
  }, [matrix]);

  const handleCellChange = (row: number, col: number, value: string) => {
    // If cell already has content, extract only the new character
    const currentValue = matrix[row][col];
    let newValue = value.toUpperCase().replace(/[^A-Z]/g, '');

    // If cell had content and new value is longer, take only the last character(s)
    if (currentValue && newValue.length > currentValue.length) {
      newValue = newValue.slice(-1);
    }

    let letter = newValue.slice(0, 1);

    // Convert Q to QU
    if (letter === 'Q') {
      letter = 'QU';
    }

    const newMatrix = matrix.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? letter : c))
    );
    setMatrix(newMatrix);

    if (letter) {
      // Move to next cell
      let nextRow = row;
      let nextCol = col + 1;

      if (nextCol >= n) {
        nextRow = row + 1;
        nextCol = 0;
      }

      if (nextRow < n) {
        setTimeout(() => {
          inputRefs.current[nextRow]?.[nextCol]?.focus();
        }, 0);
      } else {
        // At the end, blur
        setTimeout(() => {
          inputRefs.current[row]?.[col]?.blur();
        }, 0);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    if (e.key === 'Backspace' && !matrix[row][col]) {
      // Move to previous cell on backspace if current is empty
      let prevRow = row;
      let prevCol = col - 1;

      if (prevCol < 0) {
        prevRow = row - 1;
        prevCol = n - 1;
      }

      if (prevRow >= 0) {
        e.preventDefault();
        setTimeout(() => {
          inputRefs.current[prevRow]?.[prevCol]?.focus();
        }, 0);
      }
    }
  };

  useEffect(() => {
    const newN = Math.max(1, Math.min(10, n));
    setMatrix(
      Array(newN)
        .fill(null)
        .map(() => Array(newN).fill(''))
    );
    inputRefs.current = Array(newN)
      .fill(null)
      .map(() => Array(newN).fill(null));
  }, [n]);

  return (
    <div className='min-h-screen p-8 flex flex-col items-center  w-full'>
      <div className='pt-40'>
        <div className='mb-6 flex items-center justify-center gap-4'>
          <label className='text-lg font-semibold'>Grid Size (n):</label>
          <input
            type='number'
            min='1'
            max='10'
            value={n}
            onChange={(e) =>
              setN(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))
            }
            className='w-20 px-3 py-2 border border-gray-300 rounded-md text-center'
          />
        </div>

        <div
          className='grid gap-2 mx-auto relative'
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {matrix.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              const hoveredWordData = foundWords.find(
                (w) => w.word === hoveredWord
              );
              const pathIndex = hoveredWordData?.path.findIndex(
                ([r, c]) => r === rowIdx && c === colIdx
              );
              const showOverlay = pathIndex !== undefined && pathIndex !== -1;

              return (
                <div key={`${rowIdx}-${colIdx}`} className='relative'>
                  <input
                    ref={(el) => {
                      if (!inputRefs.current[rowIdx]) {
                        inputRefs.current[rowIdx] = [];
                      }
                      inputRefs.current[rowIdx][colIdx] = el;
                    }}
                    type='text'
                    value={cell}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      handleCellChange(rowIdx, colIdx, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                    maxLength={2}
                    className='w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-md focus:border-green-500 focus:outline-none uppercase'
                  />
                  {showOverlay && (
                    <>
                      <span className='text-white font-bold text-2xl absolute inset-0 flex items-center justify-center z-20'>
                        {pathIndex! + 1}
                      </span>
                      <div className='absolute inset-0 flex items-center justify-center bg-green-500 opacity-80 rounded-md pointer-events-none z-10'></div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className='pt-8'>
        <h2 className='text-2xl font-bold mb-4'>Words founds</h2>
        <div className='flex gap-8 flex-wrap justify-center'>
          {Array.from(new Set(foundWords.map((w) => w.word.length)))
            .sort((a, b) => b - a)
            .map((length) => {
              const wordsOfLength = foundWords.filter(
                (w) => w.word.length === length
              );
              return (
                <div key={length} className='flex flex-col'>
                  <h3 className='text-lg font-semibold mb-2'>
                    {length} letters
                  </h3>
                  <ul className='space-y-1'>
                    {wordsOfLength.map((wordData) => (
                      <li
                        key={wordData.word}
                        onMouseEnter={() => setHoveredWord(wordData.word)}
                        onMouseLeave={() => setHoveredWord(null)}
                        className='cursor-pointer hover:text-blue-500'
                      >
                        {wordData.word}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default App;
