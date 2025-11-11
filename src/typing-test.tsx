import * as React from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import type { TextareaRenderable } from "@opentui/core";
import { create } from "zustand";
import { getRandomWords, calculateWPM, calculateAccuracy } from "./utils.ts";

interface TypingState {
  words: string[];
  currentIndex: number;
  inputText: string;
  errors: Set<number>;
  startTime: number | null;
  endTime: number | null;
  isFinished: boolean;
  totalCharsTyped: number;
  correctChars: number;
  lastKeyPressTime: number | null;
  pausedTime: number;
  pauseStartTime: number | null;
  resetTest: () => void;
  setInputText: (text: string) => void;
  addError: (index: number) => void;
  startTyping: () => void;
  finishTyping: () => void;
  recordKeyPress: () => void;
}

const IDLE_THRESHOLD = 2000; // 2 seconds - pause timer if no typing for this long

const useTypingStore = create<TypingState>((set, get) => ({
  words: getRandomWords(25),
  currentIndex: 0,
  inputText: "",
  errors: new Set(),
  startTime: null,
  endTime: null,
  isFinished: false,
  totalCharsTyped: 0,
  correctChars: 0,
  lastKeyPressTime: null,
  pausedTime: 0,
  pauseStartTime: null,
  resetTest: () => set({
    words: getRandomWords(40),
    currentIndex: 0,
    inputText: "",
    errors: new Set(),
    startTime: null,
    endTime: null,
    isFinished: false,
    totalCharsTyped: 0,
    correctChars: 0,
    lastKeyPressTime: null,
    pausedTime: 0,
    pauseStartTime: null,
  }),
  setInputText: (text: string) => set({ inputText: text }),
  addError: (index: number) => set((state) => ({
    errors: new Set([...state.errors, index])
  })),
  startTyping: () => set({ startTime: Date.now(), lastKeyPressTime: Date.now() }),
  finishTyping: () => set({ endTime: Date.now(), isFinished: true }),
  recordKeyPress: () => {
    const now = Date.now();
    const state = get();

    // If we were paused, add the pause duration to total paused time
    if (state.pauseStartTime !== null) {
      const pauseDuration = now - state.pauseStartTime;
      set({
        pausedTime: state.pausedTime + pauseDuration,
        pauseStartTime: null,
        lastKeyPressTime: now
      });
    } else {
      set({ lastKeyPressTime: now });
    }
  },
}));

