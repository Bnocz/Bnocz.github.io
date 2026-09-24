---
title: WaterMania
hook: A game where you play as a dolphin collecting starfish, built on our own C++ engine. I built the buoyancy system and enemy AI, and helped develop the engine's physics.
stack: [C++, CMake, Entity-Component-System]
team: 3-person team
repo: https://github.com/gandhis88/water-mania
order: 2
---

## The project

WaterMania is a game where you play as a dolphin collecting starfish while avoiding enemies. We built it as a three-person team on our own C++ engine, using an entity-component-system (ECS) architecture: entities are plain IDs, components hold data, and systems run the game logic over entities with the right components.

## What I built

- **Buoyancy system:** applies an upward force proportional to how deep an entity sits below the water's surface, so objects float and settle naturally.
- **Enemy AI:** enemies patrol their area and switch to chasing the player when they get close.
- **Engine physics:** contributed to the shared physics the other systems build on.

## Interesting problem: buoyancy on the wrong things

The first version of the buoyancy system applied its force to every entity with a physics body, including objects that should never float. We fixed it by adding a tagging system: entities that should be buoyant carry a tag, and the buoyancy system only processes tagged entities.

It's a small change, but it's how ECS is meant to work. Systems choose their entities by what they're made of, not by special-case checks inside the logic.

## What I'd do next

I'd like to add a level system and progression through stages eventually.

[My commits](https://github.com/gandhis88/water-mania/commits?author=Bnocz)
