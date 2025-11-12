#!/usr/bin/env bun
import { cac } from "cac";
import { createRoot, useRenderer } from "@opentui/react";
import { createCliRenderer } from "@opentui/core";
import * as React from "react";
import { TypingTest, useTypingStore } from "./typing-test.tsx";
import { splitIntoWordGroups, WORDS_PER_TEST } from "./utils.ts";

const cli = cac("keysmasher");

function App() {
  const renderer = useRenderer();

  React.useEffect(() => {
    // Hide cursor for cleaner look
    renderer.console.hide();
  }, [renderer]);

  return <TypingTest />;
}

cli
  .command("[text]", "Start typing test with optional custom text")
  .action(async (text?: string) => {
    try {
      // If text content is provided, split it into word groups and initialize store
      if (text && text.trim().length > 0) {
        const contentPages = splitIntoWordGroups(text, WORDS_PER_TEST);
        useTypingStore.getState().initializeContent(contentPages);
      }

      const renderer = await createCliRenderer({
        exitOnCtrlC: false,
      });

      createRoot(renderer).render(<App />);
    } catch (error) {
      console.error("Error starting keysmasher:", error);
      process.exit(1);
    }
  });

cli.help();
cli.version("0.0.1");
cli.parse();
