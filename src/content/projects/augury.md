---
title: Augury
hook: A web app that uses AI to help users decide which stocks to buy. I built most of the backend, including auth and the LLM integration.
stack: [Node, TypeScript, React, PostgreSQL, OpenAI]
team: 5-person team
repo: https://github.com/susansli/augury
order: 1
---

## The project

Augury helps users research stock picks with AI-generated suggestions and tracks the live value of their saved portfolios. We built it as a five-person team in an Nx monorepo: a Node REST API, a React/TypeScript frontend, PostgreSQL, and a Dockerized setup with CI through GitHub Actions.

## What I built

I built the majority of the backend:

- **Authentication:** Google OAuth sign-in, with JWT-based sessions protecting user accounts and their saved portfolios.
- **LLM integration:** the service that sends stock and portfolio context to OpenAI and turns its responses into the recommendations shown in the app, with credentials kept server-side.
- **The REST API** the frontend is built on, backed by PostgreSQL.

## Interesting problem: getting Google OAuth working

The hardest part was the Google OAuth flow itself. Two steps kept failing: the redirect URI, which has to match what's registered with Google exactly across local, Docker, and deployed environments, and the server-side exchange of the authorization code for tokens.

Getting both working meant understanding the whole handshake rather than copying a library example: redirecting to Google, receiving the authorization code, exchanging it for tokens, then issuing our own JWT session.

## How we worked

Test-driven development with Jest, documented architectural decisions, and code review in a shared monorepo.

[My commits](https://github.com/susansli/augury/commits?author=Bnocz)
