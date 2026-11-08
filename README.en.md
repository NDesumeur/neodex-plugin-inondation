# Inondation (Flood)

A colour puzzle: your patch starts in the corner of the grid, takes the colour you choose and swallows every neighbouring cell of that colour. Cover all 196 cells of the grid before running out of moves.

*Version française : [README.md](README.md)*

## Controls

- **Click a colour** in the palette, or **a cell** of that colour in the grid.
- Keys **1 to 6**: choose a colour with the keyboard.
- **Space** or a click after the end: next level (or replay the same one if you failed).

## Rules

- The grid has 14 × 14 cells in 6 colours. Your patch starts in the top-left corner, outlined in white.
- On each move, your whole patch takes the chosen colour and grows by every neighbouring cell of that colour, which become yours.
- You must cover the whole grid within the **allowed number of moves**, shown at the top (it turns red when three are left).
- Each colour also has its own engraved pattern, so they can be told apart without colour.

Tip: aim for the colours that open the most cells, and think about the big areas you can swallow later.

## The levels

- Level 1 allows 30 moves; every 4 levels there is one fewer, down to 22. Each solved grid opens the next level; the arrows go back to levels already reached.
- Each level always has the same grid, so you can retry it and beat your record. Tick **Random grids** to get a new one each game.

## Statistics

The Records panel shows the **furthest level** reached, your move **record** on the current level and your **grids solved** out of games played.

## Data and sync

Your level, records and settings are stored by NeoDex, backed up and synced between your PCs when sync is on.

## Install

In NeoDex: **NeoStore → Discover → Inondation → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
