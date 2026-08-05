
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
  
  const currentTitles = useMemo(() => {
    return titles && titles.length > 0 ? titles : [""];
  }, [titles]);


  useEffect(() => {
    const currentTitle = currentTitles[index] || "";
    if (subIndex === currentTitle.length + 1 && !isDeleting) {
      const timer = setTimeout(() => setIsDeleting(true), delay);
      return () => clearTimeout(timer);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % currentTitles.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, currentTitles, delay]);
  
  useEffect(() => {
    const currentTitle = currentTitles[index] || "";
    setText(currentTitle.substring(0, subIndex));
  }, [subIndex, index, currentTitles]);


  return (
    <span>
      {text}
      <span className="animate-ping">|</span>
    </span>
  );
}
