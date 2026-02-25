# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Язык проекта — русский. Все ответы, комментарии, коммиты и документация должны быть на русском языке.

## Project Overview

Static HTML landing pages for lead magnets (free educational content) on olezhek28.courses. Each lead magnet is a self-contained directory with its own landing page and assets. The site is in Russian.

## Architecture

- Each lead magnet lives in its own directory (e.g., `architecture/`)
- Pages are standalone HTML files with inline CSS and minimal inline JS — no build tools, bundlers, or frameworks
- Each directory contains: `index.html` (landing page), `policy.html` (privacy policy), and image assets
- Font: Manrope (loaded from Google Fonts)
- Color scheme: dark theme (`#182023` background, `#dfdf41` accent yellow, `#ffffff` text)

## Development

Open any HTML file directly in a browser — no server or build step required. For local development with live reload, use any static file server (e.g., `python3 -m http.server` from the repo root).

## Conventions

- All CSS is inline within `<style>` tags in each HTML file (no external stylesheets)
- BEM-like class naming: `.block__element` pattern (e.g., `.hero__title`, `.card__desc`)
- Scroll animations use `IntersectionObserver` with `.fade-up` / `.visible` classes
- Responsive breakpoints: 960px (tablet), 640px (mobile)
- CTA buttons link to Telegram posts (`t.me/olezhek28go/`)
- Images are stored alongside HTML files in the same directory
