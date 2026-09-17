# Graph Report - .  (2026-09-17)

## Corpus Check
- 36 files · ~80,405 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 330 nodes · 320 edges · 28 communities (23 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.89)
- Token cost: 3,235 input · 4,330 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API Runtime Dependencies|API Runtime Dependencies]]
- [[_COMMUNITY_API Development Tooling|API Development Tooling]]
- [[_COMMUNITY_UI Runtime Dependencies|UI Runtime Dependencies]]
- [[_COMMUNITY_UI App TypeScript|UI App TypeScript]]
- [[_COMMUNITY_API TypeScript Compiler|API TypeScript Compiler]]
- [[_COMMUNITY_UI Node TypeScript|UI Node TypeScript]]
- [[_COMMUNITY_API Package Configuration|API Package Configuration]]
- [[_COMMUNITY_SolidX CRM Architecture|SolidX CRM Architecture]]
- [[_COMMUNITY_UI Development Tooling|UI Development Tooling]]
- [[_COMMUNITY_API Build Scripts|API Build Scripts]]
- [[_COMMUNITY_NestJS Application Bootstrap|NestJS Application Bootstrap]]
- [[_COMMUNITY_LeadTrack Domain Design|LeadTrack Domain Design]]
- [[_COMMUNITY_React Application Bootstrap|React Application Bootstrap]]
- [[_COMMUNITY_End-to-End Test Setup|End-to-End Test Setup]]
- [[_COMMUNITY_NestJS Build Setup|NestJS Build Setup]]
- [[_COMMUNITY_Development Watcher|Development Watcher]]
- [[_COMMUNITY_Frontend Brand Assets|Frontend Brand Assets]]
- [[_COMMUNITY_SolidX Menu Branding|SolidX Menu Branding]]
- [[_COMMUNITY_API Build Exclusions|API Build Exclusions]]
- [[_COMMUNITY_TypeScript Project References|TypeScript Project References]]
- [[_COMMUNITY_VS Code Debugging|VS Code Debugging]]
- [[_COMMUNITY_Vite Build Setup|Vite Build Setup]]
- [[_COMMUNITY_Warning Suppression|Warning Suppression]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 21 edges
2. `compilerOptions` - 19 edges
3. `compilerOptions` - 18 edges
4. `scripts` - 16 edges
5. `jest` - 8 edges
6. `scripts` - 8 edges
7. `Lead Model` - 8 edges
8. `Solid UI HTML Document` - 6 edges
9. `AppModule` - 5 edges
10. `FollowUpTask Model` - 5 edges

## Surprising Connections (you probably didn't know these)
- `React solid-core-ui Frontend` --conceptually_related_to--> `React TypeScript Vite Template`  [INFERRED]
  plan/plan.md → solid-ui/README.md
- `NestJS @solidxai/core Backend` --conceptually_related_to--> `NestJS`  [INFERRED]
  plan/plan.md → solid-api/README.md
- `Pastel Blue-Purple Gradient` --semantically_similar_to--> `Blue-Purple and Yellow Gradient Palette`  [INFERRED] [semantically similar]
  solid-ui/public/themes/solid-light-purple/solid-login-light.png → solid-ui/public/vite.svg
- `Solid UI HTML Document` --implements--> `React TypeScript Vite Template`  [INFERRED]
  solid-ui/index.html → solid-ui/README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Lead Ownership Security** — plan_sales_representative_role, plan_row_level_security, plan_lead_model, plan_crm_user [EXTRACTED 1.00]
- **Lead Activity Management** — plan_lead_model, plan_follow_up_task_model, plan_audit_entry, plan_activity_timeline [EXTRACTED 1.00]
- **SolidX CRM Application Stack** — plan_react_frontend, plan_nestjs_backend, plan_postgresql, plan_solidx_framework [EXTRACTED 1.00]

## Communities (28 total, 5 thin omitted)

### Community 0 - "API Runtime Dependencies"
Cohesion: 0.04
Nodes (52): dependencies, amqplib, @angular-devkit/core, @aws-sdk/client-s3, axios, bcrypt, bson, cache-manager (+44 more)

### Community 1 - "API Development Tooling"
Cohesion: 0.06
Nodes (34): devDependencies, copyfiles, eslint, eslint-config-prettier, eslint-plugin-prettier, jest, nest-cli, @nestjs/cli (+26 more)

### Community 2 - "UI Runtime Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, axios, react, react-dom, react-redux, react-router-dom, @reduxjs/toolkit, sass (+16 more)

### Community 3 - "UI App TypeScript"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+14 more)

### Community 4 - "API TypeScript Compiler"
Cohesion: 0.10
Nodes (19): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+11 more)

### Community 5 - "UI Node TypeScript"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+11 more)

### Community 6 - "API Package Configuration"
Cohesion: 0.11
Nodes (18): author, bin, solid, description, jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions (+10 more)

### Community 7 - "SolidX CRM Architecture"
Cohesion: 0.12
Nodes (17): Frontend main.tsx Entry Point, Google Material Symbols Fonts, React Root Element, Solid UI HTML Document, Solid Light Purple Theme, Vite Solid App Title Environment Variable, LeadTrack CRM, NestJS @solidxai/core Backend (+9 more)

### Community 8 - "UI Development Tooling"
Cohesion: 0.12
Nodes (17): devDependencies, autoprefixer, copyfiles, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+9 more)

### Community 9 - "API Build Scripts"
Cohesion: 0.12
Nodes (16): scripts, build, format, lint, postinstall, solidx:dev, start, start:debug (+8 more)

### Community 10 - "NestJS Application Bootstrap"
Cohesion: 0.17
Nodes (4): coreEntities, DefaultDBModule, AppModule, AppService

### Community 11 - "LeadTrack Domain Design"
Cohesion: 0.19
Nodes (14): Audit Activity Timeline, Admin Role, Audit Entry, CRM Module, CRM User Model, Follow-up Email Reminder Scheduler, FollowUpTask Model, Kanban Pipeline Board (+6 more)

### Community 12 - "React Application Bootstrap"
Cohesion: 0.33
Nodes (4): AppRoutes(), moduleImports, solidUiModuleRuntime, solidUiModules

### Community 13 - "End-to-End Test Setup"
Cohesion: 0.29
Nodes (6): moduleFileExtensions, rootDir, testEnvironment, testRegex, transform, ^.+\\.(t|j)s$

### Community 14 - "NestJS Build Setup"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 15 - "Development Watcher"
Cohesion: 0.33
Nodes (5): delay, exec, ext, ignore, watch

### Community 16 - "Frontend Brand Assets"
Cohesion: 0.33
Nodes (6): Light Login Background, Pastel Blue-Purple Gradient, Soft Glow Composition, Blue-Purple and Yellow Gradient Palette, Lightning Bolt Symbol, Vite Logo

### Community 17 - "SolidX Menu Branding"
Cohesion: 0.50
Nodes (4): Central Diamond Negative Space, Navigation Menu Control, SolidX Menu Icon, Stylized X Mark

## Knowledge Gaps
- **252 isolated node(s):** `version`, `configurations`, `$schema`, `collection`, `sourceRoot` (+247 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `API Runtime Dependencies` to `API Package Configuration`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `API Development Tooling` to `API Package Configuration`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `scripts` connect `API Build Scripts` to `API Package Configuration`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `version`, `configurations`, `$schema` to the rest of the system?**
  _252 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.038461538461538464 - nodes in this community are weakly interconnected._
- **Should `API Development Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `UI Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._