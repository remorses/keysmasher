# keysmasher

A terminal-based typing speed test inspired by MonkeyType. Test your typing speed and accuracy right from your command line!

## Features

- 🎯 Real-time WPM (Words Per Minute) calculation
- 📊 Live accuracy tracking
- 🎨 Beautiful terminal UI with color-coded feedback
- ⚡ Instant error highlighting (errors shown in red)
- 🔄 Quick restart with Enter key
- 📈 Detailed results screen with stats

## Installation

```bash
bunx keysmasher
```

Or install globally:

```bash
bun install -g keysmasher
```

## Usage

Simply run:

```bash
keysmasher
```

Or practice with your own text:

```bash
keysmasher "your custom text here"
```

### Advanced Usage

Practice with content from files:

```bash
# Practice with content from a file
keysmasher "$(cat mytext.txt)"

# Practice with a random markdown file
keysmasher "$(find . -name "*.md" | head -1 | xargs cat)"

# Practice with your code
keysmasher "$(cat src/index.ts)"

# Practice with documentation
keysmasher "$(cat README.md)"

# Practice with specific lines from a file
keysmasher "$(head -n 10 article.txt)"
```

The text will be automatically split into groups of 25 words. Press Enter after completing each group to continue to the next one.

### Controls

- Start typing to begin the test
- Typed text appears in lighter gray
- Errors are highlighted in red
- Press `Backspace` to delete a character
- Press `Alt+Backspace` (Option+Backspace on Mac) to delete an entire word
- Press `ESC` or `Ctrl+C` to quit
- Press `Enter` after completion to start a new test

## Development

```bash
# Install dependencies
bun install

# Run locally
bun run cli
```

## How It Works

The test displays 25 words at a time (either random words or your custom text). As you type:

- Untyped characters appear in very dim gray (#333333)
- Correctly typed characters appear in very light gray (#e0e0e0)
- Incorrect characters are shown in red (#ff6b6b)
- Your cursor position is highlighted with bright white (#ffffff)
- All content is centered for optimal focus
- Stats appear below in a single line: `keysmasher • 45 wpm • 98% acc • 12.3s`
- When using custom text, pagination info shows your progress: `2/5` (page 2 of 5)
- WPM is calculated using the standard formula: (characters / 5) / minutes
- Accuracy is calculated as: (correct characters / total typed) × 100

## License

MIT
