# Graph Report - .  (2026-06-04)

## Corpus Check
- 16 files · ~29,851 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 560 nodes · 918 edges · 40 communities (36 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard & Analytics|Dashboard & Analytics]]
- [[_COMMUNITY_Core Dependencies|Core Dependencies]]
- [[_COMMUNITY_App Shell & Navigation|App Shell & Navigation]]
- [[_COMMUNITY_Development Tooling|Development Tooling]]
- [[_COMMUNITY_Routing & Entry Points|Routing & Entry Points]]
- [[_COMMUNITY_Database & Auth Services|Database & Auth Services]]
- [[_COMMUNITY_Internationalization & Contexts|Internationalization & Contexts]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Project Metadata|Project Metadata]]
- [[_COMMUNITY_Basic UI Elements|Basic UI Elements]]
- [[_COMMUNITY_Command & Dialog UI|Command & Dialog UI]]
- [[_COMMUNITY_Menubar Components|Menubar Components]]
- [[_COMMUNITY_UI Utilities & Calendar|UI Utilities & Calendar]]
- [[_COMMUNITY_Carousel Component|Carousel Component]]
- [[_COMMUNITY_Game & Teacher Routes|Game & Teacher Routes]]
- [[_COMMUNITY_Offline Sync & Database|Offline Sync & Database]]
- [[_COMMUNITY_Charting Components|Charting Components]]
- [[_COMMUNITY_Form Management|Form Management]]
- [[_COMMUNITY_Dropdown Menu UI|Dropdown Menu UI]]
- [[_COMMUNITY_Context Menu UI|Context Menu UI]]
- [[_COMMUNITY_Table Components|Table Components]]
- [[_COMMUNITY_Alert Dialog UI|Alert Dialog UI]]
- [[_COMMUNITY_Drawer UI|Drawer UI]]
- [[_COMMUNITY_Breadcrumb UI|Breadcrumb UI]]
- [[_COMMUNITY_Alert UI|Alert UI]]
- [[_COMMUNITY_Input OTP UI|Input OTP UI]]
- [[_COMMUNITY_Sandbox Settings|Sandbox Settings]]
- [[_COMMUNITY_Avatar UI|Avatar UI]]
- [[_COMMUNITY_Badge UI|Badge UI]]
- [[_COMMUNITY_Navigation Menu UI|Navigation Menu UI]]
- [[_COMMUNITY_Toggle & Group UI|Toggle & Group UI]]
- [[_COMMUNITY_Gemini Settings|Gemini Settings]]
- [[_COMMUNITY_Lovable Metadata|Lovable Metadata]]
- [[_COMMUNITY_Scroll Area UI|Scroll Area UI]]
- [[_COMMUNITY_Utility Scripts|Utility Scripts]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 66 edges
2. `useLang()` - 34 edges
3. `Language Context` - 24 edges
4. `compilerOptions` - 17 edges
5. `Carousel` - 16 edges
6. `api` - 14 edges
7. `Button` - 13 edges
8. `Pagination()` - 10 edges
9. `Card` - 9 edges
10. `CardHeader` - 9 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  src/lib/utils.ts → package.json
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `ContextMenuShortcut()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/context-menu.tsx → src/lib/utils.ts
- `DialogHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts

## Communities (40 total, 4 thin omitted)

### Community 0 - "Dashboard & Analytics"
Cohesion: 0.08
Nodes (56): AnalyticsPage(), Route, AnalyticsPanel(), ClassCard(), ClassesPanel(), DashboardPage(), QuizzesPanel(), ScenarioCreator() (+48 more)

### Community 1 - "Core Dependencies"
Cohesion: 0.04
Nodes (53): dependencies, class-variance-authority, @cloudflare/vite-plugin, cmdk, date-fns, dexie, embla-carousel-react, @hookform/resolvers (+45 more)

### Community 2 - "App Shell & Navigation"
Cohesion: 0.06
Nodes (41): AppSidebar(), useIsMobile(), useOnline(), OnlineBadge(), Route, Separator, SheetContent, SheetContentProps (+33 more)

### Community 3 - "Development Tooling"
Cohesion: 0.07
Nodes (28): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+20 more)

### Community 4 - "Routing & Entry Points"
Cohesion: 0.08
Nodes (24): Route, Route, LandingPage(), Route, router, getRouter(), AuthenticatedAnalyticsRoute, AuthenticatedDashboardRoute (+16 more)

