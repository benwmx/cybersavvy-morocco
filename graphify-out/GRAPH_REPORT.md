# Graph Report - .  (2026-05-22)

## Corpus Check
- Corpus is ~27,715 words - fits in a single context window. You may not need a graph.

## Summary
- 582 nodes · 920 edges · 44 communities (39 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFilia topuria copying conor mcgregorERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 93,906 input · 5,431 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard & Analytics|Dashboard & Analytics]]
- [[_COMMUNITY_Core Dependencies|Core Dependencies]]
- [[_COMMUNITY_App Shell & Navigation|App Shell & Navigation]]
- [[_COMMUNITY_Routing Logic|Routing Logic]]
- [[_COMMUNITY_Development Tooling|Development Tooling]]
- [[_COMMUNITY_Internationalization (i18n)|Internationalization (i18n)]]
- [[_COMMUNITY_UI Utility Components|UI Utility Components]]
- [[_COMMUNITY_Basic UI Elements|Basic UI Elements]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Project Metadata|Project Metadata]]
- [[_COMMUNITY_Menubar Components|Menubar Components]]
- [[_COMMUNITY_Command & Dialog UI|Command & Dialog UI]]
- [[_COMMUNITY_Carousel Component|Carousel Component]]
- [[_COMMUNITY_Game & Teacher Routes|Game & Teacher Routes]]
- [[_COMMUNITY_Data & Localization Libs|Data & Localization Libs]]
- [[_COMMUNITY_Form Management|Form Management]]
- [[_COMMUNITY_Charting Components|Charting Components]]
- [[_COMMUNITY_Context Menu UI|Context Menu UI]]
- [[_COMMUNITY_Dropdown Menu UI|Dropdown Menu UI]]
- [[_COMMUNITY_Offline Database & Sync|Offline Database & Sync]]
- [[_COMMUNITY_Table Components|Table Components]]
- [[_COMMUNITY_Alert Dialog UI|Alert Dialog UI]]
- [[_COMMUNITY_Navigation Menu UI|Navigation Menu UI]]
- [[_COMMUNITY_Breadcrumb UI|Breadcrumb UI]]
- [[_COMMUNITY_Drawer UI|Drawer UI]]
- [[_COMMUNITY_Toggle & Group UI|Toggle & Group UI]]
- [[_COMMUNITY_Data Models (db.ts)|Data Models (db.ts)]]
- [[_COMMUNITY_Alert UI|Alert UI]]
- [[_COMMUNITY_Input OTP UI|Input OTP UI]]
- [[_COMMUNITY_Accordion UI|Accordion UI]]
- [[_COMMUNITY_Avatar UI|Avatar UI]]
- [[_COMMUNITY_Badge UI|Badge UI]]
- [[_COMMUNITY_Environment Settings|Environment Settings]]
- [[_COMMUNITY_Lovable Project Metadata|Lovable Project Metadata]]
- [[_COMMUNITY_Utility Scripts|Utility Scripts]]
- [[_COMMUNITY_Root Contexts|Root Contexts]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 70 edges
2. `useLang()` - 36 edges
3. `compilerOptions` - 17 edges
4. `Button` - 13 edges
5. `api` - 10 edges
6. `Card` - 9 edges
7. `CardHeader` - 9 edges
8. `CardTitle` - 9 edges
9. `CardContent` - 9 edges
10. `Supabase API Client` - 8 edges

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

## Communities (44 total, 5 thin omitted)

### Community 0 - "Dashboard & Analytics"
Cohesion: 0.07
Nodes (62): AnalyticsPage(), Route, ClassCard(), ClassesPanel(), DashboardPage(), QuizzesPanel(), ScenarioCreator(), StudentsPanel() (+54 more)

### Community 1 - "Core Dependencies"
Cohesion: 0.04
Nodes (54): dependencies, class-variance-authority, @cloudflare/vite-plugin, cmdk, date-fns, dexie, embla-carousel-react, @hookform/resolvers (+46 more)

### Community 2 - "App Shell & Navigation"
Cohesion: 0.06
Nodes (39): AppSidebar(), useIsMobile(), Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader() (+31 more)

### Community 3 - "Routing Logic"
Cohesion: 0.06
Nodes (32): Route, Route, Route, Route, Route, Route, LandingPage(), Route (+24 more)

### Community 4 - "Development Tooling"
Cohesion: 0.06
Nodes (29): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+21 more)

