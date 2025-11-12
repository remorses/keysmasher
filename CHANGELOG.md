# Changelog

## 0.1.7

### UI Improvements
- Enhanced block cursor with yellow/gold color (#ffd43b) for better visibility
- Cursor now shows at end of text when all characters are typed
- Improved cursor visibility during typing with more prominent background color

## 0.1.6

### UI Improvements
- Changed cursor from underline to block style for better visibility
- Cursor now displays as solid white block with black text instead of underline

## 0.1.5

### Code Quality
- Removed unused imports and variables (TextareaRenderable, height, textareaRef)
- Removed redundant `currentIndex` state - now computed directly from `inputText.length`
- Simplified Zustand usage: changed from multiple individual selectors to single store access
- Created `LOGO` constant for easy branding updates across the app

### UI Improvements
- Increased untyped text visibility from #333333 to #666666 for better readability
- Redesigned results screen with clean table layout (left/right aligned columns, no vertical spacing)
- Removed "Test Complete!" heading from results screen
- Added logo to results screen

### Bug Fixes
- Fixed Alt/Option/Meta+Backspace word deletion to keep space after previous word
- Added both `key.option` and `key.meta` support for word deletion on backspace
- Added comment documenting final WPM calculation behavior

## 0.1.4

- Changed cursor from background to underline style for cleaner appearance
- Cursor now shows as white text with underline instead of inverted background

## 0.1.3

- Explicitly set transparent background for all non-cursor characters to prevent background showing on typed text

## 0.1.2

- Clarified cursor rendering logic: only cursor position shows background, typed characters never show background

## 0.1.1

- Fixed cursor to display as a square block with white background
- Fixed black background to show on main typing screen (not just results)
- Removed border from results screen
- Fixed logo to display as plain "keysmasher" text

## 0.1.0

- Added black background for better contrast and modern look

## 0.0.9

- Centered typing text for balanced, aesthetically pleasing layout
- Fixed logo to use plain "keysmasher" text instead of Unicode characters

## 0.0.8

- Added 1 space above stats line for better visual separation

## 0.0.7

- Reduced default word count from 50 to 25 words for shorter, quicker tests

## 0.0.6

- Further reduced spacing between text and stats line by removing bottom padding from text box

## 0.0.5

- Reduced spacing between text and stats line for tighter layout

## 0.0.4

- Added idle time detection: timer pauses when no typing for more than 2 seconds
- Only active typing time is counted towards WPM and total time
- Timer automatically resumes when typing continues

## 0.0.3

- Updated @opentui/core and @opentui/react to 0.1.40
- Fixed color rendering by using `style={{ fg }}` prop syntax
- Added padding to stats numbers to prevent layout shift (WPM, accuracy, time)
- Improved cursor visibility with bright white color (#ffffff) instead of background change
- Changed logo to lowercase: keysmasher
- Added more spacing around bullet delimiters for better visual centering
- Increased typed text brightness to #e0e0e0 and dimmed untyped text to #333333 for maximum contrast
- Changed stats layout to use row with minWidth instead of padStart for better centering
- Fixed backspace: now properly removes error markers when deleting characters
- Added Alt+Backspace (Option+Backspace on Mac) support to delete entire words
- Added .gitignore file
- Reduced spacing between text and stats line for tighter layout
- Added "acc" label after accuracy percentage

## 0.0.2

- Improved color contrast: typed text now uses brighter gray (#a0a0a0) vs darker gray (#4a4a4a) for untyped
- Centered all content vertically and horizontally
- Removed border from typing area for cleaner look
- Consolidated stats into single line with bullet delimiters
- Added branding with special Unicode characters
- Stats now use low opacity (#666666) for subtle appearance
- Added Ctrl+C support to exit application

## 0.0.1

- Initial release
- Typing speed test with 50 random words
- Real-time WPM calculation
- Live accuracy tracking
- Error highlighting in red
- Results screen with detailed stats
- Quick restart with Enter key
