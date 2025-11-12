import * as React from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { create } from "zustand";
import { getRandomWords, calculateWPM, calculateAccuracy } from "./utils.ts";

interface TypingState {
  words: string[];
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
const LOGO = "𝐤𝐞𝐲𝐬𝐦 𝐚𝐬𝐡𝐞𝐫";

const useTypingStore = create<TypingState>((set, get) => ({
  words: getRandomWords(25),
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
  const { width } = useTerminalDimensions();
  const [currentTime, setCurrentTime] = React.useState(Date.now());

  const state = useTypingStore();
  const { words, inputText, errors, startTime, endTime, isFinished, totalCharsTyped, correctChars, pausedTime, pauseStartTime } = state;

  const fullText = words.join(" ");
  const currentIndex = inputText.length;

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
        // Alt/Option/Meta+Backspace: delete entire word
        if (key.option || key.meta) {
          let newText = state.inputText;
          const originalLength = newText.length;

          // Trim trailing spaces first
          newText = newText.trimEnd();

          // Find the last space (delete one word back from cursor)
          const lastSpaceIndex = newText.lastIndexOf(" ");
          if (lastSpaceIndex >= 0) {
            // Keep everything up to and including the space
            newText = newText.slice(0, lastSpaceIndex + 1);
          } else {
            // No space found, delete everything
            newText = "";
          }

          // Remove all error markers for deleted characters
          const newErrors = new Set(state.errors);
          for (let i = newText.length; i < originalLength; i++) {
            newErrors.delete(i);
          }

          useTypingStore.setState({
            inputText: newText,
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
            errors: newErrors
          });
          state.recordKeyPress();
        }
      }
      return;
    }

    // Handle character input
    if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
      const currentIdx = state.inputText.length;
      const expectedChar = fullText[currentIdx];
      const newText = state.inputText + key.sequence;

      let newCorrectChars = state.correctChars;
      let newTotalChars = state.totalCharsTyped + 1;

      if (key.sequence === expectedChar) {
        newCorrectChars++;
      } else {
        state.addError(currentIdx);
      }

      useTypingStore.setState({
        inputText: newText,
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

      // Only show block background for cursor position, never for typed characters
      if (isCurrent) {
        // Show cursor with block background (next character to type)
        chars.push(
          <span key={i} style={{ fg: "#000000", bg: "#ffd43b" }}>
            {char}
          </span>
        );
      } else {
        // All other characters (typed or untyped) have transparent background
        let fg = "#666666"; // untyped (dim gray)

        if (isTyped) {
          if (isError) {
            fg = "#ff6b6b"; // error (red)
          } else {
            fg = "#e0e0e0"; // typed correctly (very light gray)
          }
        }

        chars.push(
          <span key={i} style={{ fg, bg: "transparent" }}>
            {char}
          </span>
        );
      }
    }

    // Add cursor at the end if we've typed all characters
    if (currentIndex >= fullText.length) {
      chars.push(
        <span key={fullText.length} style={{ fg: "#000000", bg: "#ffd43b" }}>
          {" "}
        </span>
      );
    }

    return chars;
  };

  // Results screen
  if (isFinished) {
    // Note: Final WPM uses raw elapsed time without subtracting paused time.
    // This is intentional - we only exclude idle time from the live timer display,
    // but final results should reflect actual wall-clock time from start to finish.
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
          padding: 3
        }}>
          <box style={{ flexDirection: "column", width: 30, marginBottom: 2 }}>
            <box style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <text style={{ fg: "#ffd43b" }}>WPM</text>
              <text style={{ fg: "#ffffff" }}><strong>{finalWPM}</strong></text>
            </box>

            <box style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <text style={{ fg: "#ffd43b" }}>Accuracy</text>
              <text style={{ fg: "#ffffff" }}><strong>{finalAccuracy}%</strong></text>
            </box>

            <box style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <text style={{ fg: "#ffd43b" }}>Time</text>
              <text style={{ fg: "#ffffff" }}><strong>{elapsedSeconds.toFixed(1)}s</strong></text>
            </box>

            <box style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <text style={{ fg: "#ffd43b" }}>Characters</text>
              <text style={{ fg: "#ffffff" }}><strong>{correctChars}/{totalCharsTyped}</strong></text>
            </box>
          </box>

          <text style={{ fg: "#868e96", marginBottom: 1 }}>
            Press <strong>Enter</strong> to try again
          </text>

          <text style={{ fg: "#666666" }}>{LOGO}</text>
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
      alignItems: "center",
      backgroundColor: "#000000"
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
            <text style={{ fg: "#666666" }}>{LOGO}</text>
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