### Community 5 - "Internationalization (i18n)"
Cohesion: 0.10
Nodes (14): MediaPlaceholder(), LanguageContext, LanguageContextType, TranslationDict, Ctx, LangCtx, LanguageProvider(), Lang (+6 more)

### Community 6 - "UI Utility Components"
Cohesion: 0.16
Nodes (17): clsx, cn(), ButtonProps, buttonVariants, Calendar(), CalendarDayButton(), Pagination(), PaginationContent (+9 more)

### Community 7 - "Basic UI Elements"
Cohesion: 0.10
Nodes (11): Checkbox, HoverCardContent, PopoverContent, Progress, RadioGroup, RadioGroupItem, ScrollArea, ScrollBar (+3 more)

### Community 8 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 9 - "Project Metadata"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 10 - "Menubar Components"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 11 - "Command & Dialog UI"
Cohesion: 0.12
Nodes (14): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut() (+6 more)

### Community 12 - "Carousel Component"
Cohesion: 0.14
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 13 - "Game & Teacher Routes"
Cohesion: 0.19
Nodes (13): Teacher Analytics Route, Teacher Dashboard Route, Authenticated Layout Route, Teacher Settings Route, Game Lobby Route, Scenario Runner Route, Guest Lobby Route, Landing Page Route (+5 more)

### Community 15 - "Form Management"
Cohesion: 0.17
Nodes (9): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+1 more)

### Community 16 - "Charting Components"
Cohesion: 0.18
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 17 - "Context Menu UI"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 18 - "Dropdown Menu UI"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 19 - "Offline Database & Sync"
Cohesion: 0.36
Nodes (6): CyberDB, getDB(), QueuedResult, enqueueResult(), flushQueue(), saveResult()

### Community 20 - "Table Components"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 21 - "Alert Dialog UI"
Cohesion: 0.22
Nodes (8): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle

### Community 22 - "Navigation Menu UI"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 23 - "Breadcrumb UI"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 24 - "Drawer UI"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 25 - "Toggle & Group UI"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 26 - "Data Models (db.ts)"
Cohesion: 0.40
Nodes (4): Class, db, Scenario, Student

### Community 27 - "Alert UI"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 28 - "Input OTP UI"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 30 - "Accordion UI"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 31 - "Avatar UI"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 32 - "Badge UI"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

## Knowledge Gaps
- **314 isolated node(s):** `name`, `private`, `sideEffects`, `type`, `dev` (+309 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Utility Components` to `Dashboard & Analytics`, `App Shell & Navigation`, `Basic UI Elements`, `Menubar Components`, `Command & Dialog UI`, `Carousel Component`, `Form Management`, `Charting Components`, `Context Menu UI`, `Dropdown Menu UI`, `Table Components`, `Alert Dialog UI`, `Navigation Menu UI`, `Breadcrumb UI`, `Drawer UI`, `Toggle & Group UI`, `Alert UI`, `Input OTP UI`, `Accordion UI`, `Avatar UI`, `Badge UI`?**
  _High betweenness centrality (0.395) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Core Dependencies` to `Development Tooling`, `UI Utility Components`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **Why does `clsx` connect `UI Utility Components` to `Core Dependencies`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **What connects `name`, `private`, `sideEffects` to the rest of the system?**
  _314 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard & Analytics` be split into smaller, more focused modules?**
  _Cohesion score 0.06750700280112044 - nodes in this community are weakly interconnected._
- **Should `Core Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.037037037037037035 - nodes in this community are weakly interconnected._
- **Should `App Shell & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.06363636363636363 - nodes in this community are weakly interconnected._