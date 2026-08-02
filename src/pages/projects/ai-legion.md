---
title: Personal AI Engineering System ("AI Legion")
tags: ["Claude Code", "MCP", "Node.js"]
date: 2026
---

Self-built multi-agent operating system coordinating 13 repos (personal products, internal tools) from one control plane.

- Built a custom MCP server from scratch (21 tools — task/intention tracking with recurring-habit and streak logic, Node.js).
- Runs as a fleet of persistent, purpose-named Claude Code sessions, each rooted in the same shared directory so it inherits full project history and personal goals context, plus mobile remote access for on-the-go use.
- For development work specifically, selectively directs subagents and picks models per task, up to full subagent-driven development with git-worktree isolation and staged review for larger changes.
- Actively maintained — 24 commits in the last 90 days on the core system alone.

[![My Skills](https://skillicons.dev/icons?i=nodejs,ts)](https://skillicons.dev)
