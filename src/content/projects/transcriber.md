---
title: Session Transcriber
hook: Turns hours of tabletop session audio into a searchable, timestamped transcript.
stack: [Python, Whisper API, pydub]
order: 3
# repo: https://github.com/Bnocz/REPO-NAME   <- uncomment once the repo is public
---

## The problem

Running a tabletop campaign means juggling a lot at once, and taking notes during play pulls you out of the game. I wanted to record sessions, get an accurate transcript afterward, and eventually turn it into a story-style recap my players could read between sessions.

## What it does

- Takes a full session recording and transcribes it with OpenAI's Whisper API.
- Outputs a transcript with `[HH:MM:SS]` timestamps, as plain text or JSON.
- Runs locally as a single Python script.

## How it works

Whisper's API caps uploads at 25MB, far below the size of a multi-hour session. The script uses pydub to split the audio into chunks, transcribes each one, and stitches the results back together with timestamps adjusted to the original recording.

## Interesting problem: where to cut

Cutting audio at fixed intervals can split a word in half, which hurts accuracy at every boundary. So the script splits on silence first, at natural pauses in conversation.

Some stretches have no clean pause (four people talking over each other is normal at a game table), so it falls back to fixed-size chunks when silence detection can't find a safe cut.

## What's next

Generating story-style recaps from the transcript: turning a raw record of who said what into a narrative players can actually enjoy reading.
