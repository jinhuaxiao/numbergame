import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, Star } from 'lucide-react';

const KidsNumberKeyboard = () => {
  const [currentNumber, setCurrentNumber] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [celebration, setCelebration] = useState(false);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  const generateQuestion = useCallback(() => {
    const operation = Math.random() < 0.5 ? '+' : '-';
    let a, b;
    if (operation === '+') {
      a = Math.floor(Math.random() * 5) + 1;
      b = Math.floor(Math.random() * (10 - a)) + 1;
    } else {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * a) + 1;
    }
    setQuestion(`${a} ${operation} ${b} = ?`);
    setAnswer((operation === '+' ? a + b : a - b).toString());
    setCurrentNumber('');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAudioElements({
        correctSound: new Audio('/audio/correct.mp3'),
        incorrectSound: new Audio('/audio/incorrect.mp3'),
        buttonSound: new Audio('/audio/button.mp3')
      });
    }
    generateQuestion();
  }, [generateQuestion]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key >= '0' && event.key <= '9') {
        handleInput(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const playSound = (sound: string) => {
    if (audioElements[sound]) {
      audioElements[sound].currentTime = 0;
      audioElements[sound].play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const handleInput = (num: string) => {
    playSound('buttonSound');
    setCurrentNumber(prevNumber => prevNumber + num);
  };

  const checkAnswer = useCallback((inputAnswer: string) => {
    console.log('Input Answer:', inputAnswer, 'Correct Answer:', answer);
    if (inputAnswer.trim() === answer.trim()) {
      playSound('correctSound');
      setMessage('太棒了！回答正确！');
      setScore(prevScore => prevScore + 1);
      setCelebration(true);
      setTimeout(() => {
        setCelebration(false);
        setMessage('');
        generateQuestion();
      }, 2000);
    } else if (inputAnswer.length >= answer.length) {
      playSound('incorrectSound');
      setMessage('再试一次！');
      setTimeout(() => {
        setCurrentNumber('');
        setMessage('');
      }, 1000);
    }
  }, [answer, generateQuestion, playSound]);

  useEffect(() => {
    checkAnswer(currentNumber);
  }, [currentNumber, checkAnswer]);

  const numberButtons = Array.from({ length: 10 }, (_, i) => (
    <button
      key={i}
      onClick={() => handleInput(i.toString())}
      className={`w-12 h-12 sm:w-16 sm:h-16 m-1 sm:m-2 text-xl sm:text-2xl font-bold rounded-full shadow-lg transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
        celebration ? 'animate-bounce' : ''
      }`}
      style={{
        backgroundColor: `hsl(${i * 36}, 70%, 50%)`,
        color: i > 5 ? 'white' : 'black',
      }}
    >
      {i}
    </button>
  ));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 p-4 sm:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-white shadow-text animate-pulse">趣味数字游戏</h1>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl relative overflow-hidden w-full max-w-lg">
        {celebration && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl sm:text-6xl animate-spin text-yellow-400">
              <Star />
            </div>
          </div>
        )}
        <div className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-center">{question}</div>
        <div className={`text-lg sm:text-xl mb-3 sm:mb-4 text-center transition-all duration-300 ${message ? 'opacity-100' : 'opacity-0'}`}>
          {message}
        </div>
        <div className="flex flex-wrap justify-center max-w-full">
          {numberButtons}
        </div>
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-lg sm:text-xl">你的答案: <span className="font-bold text-xl sm:text-2xl">{currentNumber}</span></p>
          <p className="text-lg sm:text-xl mt-2">得分: <span className="font-bold text-xl sm:text-2xl animate-pulse">{score}</span></p>
        </div>
      </div>
      <div className="mt-6 sm:mt-8 flex items-center text-white">
        <Keyboard className="mr-2 animate-bounce" />
        <span>使用键盘数字键也可以哦！</span>
      </div>
    </div>
  );
};

export default KidsNumberKeyboard;