### Community 5 - "Database & Auth Services"
Cohesion: 0.11
Nodes (18): Database, Json, Class, db, Scenario, Student, api, CategoryRow (+10 more)

### Community 6 - "Internationalization & Contexts"
Cohesion: 0.10
Nodes (15): Root Route, LanguageContextType, TranslationDict, StudentContextType, StudentDetails, StudentProvider(), Language Context, Ctx (+7 more)

### Community 7 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 8 - "Project Metadata"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 9 - "Basic UI Elements"
Cohesion: 0.11
Nodes (11): AccordionContent, AccordionItem, AccordionTrigger, Checkbox, HoverCardContent, PopoverContent, RadioGroup, Skeleton() (+3 more)

### Community 10 - "Command & Dialog UI"
Cohesion: 0.12
Nodes (14): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut() (+6 more)

### Community 11 - "Menubar Components"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 12 - "UI Utilities & Calendar"
Cohesion: 0.19
Nodes (14): clsx, cn(), ButtonProps, buttonVariants, Calendar(), CalendarDayButton(), Pagination(), PaginationContent (+6 more)

### Community 13 - "Carousel Component"
Cohesion: 0.15
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 14 - "Game & Teacher Routes"
Cohesion: 0.19
Nodes (13): Teacher Analytics Route, Teacher Dashboard Route, Authenticated Layout Route, Teacher Settings Route, Game Lobby Route, Scenario Runner Route, Guest Lobby Route, Landing Page Route (+5 more)

### Community 15 - "Offline Sync & Database"
Cohesion: 0.23
Nodes (9): CyberDB, getDB(), QueuedResult, db.ts (offline), Ctx, OfflineCtx, enqueueResult(), flushQueue() (+1 more)

### Community 16 - "Charting Components"
Cohesion: 0.18
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 17 - "Form Management"
Cohesion: 0.18
Nodes (8): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormLabel, FormMessage

### Community 18 - "Dropdown Menu UI"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 19 - "Context Menu UI"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 20 - "Table Components"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 21 - "Alert Dialog UI"
Cohesion: 0.22
Nodes (8): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle

### Community 22 - "Drawer UI"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 23 - "Breadcrumb UI"
Cohesion: 0.33
Nodes (5): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator()

### Community 24 - "Alert UI"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 25 - "Input OTP UI"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 26 - "Sandbox Settings"
Cohesion: 0.50
Nodes (3): sandbox, autoAllowBashIfSandboxed, enabled

### Community 27 - "Avatar UI"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 28 - "Badge UI"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

### Community 29 - "Navigation Menu UI"
Cohesion: 0.50
Nodes (4): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuViewport

### Community 30 - "Toggle & Group UI"
Cohesion: 0.67
Nodes (3): ToggleGroup, Toggle, toggleVariants

## Knowledge Gaps
- **300 isolated node(s):** `name`, `private`, `sideEffects`, `type`, `dev` (+295 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Utilities & Calendar` to `Dashboard & Analytics`, `App Shell & Navigation`, `Basic UI Elements`, `Command & Dialog UI`, `Menubar Components`, `Carousel Component`, `Charting Components`, `Form Management`, `Dropdown Menu UI`, `Context Menu UI`, `Table Components`, `Alert Dialog UI`, `Drawer UI`, `Breadcrumb UI`, `Alert UI`, `Input OTP UI`, `Avatar UI`, `Badge UI`, `Navigation Menu UI`, `Toggle & Group UI`, `Scroll Area UI`?**
  _High betweenness centrality (0.401) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Core Dependencies` to `Development Tooling`, `UI Utilities & Calendar`?**
  _High betweenness centrality (0.231) - this node is a cross-community bridge._
- **Why does `clsx` connect `UI Utilities & Calendar` to `Core Dependencies`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **What connects `name`, `private`, `sideEffects` to the rest of the system?**
  _300 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard & Analytics` be split into smaller, more focused modules?**
  _Cohesion score 0.07567567567567568 - nodes in this community are weakly interconnected._
- **Should `Core Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03773584905660377 - nodes in this community are weakly interconnected._
- **Should `App Shell & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.060408163265306125 - nodes in this community are weakly interconnected._