export function TypingTest() {
  const { width, height } = useTerminalDimensions();
  const [currentTime, setCurrentTime] = React.useState(Date.now());
  const textareaRef = React.useRef<TextareaRenderable>(null);

  const words = useTypingStore((s) => s.words);
  const currentIndex = useTypingStore((s) => s.currentIndex);
  const inputText = useTypingStore((s) => s.inputText);
  const errors = useTypingStore((s) => s.errors);
  const startTime = useTypingStore((s) => s.startTime);
  const endTime = useTypingStore((s) => s.endTime);
  const isFinished = useTypingStore((s) => s.isFinished);
  const totalCharsTyped = useTypingStore((s) => s.totalCharsTyped);
  const correctChars = useTypingStore((s) => s.correctChars);
  const lastKeyPressTime = useTypingStore((s) => s.lastKeyPressTime);
  const pausedTime = useTypingStore((s) => s.pausedTime);
  const pauseStartTime = useTypingStore((s) => s.pauseStartTime);

  const fullText = words.join(" ");

  // Update current time every 100ms for live WPM and handle idle detection
  React.useEffect(() => {
    if (startTime && !endTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        setCurrentTime(now);

        // Check if user has been idle for too long
        const state = useTypingStore.getState();
        if (state.lastKeyPressTime && !state.pauseStartTime) {
          const idleTime = now - state.lastKeyPressTime;
          if (idleTime >= IDLE_THRESHOLD) {
            // Start pause timer
            useTypingStore.setState({
              pauseStartTime: state.lastKeyPressTime + IDLE_THRESHOLD
            });
          }
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, endTime]);

  useKeyboard((key) => {
    const state = useTypingStore.getState();

    if (state.isFinished) {
      if (key.name === "return") {
        state.resetTest();
      }
      return;
    }

    // Start typing on first keypress
    if (!state.startTime && key.name !== "return" && key.name !== "escape") {
      state.startTyping();
    }

    if (key.name === "escape" || (key.ctrl && key.name === "c")) {
      process.exit(0);
    }

    if (key.name === "return") {
      return;
    }

    // Handle backspace (with optional word deletion modifier)
    // TODO: Maybe opentui will implement alt+backspace word deletion natively someday
    if (key.name === "backspace") {
      if (state.inputText.length > 0) {
        // Alt/Option+Backspace: delete entire word
        if (key.option) {
          let newText = state.inputText;
          const originalLength = newText.length;

          // Trim trailing spaces first
          newText = newText.trimEnd();

          // Find the last space or beginning of string
          const lastSpaceIndex = newText.lastIndexOf(" ");
          if (lastSpaceIndex >= 0) {
            newText = newText.slice(0, lastSpaceIndex + 1);
          } else {
            newText = "";
          }

          // Remove all error markers for deleted characters
          const newErrors = new Set(state.errors);
          for (let i = newText.length; i < originalLength; i++) {
            newErrors.delete(i);
          }

          useTypingStore.setState({
            inputText: newText,
            currentIndex: newText.length,
            errors: newErrors
          });
          state.recordKeyPress();
        } else {
          // Regular backspace: delete one character
          const deletedIndex = state.inputText.length - 1;
          const newText = state.inputText.slice(0, -1);

          // Remove error if the deleted character was marked as error
          const newErrors = new Set(state.errors);
          newErrors.delete(deletedIndex);

          useTypingStore.setState({
            inputText: newText,
            currentIndex: newText.length,
            errors: newErrors
          });
          state.recordKeyPress();
        }
      }
      return;
    }

    // Handle character input
    if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
      const newIndex = state.currentIndex;
      const expectedChar = fullText[newIndex];
      const newText = state.inputText + key.sequence;

      let newCorrectChars = state.correctChars;
      let newTotalChars = state.totalCharsTyped + 1;

      if (key.sequence === expectedChar) {
        newCorrectChars++;
      } else {
        state.addError(newIndex);
      }

      useTypingStore.setState({
        inputText: newText,
        currentIndex: newIndex + 1,
        totalCharsTyped: newTotalChars,
        correctChars: newCorrectChars,
      });

      state.recordKeyPress();

      // Check if finished
      if (newText.length >= fullText.length) {
        state.finishTyping();
      }
    }
  });

  // Calculate stats
  let elapsedTime = 0;
  if (startTime) {
    const rawElapsed = (endTime || currentTime) - startTime;
    let totalPausedTime = pausedTime;

    // Add current pause if we're paused right now
    if (pauseStartTime && !endTime) {
      totalPausedTime += currentTime - pauseStartTime;
    }

    elapsedTime = rawElapsed - totalPausedTime;
  }
  const elapsedSeconds = elapsedTime / 1000;
  const wpm = calculateWPM(correctChars, elapsedSeconds);
  const accuracy = calculateAccuracy(correctChars, totalCharsTyped);

  // Render the text with colors
  const renderText = () => {
    const chars: React.ReactNode[] = [];

    for (let i = 0; i < fullText.length; i++) {
      const char = fullText[i];
      const isTyped = i < inputText.length;
      const isError = errors.has(i);
      const isCurrent = i === currentIndex;

      let fg = "#333333"; // untyped (very dim)

      if (isTyped) {
        if (isError) {
          fg = "#ff6b6b"; // error (red)
        } else {
          fg = "#e0e0e0"; // typed correctly (very light gray)
        }
      }

      if (isCurrent) {
        // Show cursor with bright color
        chars.push(
          <span key={i} style={{ fg: "#ffffff" }}>
            {char}
          </span>
        );
      } else {
        chars.push(
          <span key={i} style={{ fg }}>
            {char}
          </span>
        );
      }
    }

    return chars;
  };

  // Results screen
  if (isFinished) {
    const finalWPM = calculateWPM(correctChars, (endTime! - startTime!) / 1000);
    const finalAccuracy = calculateAccuracy(correctChars, totalCharsTyped);

    return (
    <box style={{ 
      flexDirection: "column", 
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000000"
    }}>
        <box style={{
          flexDirection: "column",
          alignItems: "center",
          border: true,
          borderStyle: "double",
          padding: 3,
          minWidth: 50
        }}>
          <text style={{ fg: "#51cf66", marginBottom: 2 }}>
            <strong>Test Complete!</strong>
          </text>

          <box style={{ flexDirection: "column", gap: 1, marginBottom: 2 }}>
            <text>
              <span style={{ fg: "#ffd43b" }}>WPM: </span>
              <strong style={{ fg: "#ffffff" }}>{finalWPM}</strong>
            </text>

            <text>
              <span style={{ fg: "#ffd43b" }}>Accuracy: </span>
              <strong style={{ fg: "#ffffff" }}>{finalAccuracy}%</strong>
            </text>

            <text>
              <span style={{ fg: "#ffd43b" }}>Time: </span>
              <strong style={{ fg: "#ffffff" }}>{elapsedSeconds.toFixed(1)}s</strong>
            </text>

            <text>
              <span style={{ fg: "#ffd43b" }}>Characters: </span>
              <strong style={{ fg: "#ffffff" }}>{correctChars}/{totalCharsTyped}</strong>
            </text>
          </box>

          <text style={{ fg: "#868e96", marginTop: 1 }}>
            Press <strong>Enter</strong> to try again
          </text>
        </box>
      </box>
    );
  }

  // Calculate text wrapping
  const maxTextWidth = Math.min(width - 8, 80);

  return (
    <box style={{
      flexDirection: "column",
      height: "100%",
      justifyContent: "center",
      alignItems: "center"
    }}>
      {/* Main typing area - centered */}
      <box style={{
        flexDirection: "column",
        alignItems: "center"
      }}>
        <box style={{
          width: maxTextWidth,
          paddingLeft: 2,
          paddingRight: 2,
          paddingTop: 2,
          paddingBottom: 0,
          justifyContent: "center"
        }}>
          <text style={{ flexWrap: "wrap" }}>
            {renderText()}
          </text>
        </box>

        {/* Stats bar - row layout with minWidth to prevent layout shift */}
        <box style={{ flexDirection: "row", alignItems: "center", marginTop: 1 }}>
          <box style={{ minWidth: 10 }}>
            <text style={{ fg: "#666666" }}>𝐤𝐞𝐲𝐬𝐦 𝐚𝐬𝐡𝐞𝐫</text>
          </box>
          <text style={{ fg: "#666666" }}>  •  </text>
          <box style={{ minWidth: 7 }}>
            <text style={{ fg: "#666666" }}>{wpm} wpm</text>
          </box>
          <text style={{ fg: "#666666" }}>  •  </text>
          <box style={{ minWidth: 6 }}>
            <text style={{ fg: "#666666" }}>{accuracy}% acc</text>
          </box>
          <text style={{ fg: "#666666" }}>  •  </text>
          <box style={{ minWidth: 6 }}>
            <text style={{ fg: "#666666" }}>{elapsedSeconds.toFixed(1)}s</text>
          </box>
        </box>
      </box>
    </box>
  );
}
