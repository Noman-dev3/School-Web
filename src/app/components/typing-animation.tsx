"use client";

import { useState, useEffect, useMemo } from 'react';

type TypingAnimationProps = {
  titles: string[];
};

export default function TypingAnimation({ titles }: TypingAnimationProps) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');

  const typingSpeed = 100;
  const deletingSpeed = 50;
  const delay = 2000;

  useEffect(() => {
    if (subIndex === titles[index].length + 1 && !isDeleting) {
      setTimeout(() => setIsDeleting(true), delay);
      return;
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % titles.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, titles, delay]);
  
  useEffect(() => {
      setText(titles[index].substring(0, subIndex));
  }, [subIndex, index, titles]);


  return (
    <span>
      {text}
      <span className="animate-ping">|</span>
    </span>
  );
}
